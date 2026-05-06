import { InlineKeyboard, type AnyBot } from "gramio";
import { UserRepository } from "../repositories/UserRepository.ts";
import { WalletRepository } from "../repositories/WalletRepository.ts";
import { PaymentRepository } from "../repositories/PaymentRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { config } from "../config.ts";
import { ticketState, ticketReplyState } from "./support-tickets.ts";

// ─────────────────────────────────────────────────────────
// State Management
// ─────────────────────────────────────────────────────────

type RechargeMethod = "card" | "zarinpal" | "crypto";

type RechargeState =
  | { step: "enter_amount" }
  | { step: "select_method"; amount: number }
  | { step: "waiting_receipt"; amount: number }
  | { step: "waiting_txid"; amount: number; usdtAmount: number }
  | {
      step: "waiting_zarinpal";
      amount: number;
      authority: string;
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

/** قیمت لحظه‌ای USDT به تومان از Nobitex */
async function fetchUsdtRate(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=irt",
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const price = parseFloat(data?.stats?.["usdt-irt"]?.lastTradePrice ?? "0");
    return price > 0 ? price : null;
  } catch {
    return null;
  }
}

/** ارسال نوتیف به گروه ادمین برای تایید شارژ */
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

  let msg =
    `💵 <b>درخواست شارژ کیف پول</b>\n\n` +
    `👤 کاربر: ${userLabel} (<code>${opts.userId}</code>)\n` +
    `💰 مبلغ: <b>${formatNum(opts.amount)}</b> تومان\n` +
    `🔑 روش: ${methodLabel}\n`;

  if (opts.usdtAmount) {
    msg += `🪙 معادل: <b>${opts.usdtAmount.toFixed(4)}</b> USDT\n`;
  }
  msg += `\n⏰ ${new Date().toLocaleString("en-GB")}`;

  // فرمت callback: "ra:{userId}:{amount}:{m}" — max ~30 chars
  const mc =
    opts.method === "zarinpal" ? "z" : opts.method === "crypto" ? "k" : "c";
  const approveData = `ra:${opts.userId}:${opts.amount}:${mc}`;
  const rejectData = `rr:${opts.userId}:${opts.amount}:${mc}`;

  const keyboard = new InlineKeyboard()
    .text("✅ تأیید", approveData)
    .text("❌ رد", rejectData);

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

// ─────────────────────────────────────────────────────────
// Main Setup
// ─────────────────────────────────────────────────────────

export function setupWalletRechargeScene(bot: AnyBot) {
  // ── 1. Entry: کاربر "شارژ کیف پول" زد ─────────────────
  bot.callbackQuery("wallet_recharge", async (ctx) => {
    const user = await UserRepository.findById(ctx.from.id);
    const t = i18n.buildT(user?.languageCode || "fa");

    rechargeState.set(ctx.from.id, { step: "enter_amount" });
    console.log(
      "[RECHARGE] State set for userId:",
      ctx.from.id,
      "→ enter_amount",
    );

    await ctx.editText(
      `${t("rechargeWalletTitle")}\n\n` +
        `${t("rechargeEnterAmount")}\n\n` +
        `${t("rechargeMinAmount", formatNum(MIN_AMOUNT))}\n` +
        `${t("rechargeMaxAmount", formatNum(MAX_AMOUNT))}`,
      {
        reply_markup: new InlineKeyboard().text(t("btnCancel"), "wallet"),
        parse_mode: "HTML",
      },
    );
    await ctx.answerCallbackQuery();
  });

  // ── 2. کارت بانکی ──────────────────────────────────────
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
        reply_markup: new InlineKeyboard().text(
          t("btnCancel"),
          "recharge_cancel",
        ),
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
    if (!settings?.zarinpalEnabled || !settings.zarinpalMerchantId) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery();

    const apiUrl = settings.zarinpalSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      : "https://api.zarinpal.com/pg/v4/payment/request.json";

    try {
      const botInfo = await (bot.api as any).getMe();
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: settings.zarinpalMerchantId,
          amount: state.amount * 10, // تومان به ریال
          description: `شارژ کیف پول - کاربر ${userId}`,
          callback_url: `https://t.me/${botInfo.username}`,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await resp.json()) as any;
      if (data?.data?.code !== 100)
        throw new Error(JSON.stringify(data?.errors));

      const authority: string = data.data.authority;
      const gateway = settings.zarinpalSandbox
        ? "https://sandbox.zarinpal.com/pg/StartPay/"
        : "https://www.zarinpal.com/pg/StartPay/";

      const paymentUrl = gateway + authority;

      rechargeState.set(userId, {
        step: "waiting_zarinpal",
        amount: state.amount,
        authority,
        paymentUrl,
      });

      await ctx.editText(
        `${t("rechargeZarinpalTitle")}\n\n` +
          `${t("rechargeAmount", formatNum(state.amount))}\n\n` +
          `${t("rechargeZarinpalInstructions")}`,
        {
          reply_markup: new InlineKeyboard()
            .url(t("btnPayNow"), paymentUrl)
            .row()
            .text(t("btnVerifyPayment"), "recharge_verify_zarinpal")
            .row()
            .text(t("btnCancel"), "recharge_cancel"),
          parse_mode: "HTML",
        },
      );
    } catch (err) {
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
    if (!settings?.cryptoEnabled || !settings.cryptoAddress) {
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

    rechargeState.set(userId, {
      step: "waiting_txid",
      amount: state.amount,
      usdtAmount,
    });

    await ctx.editText(
      `${t("rechargeCryptoTitle")}\n\n` +
        `${t("rechargeAmount", formatNum(state.amount))}\n\n` +
        `${t("rechargeCryptoAddress", settings.cryptoAddress)}\n\n` +
        `${t("rechargeCryptoAmount", usdtAmount.toFixed(4))}\n` +
        `${t("rechargeCryptoNetwork", settings.cryptoNetwork ?? "TRC20")}\n` +
        `${t("rechargeUsdtRate", formatNum(Math.round(rate)))}\n\n` +
        `${t("rechargeCryptoInstructions")}\n\n` +
        `${t("rechargeCryptoSendTxId")}`,
      {
        reply_markup: new InlineKeyboard().text(
          t("btnCancel"),
          "recharge_cancel",
        ),
        parse_mode: "HTML",
      },
    );
  });

  // ── 5. بررسی پرداخت زرین‌پال ─────────────────────────
  bot.callbackQuery("recharge_verify_zarinpal", async (ctx) => {
    const userId = ctx.from.id;
    const state = rechargeState.get(userId);
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (!state || state.step !== "waiting_zarinpal") {
      await ctx.answerCallbackQuery({
        text: t("rechargeSessionExpired"),
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: t("rechargeZarinpalVerifying") });

    const settings = await PaymentRepository.getSettings();
    if (!settings?.zarinpalMerchantId) {
      await ctx.reply(t("rechargeZarinpalFailed"), { parse_mode: "HTML" });
      return;
    }

    const verifyUrl = settings.zarinpalSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      : "https://api.zarinpal.com/pg/v4/payment/verify.json";

    try {
      const resp = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: settings.zarinpalMerchantId,
          amount: state.amount * 10,
          authority: state.authority,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await resp.json()) as any;
      const code: number = data?.data?.code ?? -1;

      if (code === 100 || code === 101) {
        const refId: string = String(data?.data?.ref_id ?? state.authority);
        rechargeState.delete(userId);
        await applyRecharge(
          bot,
          userId,
          state.amount,
          "zarinpal",
          `Zarinpal RefId: ${refId}`,
        );
        await ctx.editText(
          t("rechargeZarinpalSuccess", formatNum(state.amount)),
          {
            reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
            parse_mode: "HTML",
          },
        );
      } else {
        await ctx.editText(
          t("rechargeZarinpalFailed") + "\n\n" + t("rechargeZarinpalRetry"),
          {
            reply_markup: new InlineKeyboard()
              .url(t("btnPayNow"), state.paymentUrl)
              .row()
              .text(t("btnVerifyPayment"), "recharge_verify_zarinpal")
              .row()
              .text(t("btnCancel"), "recharge_cancel"),
            parse_mode: "HTML",
          },
        );
      }
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

  // ── 7. تأیید/رد ادمین  format: ra/rr:{userId}:{amount}:{c|z|k} ─
  bot.callbackQuery(/^r[ar]:\d+:\d+:[czk]$/, async (ctx) => {
    const parts = (ctx.queryData as string).split(":");
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

    // حذف دکمه‌ها از پیام ادمین و نشان دادن نتیجه
    try {
      const original = ctx.message?.caption ?? ctx.message?.text ?? "";
      const resultLine =
        action === "ra"
          ? `\n\n✅ <b>تأیید شد</b> — ${ctx.from.first_name}`
          : `\n\n❌ <b>رد شد</b> — ${ctx.from.first_name}`;

      if (ctx.message?.caption !== undefined) {
        await (ctx.api as any).editMessageCaption({
          chat_id: ctx.message!.chat.id,
          message_id: ctx.message!.message_id,
          caption: original + resultLine,
          parse_mode: "HTML",
        });
      } else if (ctx.message?.text !== undefined) {
        await (ctx.api as any).editMessageText({
          chat_id: ctx.message!.chat.id,
          message_id: ctx.message!.message_id,
          text: original + resultLine,
          parse_mode: "HTML",
        });
      }
    } catch {}
  });

  // ── 8. Message Handler ─────────────────────────────────
  bot.on("message", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    console.log(
      "[RECHARGE-MSG] Handler reached. userId:",
      userId,
      "text:",
      ctx.message?.text,
      "hasPhoto:",
      !!ctx.message?.photo,
    );
    console.log("[RECHARGE-MSG] rechargeState:", rechargeState.get(userId));
    console.log(
      "[RECHARGE-MSG] ticketState:",
      ticketState.has(userId),
      "ticketReplyState:",
      ticketReplyState.has(userId),
    );

    if (ticketState.has(userId) || ticketReplyState.has(userId)) return;
    if ((ctx as any).scene?.current) return;

    const state = rechargeState.get(userId);
    if (!state) {
      console.log("[RECHARGE-MSG] No recharge state for user, ignoring.");
      return;
    }
    console.log("[RECHARGE-MSG] Processing state:", state.step);

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    // ─ 8a. ورود مبلغ ──────────────────────────────────────
    if (state.step === "enter_amount") {
      const text = ctx.message?.text;
      if (!text) return;

      // تبدیل اعداد فارسی و حذف جداکننده‌های هزارگان
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
        keyboard.text(t("btnRechargeCard"), "recharge_card").row();
        hasMethod = true;
      }
      if (settings?.zarinpalEnabled && settings.zarinpalMerchantId) {
        keyboard.text(t("btnRechargeZarinpal"), "recharge_zarinpal").row();
        hasMethod = true;
      }
      if (settings?.cryptoEnabled && settings.cryptoAddress) {
        keyboard.text(t("btnRechargeCrypto"), "recharge_crypto").row();
        hasMethod = true;
      }
      keyboard.text(t("btnCancel"), "wallet");

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
      const photo = ctx.message?.photo;
      if (!photo || photo.length === 0) {
        await ctx.reply(t("rechargeCardExpectPhoto"), { parse_mode: "HTML" });
        return;
      }

      const fileId = photo[photo.length - 1].file_id;
      rechargeState.delete(userId);

      await notifyAdmin(bot, {
        userId,
        username: ctx.from?.username ?? null,
        firstName: ctx.from?.first_name ?? null,
        amount: state.amount,
        method: "card",
        evidence: fileId,
        evidenceType: "photo",
      });

      await ctx.reply(t("rechargePendingApproval"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
      });
      return;
    }

    // ─ 8c. TxID کریپتو ────────────────────────────────────
    if (state.step === "waiting_txid") {
      const txId = ctx.message?.text?.trim();
      if (!txId || txId.length < 10) {
        await ctx.reply(t("rechargeCryptoInvalidTxId"), { parse_mode: "HTML" });
        return;
      }

      rechargeState.delete(userId);

      await notifyAdmin(bot, {
        userId,
        username: ctx.from?.username ?? null,
        firstName: ctx.from?.first_name ?? null,
        amount: state.amount,
        method: "crypto",
        evidence: txId,
        evidenceType: "text",
        usdtAmount: state.usdtAmount,
      });

      await ctx.reply(t("rechargePendingApproval"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
      });
      return;
    }
  });
}

// ─────────────────────────────────────────────────────────
// توابع کمکی برای استفاده از سایر قسمت‌ها
// ─────────────────────────────────────────────────────────

/** افزایش موجودی از ریفرال */
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

/** افزایش موجودی از جایزه */
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
