import { InlineKeyboard, type AnyBot } from "gramio";
import { db } from "../db/index.ts";
import { and, eq } from "drizzle-orm";
import { UserRepository } from "../repositories/UserRepository.ts";
import { WalletRepository } from "../repositories/WalletRepository.ts";
import { PaymentRepository } from "../repositories/PaymentRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { config } from "../config.ts";
import { ticketState, ticketReplyState } from "./support-tickets.ts";
import { ReplyError } from "ioredis";
import {
  nowpaymentsWalletPaymentsTable,
  walletTopupsTable,
  walletTransactionsTable,
  zarinpalWalletPaymentsTable,
  type NowpaymentsWalletPayment,
  usersTable,
  type PaymentSettings,
  type ZarinpalWalletPayment,
} from "../db/schema.ts";
import { cancelKeyboard } from "../shared/keyboards/back.ts";
import { emojiIds } from "../shared/locales/emojies.ts";

// ─────────────────────────────────────────────────────────
// State Management
// ─────────────────────────────────────────────────────────

type RechargeMethod = "card" | "zarinpal" | "crypto";

type RechargeState =
  | { step: "enter_amount" }
  | { step: "select_method"; amount: number }
  | { step: "waiting_receipt"; amount: number }
  | {
      step: "waiting_nowpayments";
      amount: number;
      walletPaymentId: number;
      paymentUrl: string;
    }
  | {
      step: "waiting_zarinpal";
      amount: number;
      walletPaymentId: number;
      paymentUrl: string;
    };

const rechargeState = new Map<number, RechargeState>();

export function clearRechargeState(userId: number) {
  rechargeState.delete(userId);
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const MIN_AMOUNT = 10_000;
const MAX_AMOUNT = 50_000_000;

function formatNum(n: number): string {
  return n.toLocaleString("fa-IR");
}

function normalizeZarinpalCallbackUrl(url: string | null | undefined) {
  const normalized = url?.trim();
  return normalized ? normalized : null;
}

function buildZarinpalGatewayUrls(settings: PaymentSettings) {
  return {
    requestUrl: settings.zarinpalSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      : "https://api.zarinpal.com/pg/v4/payment/request.json",
    verifyUrl: settings.zarinpalSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      : "https://api.zarinpal.com/pg/v4/payment/verify.json",
    startPayUrl: settings.zarinpalSandbox
      ? "https://sandbox.zarinpal.com/pg/StartPay/"
      : "https://www.zarinpal.com/pg/StartPay/",
  };
}

function buildWalletZarinpalCallbackUrl(baseUrl: string, paymentId: number) {
  const url = new URL(baseUrl);
  url.searchParams.set("walletPaymentId", String(paymentId));
  return url.toString();
}

function normalizeNowpaymentsPayCurrency(settings: PaymentSettings) {
  if (settings.nowpaymentsPayCurrency?.trim()) {
    return settings.nowpaymentsPayCurrency.trim().toLowerCase();
  }

  const network = (settings.cryptoNetwork ?? "TRC20").toUpperCase();
  if (network === "ERC20") return "usdterc20";
  if (network === "BEP20") return "usdtbsc";
  return "usdttrc20";
}

function buildNowpaymentsIpnUrl(baseUrl: string, walletPaymentId: number) {
  const url = new URL(baseUrl);
  url.searchParams.set("walletPaymentId", String(walletPaymentId));
  return url.toString();
}

function buildZarinpalVerificationKeyboard(
  t: ReturnType<typeof i18n.buildT>,
  paymentUrl: string | null | undefined,
  walletPaymentId: number,
) {
  const keyboard = new InlineKeyboard();

  if (paymentUrl) {
    keyboard.url(t("btnPayNow"), paymentUrl).row();
  }

  keyboard
    .text(t("btnVerifyPayment"), `recharge_verify_zarinpal:${walletPaymentId}`)
    .row()
    .text(t("btnCancel"), "recharge_cancel");

  return keyboard;
}

async function createPendingZarinpalWalletPayment(opts: {
  userId: number;
  amount: number;
}) {
  const [payment] = await db
    .insert(zarinpalWalletPaymentsTable)
    .values({
      userId: opts.userId,
      amount: opts.amount.toFixed(2),
      status: "pending",
      updatedAt: new Date(),
    })
    .returning();

  return payment;
}

async function createPendingNowpaymentsWalletPayment(opts: {
  userId: number;
  amount: number;
  payCurrency: string;
}) {
  const orderId = `wallet-${opts.userId}-${Date.now()}-${Math.floor(
    Math.random() * 1_000_000,
  )}`;

  const [payment] = await db
    .insert(nowpaymentsWalletPaymentsTable)
    .values({
      userId: opts.userId,
      amount: opts.amount.toFixed(2),
      orderId,
      payCurrency: opts.payCurrency,
      paymentStatus: "waiting",
      updatedAt: new Date(),
    })
    .returning();

  return payment;
}

async function attachNowpaymentsWalletGatewayRequest(opts: {
  paymentId: number;
  nowpaymentsPaymentId: string;
  payAddress: string | null;
  payAmount: string | null;
  paymentUrl: string | null;
  paymentStatus: string;
}) {
  const [payment] = await db
    .update(nowpaymentsWalletPaymentsTable)
    .set({
      nowpaymentsPaymentId: opts.nowpaymentsPaymentId,
      payAddress: opts.payAddress,
      payAmount: opts.payAmount,
      paymentUrl: opts.paymentUrl,
      paymentStatus: opts.paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(nowpaymentsWalletPaymentsTable.id, opts.paymentId))
    .returning();

  return payment;
}

async function markNowpaymentsWalletPaymentFailed(paymentId: number) {
  await db
    .update(nowpaymentsWalletPaymentsTable)
    .set({ paymentStatus: "failed", updatedAt: new Date() })
    .where(eq(nowpaymentsWalletPaymentsTable.id, paymentId));
}

async function getNowpaymentsWalletPaymentForUser(
  paymentId: number,
  userId: number,
) {
  const [payment] = await db
    .select()
    .from(nowpaymentsWalletPaymentsTable)
    .where(
      and(
        eq(nowpaymentsWalletPaymentsTable.id, paymentId),
        eq(nowpaymentsWalletPaymentsTable.userId, userId),
      ),
    )
    .limit(1);

  return payment;
}

async function refreshNowpaymentsWalletPaymentStatus(opts: {
  settings: PaymentSettings;
  payment: NowpaymentsWalletPayment;
}) {
  if (!opts.settings.nowpaymentsApiKey || !opts.payment.nowpaymentsPaymentId) {
    throw new Error("NOWPayments API key/payment id is missing");
  }

  const resp = await fetch(
    `https://api.nowpayments.io/v1/payment/${opts.payment.nowpaymentsPaymentId}`,
    {
      method: "GET",
      headers: {
        "x-api-key": opts.settings.nowpaymentsApiKey,
      },
      signal: AbortSignal.timeout(10_000),
    },
  );

  const data = (await resp.json()) as any;
  const paymentStatus = String(
    data?.payment_status ?? opts.payment.paymentStatus,
  );

  const [updated] = await db
    .update(nowpaymentsWalletPaymentsTable)
    .set({
      paymentStatus,
      payAddress:
        data?.pay_address !== undefined
          ? String(data.pay_address)
          : opts.payment.payAddress,
      payAmount:
        data?.pay_amount !== undefined
          ? String(data.pay_amount)
          : opts.payment.payAmount,
      callbackPayload: data,
      updatedAt: new Date(),
    })
    .where(eq(nowpaymentsWalletPaymentsTable.id, opts.payment.id))
    .returning();

  return {
    paymentStatus,
    updatedPayment: updated,
  };
}

async function creditNowpaymentsWalletPayment(
  bot: AnyBot,
  payment: NowpaymentsWalletPayment,
) {
  if (payment.creditedAt) {
    return { alreadyCredited: true };
  }

  let credited = false;

  await db.transaction(async (tx) => {
    const [freshPayment] = await tx
      .select()
      .from(nowpaymentsWalletPaymentsTable)
      .where(eq(nowpaymentsWalletPaymentsTable.id, payment.id))
      .limit(1);

    if (!freshPayment || freshPayment.creditedAt) {
      return;
    }

    const [freshUser] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, freshPayment.userId))
      .limit(1);

    if (!freshUser) {
      throw new Error(
        "User not found while finalizing NOWPayments wallet payment",
      );
    }

    const amount = parseFloat(String(freshPayment.amount ?? "0"));
    const currentBalance = parseFloat(String(freshUser.walletBalance ?? "0"));
    const newBalance = parseFloat((currentBalance + amount).toFixed(2));

    await tx
      .update(usersTable)
      .set({ walletBalance: newBalance.toFixed(2), updatedAt: new Date() })
      .where(eq(usersTable.id, freshUser.id));

    await tx.insert(walletTransactionsTable).values({
      userId: freshUser.id,
      amount: amount.toFixed(2),
      type: "credit",
      source: "recharge",
      description: `NOWPayments wallet recharge (#${freshPayment.id}) - Payment ID: ${freshPayment.nowpaymentsPaymentId ?? "-"}`,
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
    });

    await tx
      .update(nowpaymentsWalletPaymentsTable)
      .set({
        paymentStatus: "finished",
        creditedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(nowpaymentsWalletPaymentsTable.id, freshPayment.id));

    credited = true;
  });

  if (credited) {
    await notifyRechargeApplied(
      bot,
      payment.userId,
      parseFloat(String(payment.amount ?? "0")),
    );
  }

  return { alreadyCredited: !credited };
}

async function attachZarinpalWalletGatewayRequest(opts: {
  paymentId: number;
  authority: string;
  paymentUrl: string;
  callbackUrl: string;
}) {
  const [payment] = await db
    .update(zarinpalWalletPaymentsTable)
    .set({
      authority: opts.authority,
      paymentUrl: opts.paymentUrl,
      callbackUrl: opts.callbackUrl,
      updatedAt: new Date(),
    })
    .where(eq(zarinpalWalletPaymentsTable.id, opts.paymentId))
    .returning();

  return payment;
}

async function markZarinpalWalletPaymentFailed(paymentId: number) {
  await db
    .update(zarinpalWalletPaymentsTable)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(zarinpalWalletPaymentsTable.id, paymentId));
}

async function getZarinpalWalletPaymentForUser(
  paymentId: number,
  userId: number,
) {
  const [payment] = await db
    .select()
    .from(zarinpalWalletPaymentsTable)
    .where(
      and(
        eq(zarinpalWalletPaymentsTable.id, paymentId),
        eq(zarinpalWalletPaymentsTable.userId, userId),
      ),
    )
    .limit(1);

  return payment;
}

async function markZarinpalWalletPaymentVerified(
  paymentId: number,
  refId: string,
) {
  const [payment] = await db
    .update(zarinpalWalletPaymentsTable)
    .set({
      status: "verified",
      refId,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(zarinpalWalletPaymentsTable.id, paymentId))
    .returning();

  return payment;
}

async function verifyZarinpalWalletAuthority(opts: {
  settings: PaymentSettings;
  amount: number;
  authority: string;
}) {
  const { verifyUrl } = buildZarinpalGatewayUrls(opts.settings);
  const resp = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: opts.settings.zarinpalMerchantId,
      amount: Math.round(opts.amount) * 10,
      authority: opts.authority,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await resp.json()) as any;
  return {
    code: data?.data?.code ?? -1,
    refId:
      data?.data?.ref_id !== undefined
        ? String(data.data.ref_id)
        : opts.authority,
  };
}

async function notifyRechargeApplied(
  bot: AnyBot,
  userId: number,
  amount: number,
) {
  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode || "fa");

  try {
    await (bot.api as any).sendMessage({
      chat_id: userId,
      text: t("rechargeApproved", formatNum(amount)),
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
    });
  } catch (err) {
    console.error("[wallet-recharge] applyRecharge notify error:", err);
  }
}

async function creditZarinpalWalletPayment(
  bot: AnyBot,
  payment: ZarinpalWalletPayment,
  refId: string,
) {
  if (payment.status === "credited") {
    return { alreadyCredited: true };
  }

  let credited = false;

  await db.transaction(async (tx) => {
    const [freshPayment] = await tx
      .select()
      .from(zarinpalWalletPaymentsTable)
      .where(eq(zarinpalWalletPaymentsTable.id, payment.id))
      .limit(1);

    if (!freshPayment || freshPayment.status === "credited") {
      return;
    }

    const [freshUser] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, freshPayment.userId))
      .limit(1);

    if (!freshUser) {
      throw new Error(
        "User not found while finalizing ZarinPal wallet payment",
      );
    }

    const amount = parseFloat(String(freshPayment.amount ?? "0"));
    const currentBalance = parseFloat(String(freshUser.walletBalance ?? "0"));
    const newBalance = parseFloat((currentBalance + amount).toFixed(2));

    await tx
      .update(usersTable)
      .set({ walletBalance: newBalance.toFixed(2), updatedAt: new Date() })
      .where(eq(usersTable.id, freshUser.id));

    await tx.insert(walletTransactionsTable).values({
      userId: freshUser.id,
      amount: amount.toFixed(2),
      type: "credit",
      source: "recharge",
      description: `Zarinpal wallet recharge (#${freshPayment.id}) - RefId: ${refId}`,
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
    });

    await tx
      .update(zarinpalWalletPaymentsTable)
      .set({
        status: "credited",
        refId,
        verifiedAt: freshPayment.verifiedAt ?? new Date(),
        creditedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(zarinpalWalletPaymentsTable.id, freshPayment.id));

    credited = true;
  });

  if (credited) {
    await notifyRechargeApplied(
      bot,
      payment.userId,
      parseFloat(String(payment.amount ?? "0")),
    );
  }

  return { alreadyCredited: !credited };
}

/** قیمت لحظه‌ای USDT به تومان — Nobitex اول، Wallex fallback */
async function fetchUsdtRate(): Promise<number | null> {
  // ── منبع ۱: نوبیتکس ──────────────────────────────────
  try {
    const res = await fetch(
      "https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=irt",
      { signal: AbortSignal.timeout(6000) },
    );
    if (res.ok) {
      const data = (await res.json()) as any;
      const stat = data?.stats?.["usdt-irt"];
      // Nobitex fields: latest, mark, bestSell, bestBuy
      const price = parseFloat(
        stat?.latest ?? stat?.mark ?? stat?.bestSell ?? "0",
      );
      if (price > 0) return price;
    }
  } catch {}

  // ── منبع ۲: والکس ────────────────────────────────────
  try {
    const res = await fetch("https://api.wallex.ir/v1/markets", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const stat = data?.result?.symbols?.USDTTMN;
      const price = parseFloat(stat?.stats?.lastPrice ?? "0");
      if (price > 0) return price;
    }
  } catch {}

  return null;
}

async function notifyAdmin(
  bot: AnyBot,
  opts: {
    userId: number;
    username: string | null;
    firstName: string | null;
    amount: number;
    method: RechargeMethod;
    evidence: string;
    evidenceType: "photo" | "text";
    usdtAmount?: number;
  },
) {
  if (!config.SUPPORT_GROUP_ID) return;
  const topicId = config.PAYMENTS_TOPIC_ID ?? config.ORDERS_TOPIC_ID;

  const userLabel = opts.username
    ? `@${opts.username}`
    : opts.firstName || "کاربر";

  const methodLabel =
    opts.method === "card"
      ? "💳 کارت بانکی"
      : opts.method === "crypto"
        ? "🪙 کریپتو (USDT)"
        : "💰 زرین‌پال";

  const t = i18n.buildT("en");
  let msg = t(
    "adminConfirmRechargeMsg",
    userLabel,
    opts,
    formatNum,
    methodLabel,
  );

  if (opts.usdtAmount) {
    msg += `🪙 معادل: <b>${opts.usdtAmount.toFixed(4)}</b> USDT\n`;
  }
  msg += `\n⏰ ${new Date().toLocaleString("en-GB")}`;

  const mc =
    opts.method === "zarinpal" ? "z" : opts.method === "crypto" ? "k" : "c";
  const approveData = `ra:${opts.userId}:${opts.amount}:${mc}`;
  const rejectData = `rr:${opts.userId}:${opts.amount}:${mc}`;

  const keyboard = new InlineKeyboard()
    .text("✅ Approve", approveData)
    .text("❌ Reject", rejectData);

  try {
    if (opts.evidenceType === "photo") {
      await (bot.api as any).sendPhoto({
        chat_id: Number(config.SUPPORT_GROUP_ID),
        message_thread_id: topicId,
        photo: opts.evidence,
        caption: msg,
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } else {
      await (bot.api as any).sendMessage({
        chat_id: Number(config.SUPPORT_GROUP_ID),
        message_thread_id: topicId,
        text: msg + `\n\n🔗 <b>TxID:</b>\n<code>${opts.evidence}</code>`,
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    }
  } catch (err) {
    console.error("[wallet-recharge] notifyAdmin error:", err);
  }
}

async function createPendingCardTopup(opts: {
  userId: number;
  amount: number;
  receiptFileId: string;
}) {
  const [topup] = await db
    .insert(walletTopupsTable)
    .values({
      userId: opts.userId,
      amount: opts.amount.toString() as any,
      currency: "IRR",
      receiptPath: `telegram-file-id:${opts.receiptFileId}`,
      status: "pending",
    })
    .returning();

  return topup;
}

/** اعمال شارژ و اطلاع به کاربر */
async function applyRecharge(
  bot: AnyBot,
  userId: number,
  amount: number,
  method: RechargeMethod,
  description: string,
) {
  await UserRepository.updateWalletBalance(userId, amount, "add");
  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "recharge",
    description,
  );

  await notifyRechargeApplied(bot, userId, amount);
}

// ─────────────────────────────────────────────────────────
// Main Setup
// ─────────────────────────────────────────────────────────

export function setupWalletRechargeScene(bot: AnyBot) {
  bot.callbackQuery("wallet_recharge", async (ctx) => {
    const user = await UserRepository.findById(ctx.from.id);
    const t = i18n.buildT(user?.languageCode || "fa");

    rechargeState.set(ctx.from.id, { step: "enter_amount" });

    await ctx.editText(
      `${t("rechargeWalletTitle")}\n\n` +
        `${t("rechargeEnterAmount")}\n\n` +
        `${t("rechargeMinAmount", formatNum(MIN_AMOUNT))}\n` +
        `${t("rechargeMaxAmount", formatNum(MAX_AMOUNT))}`,
      {
        reply_markup: cancelKeyboard(t, "wallet"),
        parse_mode: "HTML",
      },
    );
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("recharge_card", async (ctx) => {
    const userId = ctx.from.id;
    const state = rechargeState.get(userId);
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (!state || state.step !== "select_method") {
      await ctx.answerCallbackQuery({
        text: t("rechargeSessionExpired"),
        show_alert: true,
      });
      return;
    }

    const [settings, cards] = await Promise.all([
      PaymentRepository.getSettings(),
      PaymentRepository.getActiveCards(),
    ]);

    if (!settings?.cardEnabled || cards.length === 0) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

    let cardsText = "";
    for (const c of cards) {
      cardsText += `\n<code>${c.cardNumber}</code>\n👤 ${c.holderName}`;
      if (c.bankName) cardsText += ` — ${c.bankName}`;
      cardsText += "\n";
    }

    rechargeState.set(userId, {
      step: "waiting_receipt",
      amount: state.amount,
    });

    await ctx.editText(
      `${t("rechargeCardTitle")}\n\n` +
        `${t("rechargeAmount", formatNum(state.amount))}\n\n` +
        `💳 <b>${t("rechargeCardNumbers")}</b>\n${cardsText}\n` +
        `📸 ${t("rechargeCardSendReceipt")}`,
      {
        reply_markup: cancelKeyboard(t, "recharge_cancel"),
        parse_mode: "HTML",
      },
    );
    await ctx.answerCallbackQuery();
  });

  // ── 3. زرین‌پال ────────────────────────────────────────
  bot.callbackQuery("recharge_zarinpal", async (ctx) => {
    const userId = ctx.from.id;
    const state = rechargeState.get(userId);
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (!state || state.step !== "select_method") {
      await ctx.answerCallbackQuery({
        text: t("rechargeSessionExpired"),
        show_alert: true,
      });
      return;
    }

    const settings = await PaymentRepository.getSettings();
    const callbackBaseUrl = normalizeZarinpalCallbackUrl(
      settings?.zarinpalCallbackUrl,
    );
    if (
      !settings?.zarinpalEnabled ||
      !settings.zarinpalMerchantId ||
      !callbackBaseUrl
    ) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery();

    const { requestUrl, startPayUrl } = buildZarinpalGatewayUrls(settings);
    let walletPaymentId: number | null = null;

    try {
      const payment = await createPendingZarinpalWalletPayment({
        userId,
        amount: state.amount,
      });
      walletPaymentId = payment.id;

      const callbackUrl = buildWalletZarinpalCallbackUrl(
        callbackBaseUrl,
        payment.id,
      );

      const resp = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: settings.zarinpalMerchantId,
          amount: state.amount * 10, // تومان به ریال
          description: `شارژ کیف پول - کاربر ${userId}`,
          callback_url: callbackUrl,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await resp.json()) as any;
      if (data?.data?.code !== 100)
        throw new Error(JSON.stringify(data?.errors));

      const authority: string = data.data.authority;
      const paymentUrl = startPayUrl + authority;

      await attachZarinpalWalletGatewayRequest({
        paymentId: payment.id,
        authority,
        paymentUrl,
        callbackUrl,
      });

      rechargeState.set(userId, {
        step: "waiting_zarinpal",
        amount: state.amount,
        walletPaymentId: payment.id,
        paymentUrl,
      });

      await ctx.editText(
        `${t("rechargeZarinpalTitle")}\n\n` +
          `${t("rechargeAmount", formatNum(state.amount))}\n\n` +
          `${t("rechargeZarinpalInstructions")}`,
        {
          reply_markup: buildZarinpalVerificationKeyboard(
            t,
            paymentUrl,
            payment.id,
          ),
          parse_mode: "HTML",
        },
      );
    } catch (err) {
      if (walletPaymentId) {
        await markZarinpalWalletPaymentFailed(walletPaymentId).catch(
          (updateError) => {
            console.error(
              "[wallet-recharge] failed to update zarinpal payment after request error:",
              updateError,
            );
          },
        );
      }
      console.error("[wallet-recharge] Zarinpal request error:", err);
      await ctx.editText(t("rechargeZarinpalFailed"), {
        reply_markup: new InlineKeyboard().text(t("btnCancel"), "wallet"),
        parse_mode: "HTML",
      });
    }
  });

  // ── 4. کریپتو USDT ─────────────────────────────────────
  bot.callbackQuery("recharge_crypto", async (ctx) => {
    const userId = ctx.from.id;
    const state = rechargeState.get(userId);
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (!state || state.step !== "select_method") {
      await ctx.answerCallbackQuery({
        text: t("rechargeSessionExpired"),
        show_alert: true,
      });
      return;
    }

    const settings = await PaymentRepository.getSettings();
    const nowpaymentsReady =
      !!settings?.nowpaymentsEnabled &&
      !!settings.nowpaymentsApiKey &&
      !!settings.nowpaymentsIpnCallbackUrl;

    if (!nowpaymentsReady) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery();

    // قیمت لحظه‌ای — اگه API کار نکرد از نرخ دستی استفاده می‌کنیم
    let rate = await fetchUsdtRate();
    if (!rate && (settings.cryptoExchangeRate ?? 0) > 0) {
      rate = settings.cryptoExchangeRate!;
    }

    if (!rate) {
      await ctx.editText(t("rechargeRateUnavailable"), {
        reply_markup: new InlineKeyboard().text(t("btnCancel"), "wallet"),
        parse_mode: "HTML",
      });
      return;
    }

    const usdtAmount = state.amount / rate;

    const payCurrency = normalizeNowpaymentsPayCurrency(settings);
    let walletPaymentId: number | null = null;

    try {
      const payment = await createPendingNowpaymentsWalletPayment({
        userId,
        amount: state.amount,
        payCurrency,
      });
      walletPaymentId = payment.id;

      const ipnUrl = buildNowpaymentsIpnUrl(
        settings.nowpaymentsIpnCallbackUrl!,
        payment.id,
      );

      const createResp = await fetch("https://api.nowpayments.io/v1/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.nowpaymentsApiKey!,
        },
        body: JSON.stringify({
          price_amount: Number(usdtAmount.toFixed(4)),
          price_currency: "usd",
          pay_currency: payCurrency,
          ipn_callback_url: ipnUrl,
          order_id: payment.orderId,
          order_description: `Wallet recharge for user ${userId}`,
        }),
        signal: AbortSignal.timeout(12_000),
      });

      const data = (await createResp.json()) as any;

      if (!createResp.ok || !data?.payment_id) {
        throw new Error(
          `NOWPayments create payment failed: ${JSON.stringify(data)}`,
        );
      }

      const nowPaymentId = String(data.payment_id);
      const paymentStatus = String(data.payment_status ?? "waiting");
      const payAddress =
        data.pay_address !== undefined ? String(data.pay_address) : null;
      const payAmount =
        data.pay_amount !== undefined ? String(data.pay_amount) : null;
      const paymentUrl =
        data.invoice_url !== undefined
          ? String(data.invoice_url)
          : data.payment_url !== undefined
            ? String(data.payment_url)
            : null;

      await attachNowpaymentsWalletGatewayRequest({
        paymentId: payment.id,
        nowpaymentsPaymentId: nowPaymentId,
        payAddress,
        payAmount,
        paymentUrl,
        paymentStatus,
      });

      rechargeState.set(userId, {
        step: "waiting_nowpayments",
        amount: state.amount,
        walletPaymentId: payment.id,
        paymentUrl: paymentUrl ?? "",
      });

      const paymentBlock = payAddress
        ? `${t("rechargeCryptoAddress", payAddress)}\n\n`
        : "";
      const payAmountLine = payAmount
        ? `${t("rechargeCryptoAmount", Number(payAmount).toFixed(6))}\n`
        : `${t("rechargeCryptoAmount", usdtAmount.toFixed(4))}\n`;

      const keyboard = new InlineKeyboard();
      if (paymentUrl) {
        keyboard.url(t("btnPayNow"), paymentUrl).row();
      }
      keyboard
        .text(t("btnVerifyPayment"), `recharge_verify_crypto:${payment.id}`)
        .row()
        .text(t("btnCancel"), "recharge_cancel");

      await ctx.editText(
        `${t("rechargeCryptoTitle")}\n\n` +
          `${t("rechargeAmount", formatNum(state.amount))}\n\n` +
          paymentBlock +
          payAmountLine +
          `${t("rechargeCryptoNetwork", settings.cryptoNetwork ?? "TRC20")}\n` +
          `${t("rechargeUsdtRate", formatNum(Math.round(rate)))}\n\n` +
          `${t("rechargeCryptoInstructions")}`,
        {
          reply_markup: keyboard,
          parse_mode: "HTML",
        },
      );
      return;
    } catch (err) {
      if (walletPaymentId) {
        await markNowpaymentsWalletPaymentFailed(walletPaymentId).catch(
          (updateError) => {
            console.error(
              "[wallet-recharge] failed to update nowpayments payment after request error:",
              updateError,
            );
          },
        );
      }
      console.error("[wallet-recharge] NOWPayments request error:", err);
      await ctx.editText(t("rechargePaymentFailed"), {
        reply_markup: new InlineKeyboard().text(t("btnCancel"), "wallet"),
        parse_mode: "HTML",
      });
    }
  });

  bot.callbackQuery(/^recharge_verify_crypto:(\d+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const walletPaymentId = parseInt(ctx.queryData[1], 10);
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    const payment = await getNowpaymentsWalletPaymentForUser(
      walletPaymentId,
      userId,
    );

    if (!payment) {
      await ctx.answerCallbackQuery({
        text: t("rechargeSessionExpired"),
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: t("rechargeZarinpalVerifying") });

    if (payment.creditedAt || payment.paymentStatus === "finished") {
      const creditResult = await creditNowpaymentsWalletPayment(bot, payment);
      rechargeState.delete(userId);

      await ctx.editText(
        t(
          "rechargeZarinpalSuccess",
          formatNum(parseFloat(String(payment.amount ?? "0"))),
        ),
        {
          reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
          parse_mode: "HTML",
        },
      );
      if (creditResult.alreadyCredited) return;
      return;
    }

    const settings = await PaymentRepository.getSettings();
    if (!settings?.nowpaymentsApiKey || !settings.nowpaymentsEnabled) {
      await ctx.reply(t("rechargeMethodDisabled"), { parse_mode: "HTML" });
      return;
    }

    try {
      const { paymentStatus, updatedPayment } =
        await refreshNowpaymentsWalletPaymentStatus({
          settings,
          payment,
        });

      if (paymentStatus.toLowerCase() !== "finished") {
        await ctx.editText(
          t("rechargePaymentPending") +
            `\n\nStatus: <code>${paymentStatus}</code>`,
          {
            parse_mode: "HTML",
            reply_markup: new InlineKeyboard()
              .text(
                t("btnVerifyPayment"),
                `recharge_verify_crypto:${payment.id}`,
              )
              .row()
              .text(t("btnCancel"), "recharge_cancel"),
          },
        );
        return;
      }

      await creditNowpaymentsWalletPayment(bot, updatedPayment ?? payment);
      rechargeState.delete(userId);

      await ctx.editText(
        t(
          "rechargeZarinpalSuccess",
          formatNum(parseFloat(String(payment.amount ?? "0"))),
        ),
        {
          reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
          parse_mode: "HTML",
        },
      );
    } catch (err) {
      console.error("[wallet-recharge] NOWPayments verify error:", err);
      await ctx.reply(t("rechargePaymentFailed"), { parse_mode: "HTML" });
    }
  });

  // ── 5. بررسی پرداخت زرین‌پال ─────────────────────────
  bot.callbackQuery(/^recharge_verify_zarinpal:(\d+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const walletPaymentId = parseInt(ctx.queryData[1], 10);
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");
    const payment = await getZarinpalWalletPaymentForUser(
      walletPaymentId,
      userId,
    );

    if (!payment) {
      await ctx.answerCallbackQuery({
        text: t("rechargeSessionExpired"),
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: t("rechargeZarinpalVerifying") });

    if (payment.status === "credited") {
      rechargeState.delete(userId);
      await ctx.editText(
        t(
          "rechargeZarinpalSuccess",
          formatNum(parseFloat(String(payment.amount ?? "0"))),
        ),
        {
          reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
          parse_mode: "HTML",
        },
      );
      return;
    }

    if (payment.status === "cancelled" || payment.status === "failed") {
      await ctx.editText(
        t("rechargeZarinpalFailed") + "\n\n" + t("rechargeZarinpalRetry"),
        {
          reply_markup: buildZarinpalVerificationKeyboard(
            t,
            payment.paymentUrl ?? "",
            payment.id,
          ),
          parse_mode: "HTML",
        },
      );
      return;
    }

    const settings = await PaymentRepository.getSettings();
    if (!settings?.zarinpalMerchantId) {
      await ctx.reply(t("rechargeZarinpalFailed"), { parse_mode: "HTML" });
      return;
    }

    try {
      let refId = payment.refId ?? payment.authority ?? String(walletPaymentId);

      if (payment.status !== "verified") {
        if (!payment.authority) {
          throw new Error("ZarinPal authority is missing for wallet payment");
        }

        const result = await verifyZarinpalWalletAuthority({
          settings,
          amount: parseFloat(String(payment.amount ?? "0")),
          authority: payment.authority,
        });

        if (result.code !== 100 && result.code !== 101) {
          await ctx.editText(
            t("rechargeZarinpalFailed") + "\n\n" + t("rechargeZarinpalRetry"),
            {
              reply_markup: buildZarinpalVerificationKeyboard(
                t,
                payment.paymentUrl ?? "",
                payment.id,
              ),
              parse_mode: "HTML",
            },
          );
          return;
        }

        refId = result.refId;
        await markZarinpalWalletPaymentVerified(payment.id, refId);
      }

      const creditResult = await creditZarinpalWalletPayment(
        bot,
        payment,
        refId,
      );

      if (creditResult.alreadyCredited || payment.status === "verified") {
        rechargeState.delete(userId);
        await ctx.editText(
          t(
            "rechargeZarinpalSuccess",
            formatNum(parseFloat(String(payment.amount ?? "0"))),
          ),
          {
            reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
            parse_mode: "HTML",
          },
        );
        return;
      }

      rechargeState.delete(userId);
      await ctx.editText(
        t(
          "rechargeZarinpalSuccess",
          formatNum(parseFloat(String(payment.amount ?? "0"))),
        ),
        {
          reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
          parse_mode: "HTML",
        },
      );
    } catch (err) {
      console.error("[wallet-recharge] Zarinpal verify error:", err);
      await ctx.reply(t("rechargeZarinpalFailed"), { parse_mode: "HTML" });
    }
  });

  // ── 6. لغو ─────────────────────────────────────────────
  bot.callbackQuery("recharge_cancel", async (ctx) => {
    const userId = ctx.from.id;
    rechargeState.delete(userId);

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");
    const balance = user?.walletBalance ?? "0";

    await ctx.editText(
      `${t("walletTitle")}\n\n${t("walletBalance", balance)}` +
        (balance === "0" ? `\n\n${t("walletEmpty")}` : ""),
      {
        reply_markup: new InlineKeyboard()
          .text(t("btnRechargeWallet"), "wallet_recharge")
          .row()
          .text(t("btnTransactionHistory"), "wallet_history")
          .row()
          .text(t("btnBack"), "main_menu"),
        parse_mode: "HTML",
      },
    );
    await ctx.answerCallbackQuery({ text: t("rechargePaymentCancelled") });
  });

  bot.callbackQuery(/^r[ar]:\d+:\d+:[czk]$/, async (ctx) => {
    const raw = Array.isArray(ctx.queryData)
      ? ctx.queryData[0]
      : (ctx.queryData as string);
    const parts = raw.split(":");
    const action = parts[0];
    const targetUserId = parseInt(parts[1]);
    const amount = parseInt(parts[2]);
    const mc = parts[3];
    const method: RechargeMethod =
      mc === "z" ? "zarinpal" : mc === "k" ? "crypto" : "card";

    if (action === "ra") {
      await applyRecharge(
        bot,
        targetUserId,
        amount,
        method,
        `Admin-approved ${method} recharge`,
      );
      await ctx.answerCallbackQuery({
        text: `✅ شارژ ${formatNum(amount)} تومان تأیید شد`,
      });
    } else {
      try {
        const targetUser = await UserRepository.findById(targetUserId);
        const t = i18n.buildT(targetUser?.languageCode || "fa");
        await (bot.api as any).sendMessage({
          chat_id: targetUserId,
          text: t("rechargeRejected"),
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
        });
      } catch {}
      await ctx.answerCallbackQuery({ text: "❌ درخواست رد شد" });
    }

    try {
      const cbq =
        (ctx as any).update?.callbackQuery ??
        (ctx as any).update?.callback_query;
      const msg = cbq?.message;

      const original = msg?.caption ?? msg?.text ?? "";
      const resultLine =
        action === "ra"
          ? `\n\n✅ <b>Approved</b> — ${ctx.from.firstName}`
          : `\n\n❌ <b>Rejected</b> — ${ctx.from.firstName}`;

      if (msg?.caption !== undefined) {
        await ctx.bot.api.editMessageCaption({
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          caption: original + resultLine,
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard().toJSON(),
        });
      } else {
        await ctx.editText(original + resultLine, {
          reply_markup: new InlineKeyboard(),
        });
      }
    } catch (err) {
      console.error("[RECHARGE-ADMIN] edit message error:", err);
    }
  });

  bot.on("message", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    if (ticketState.has(userId) || ticketReplyState.has(userId)) return;
    if ((ctx as any).scene?.current) return;

    const state = rechargeState.get(userId);
    if (!state) {
      return;
    }

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (state.step === "enter_amount") {
      const text = ctx.text;
      if (!text) return;

      const normalized = text
        .replace(/[,،٬\s]/g, "")
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
      const amount = parseInt(normalized, 10);

      if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t("rechargeInvalidAmount"), { parse_mode: "HTML" });
        return;
      }
      if (amount < MIN_AMOUNT) {
        await ctx.reply(t("rechargeTooLow", formatNum(MIN_AMOUNT)), {
          parse_mode: "HTML",
        });
        return;
      }
      if (amount > MAX_AMOUNT) {
        await ctx.reply(t("rechargeTooHigh", formatNum(MAX_AMOUNT)), {
          parse_mode: "HTML",
        });
        return;
      }

      const [settings, cards] = await Promise.all([
        PaymentRepository.getSettings(),
        PaymentRepository.getActiveCards(),
      ]);

      const keyboard = new InlineKeyboard();
      let hasMethod = false;

      if (settings?.cardEnabled && cards.length > 0) {
        keyboard
          .text(t("btnRechargeCard"), "recharge_card", {
            icon_custom_emoji_id: emojiIds.card,
          })
          .row();
        hasMethod = true;
      }
      if (
        settings?.zarinpalEnabled &&
        settings.zarinpalMerchantId &&
        normalizeZarinpalCallbackUrl(settings.zarinpalCallbackUrl)
      ) {
        keyboard
          .text(t("btnRechargeZarinpal"), "recharge_zarinpal", {
            icon_custom_emoji_id: emojiIds.zarinpal,
          })
          .row();
        hasMethod = true;
      }
      if (
        settings?.nowpaymentsEnabled &&
        settings.nowpaymentsApiKey &&
        settings.nowpaymentsIpnCallbackUrl
      ) {
        keyboard
          .text(t("btnRechargeCrypto"), "recharge_crypto", {
            icon_custom_emoji_id: emojiIds.usdt,
          })
          .row();
        hasMethod = true;
      }
      keyboard.text(t("btnCancel"), "wallet", {
        icon_custom_emoji_id: emojiIds.back,
      });

      if (!hasMethod) {
        rechargeState.delete(userId);
        await ctx.reply(t("rechargeNoMethodAvailable"), { parse_mode: "HTML" });
        return;
      }

      rechargeState.set(userId, { step: "select_method", amount });

      await ctx.reply(t("rechargeMethodSelectTitle", formatNum(amount)), {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
      return;
    }

    // ─ 8b. رسید کارت (عکس) ────────────────────────────────
    if (state.step === "waiting_receipt") {
      const photo = (ctx as any).update?.message?.photo as
        | { file_id: string }[]
        | undefined;
      if (!photo || photo.length === 0) {
        await ctx.reply(t("rechargeCardExpectPhoto"), { parse_mode: "HTML" });
        return;
      }

      const fileId = photo[photo.length - 1].file_id;
      rechargeState.delete(userId);

      try {
        await createPendingCardTopup({
          userId,
          amount: state.amount,
          receiptFileId: fileId,
        });
      } catch (err) {
        console.error(
          "[wallet-recharge] failed to create pending card topup:",
          err,
        );
        await ctx.reply(t("rechargeCardSaveFailed"), { parse_mode: "HTML" });
        return;
      }

      await ctx.reply(t("rechargePendingApproval"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
      });
      return;
    }
  });
}


export async function addReferralCredit(
  bot: AnyBot,
  userId: number,
  amount: number,
  referredByName: string,
) {
  await UserRepository.updateWalletBalance(userId, amount, "add");
  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "referral",
    `Referral reward from ${referredByName}`,
  );
}

export async function addRewardCredit(
  userId: number,
  amount: number,
  description?: string,
) {
  await UserRepository.updateWalletBalance(userId, amount, "add");
  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "reward",
    description,
  );
}

/** پردازش callback از درگاه خارجی (در صورت وجود webhook) */
export async function handlePaymentCallback(
  bot: AnyBot,
  userId: number,
  amount: number,
  method: "zarinpal" | "card",
  paymentId: string,
  status: "success" | "failed",
) {
  rechargeState.delete(userId);
  if (status === "success") {
    await applyRecharge(
      bot,
      userId,
      amount,
      method,
      `${method} recharge - Payment ID: ${paymentId}`,
    );
  }
}
