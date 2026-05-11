/**
 * Renewal payment callbacks.
 * Register via: setupRenewalPaymentCallbacks(bot)
 */

import { type AnyBot, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { PaymentRepository } from "../../../repositories/PaymentRepository.ts";
import { WalletRepository } from "../../../repositories/WalletRepository.ts";
import { TicketService } from "../../../services/bot/ticket.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { renewalPendingState } from "../renewState.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create a new renewal order from state
// ─────────────────────────────────────────────────────────────────────────────
async function createRenewalOrder(
  userId: number,
  info: NonNullable<ReturnType<typeof renewalPendingState.get>>,
  paymentMethod: "wallet" | "card" | "crypto" | "zarinpal",
  status: "pending_admin" | "pending_payment",
  paymentId?: string,
) {
  const plan = await ProductPlanRepository.findById(info.planId);
  const product = await ProductRepository.findById(info.productId);
  if (!plan || !product) return null;

  const order = await OrderRepository.create({
    userId: userId as any,
    productId: info.productId,
    planId: info.planId,
    status,
    quantity: 1,
    totalPrice: plan.price as any,
    discountAmount: "0" as any,
    walletUsed:
      paymentMethod === "wallet"
        ? (info.finalPrice.toString() as any)
        : ("0" as any),
    finalPrice: info.finalPrice.toString() as any,
    paymentMethod,
    paymentId: paymentId ?? null,
    delivery: info.delivery,
  });

  return { order, product, plan };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: notify admin via TicketService
// ─────────────────────────────────────────────────────────────────────────────
async function notifyAdminRenewal(
  bot: AnyBot,
  data: {
    userId: number;
    username: string | null;
    firstName: string | null;
    orderId: number;
    originalOrderId: number;
    productName: string;
    planName: string;
    finalPrice: number;
    paymentMethod: string;
    delivery: Record<string, string>;
  },
) {
  const userLabel = data.username
    ? `@${data.username}`
    : data.firstName || "User";
  const deliveryLines = Object.entries(data.delivery)
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");

  const description =
    `🔄 Renewal of Order #${data.originalOrderId}\n\n` +
    `👤 User: ${userLabel} (${data.userId})\n` +
    `📦 Product: ${data.productName}\n` +
    `📋 Plan: ${data.planName}\n` +
    `💰 Amount: ${data.finalPrice.toLocaleString()} Toman\n` +
    `💳 Payment: ${data.paymentMethod}\n` +
    (deliveryLines ? `\n📋 Delivery Info:\n${deliveryLines}` : "") +
    `\n\n⏰ ${new Date().toLocaleString("en-GB")}`;

  try {
    const ticketService = new TicketService(bot.api);
    await ticketService.createTicket({
      userId: data.userId,
      type: "order",
      title: `🔄 Renewal #${data.orderId} — ${data.productName} (${data.planName})`,
      description,
      orderId: data.orderId,
      priority: "high",
    });
  } catch (err) {
    console.error("[RENEW] Failed to create renewal ticket:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main setup function
// ─────────────────────────────────────────────────────────────────────────────
export function setupRenewalPaymentCallbacks(bot: AnyBot) {
  // ── Wallet ────────────────────────────────────────────────────────────────
  bot.callbackQuery(/^renew_wallet_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const walletBalance = parseFloat(user?.walletBalance ?? "0");
    if (walletBalance < info.finalPrice) {
      await ctx.editText(
        t("insufficientBalance", {
          required: info.finalPrice.toFixed(0),
          current: walletBalance.toFixed(0),
        }),
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text(t("btnRechargeWallet"), "wallet")
            .row()
            .text(t("btnBackToOrders"), `order_${orderId}`),
        },
      );
      return;
    }

    const result = await createRenewalOrder(
      userId,
      info,
      "wallet",
      "pending_admin",
    );
    if (!result) {
      await ctx.editText(t("errorRenewingOrder"), { parse_mode: "HTML" });
      return;
    }

    await UserRepository.updateWalletBalance(
      userId,
      info.finalPrice,
      "subtract",
    );
    await WalletRepository.debitBalance(
      userId,
      info.finalPrice.toFixed(2),
      "purchase",
      result.order.id,
      `تمدید ${result.product.name} - ${result.plan.name}`,
    );

    renewalPendingState.delete(userId);

    await notifyAdminRenewal(bot, {
      userId,
      username: user?.username ?? null,
      firstName: user?.firstName ?? null,
      orderId: result.order.id,
      originalOrderId: orderId,
      productName: result.product.name,
      planName: result.plan.name,
      finalPrice: info.finalPrice,
      paymentMethod: "wallet",
      delivery: info.delivery,
    });

    const updatedUser = await UserRepository.findById(userId);
    const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

    await ctx.editText(
      t(
        "renewWalletSuccess" as any,
        {
          orderId: result.order.id,
          productName: result.product.name,
          remainingBalance: newBalance.toFixed(0),
        } as any,
      ),
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text(t("btnMyOrders"), "orders")
          .row()
          .text(t("btnBackToMenu"), "categories"),
      },
    );
  });

  // ── Card: show numbers ────────────────────────────────────────────────────
  bot.callbackQuery(/^renew_card_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const [settings, cards] = await Promise.all([
      PaymentRepository.getSettings(),
      PaymentRepository.getActiveCards(),
    ]);

    if (!settings?.cardEnabled || !cards?.length) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

    let msg = `💳 <b>${t("rechargeCardTitle")}</b>\n\n💰 ${info.finalPrice.toLocaleString()} ${t("currency")}\n\n`;
    for (const card of cards) {
      msg += `🏦 ${card.bankName ?? ""} — ${card.holderName}\n`;
      msg += `<code>${card.cardNumber}</code>\n\n`;
    }
    msg += t("payCardConfirmNote" as any);

    await ctx.editText(msg, {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(
          t("btnConfirmCardPayment" as any),
          `renew_confirm_card_${orderId}`,
        )
        .row()
        .text(t("btnBackToOrders"), `order_renew_${orderId}`),
    });
  });

  // ── Card: confirm transfer ────────────────────────────────────────────────
  bot.callbackQuery(/^renew_confirm_card_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const result = await createRenewalOrder(
      userId,
      info,
      "card",
      "pending_payment",
    );
    if (!result) {
      await ctx.editText(t("errorRenewingOrder"), { parse_mode: "HTML" });
      return;
    }

    renewalPendingState.delete(userId);

    await notifyAdminRenewal(bot, {
      userId,
      username: user?.username ?? null,
      firstName: user?.firstName ?? null,
      orderId: result.order.id,
      originalOrderId: orderId,
      productName: result.product.name,
      planName: result.plan.name,
      finalPrice: info.finalPrice,
      paymentMethod: "card",
      delivery: info.delivery,
    });

    await ctx.editText(t("payCardPending" as any, result.order.id as any), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnMyOrders"), "orders")
        .row()
        .text(t("btnBackToMenu"), "categories"),
    });
  });

  // ── ZarinPal: request link ────────────────────────────────────────────────
  bot.callbackQuery(/^renew_zarinpal_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const settings = await PaymentRepository.getSettings();
    if (!settings?.zarinpalEnabled || !settings.zarinpalMerchantId) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

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
          amount: Math.round(info.finalPrice) * 10,
          description: `تمدید اشتراک - کاربر ${userId}`,
          callback_url: `https://t.me/${botInfo.username}`,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await resp.json()) as any;
      if (data?.data?.code !== 100)
        throw new Error(JSON.stringify(data?.errors ?? data));

      const authority: string = data.data.authority;
      const gateway = settings.zarinpalSandbox
        ? "https://sandbox.zarinpal.com/pg/StartPay/"
        : "https://www.zarinpal.com/pg/StartPay/";
      const payUrl = gateway + authority;

      renewalPendingState.set(userId, {
        ...info,
        zarinpalAuthority: authority,
        zarinpalPayUrl: payUrl,
      });

      await ctx.editText(
        `${t("rechargeZarinpalTitle")}\n\n${t("rechargeAmount", info.finalPrice.toLocaleString())}\n\n${t("rechargeZarinpalInstructions")}`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url(t("btnPayNow"), payUrl)
            .row()
            .text(t("btnVerifyPayment"), `renew_verify_zarinpal_${orderId}`)
            .row()
            .text(t("btnBackToOrders"), `order_${orderId}`),
        },
      );
    } catch (err) {
      console.error("[RENEW] ZarinPal request error:", err);
      await ctx.editText(t("rechargeZarinpalFailed"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(
          t("btnBackToOrders"),
          `order_${orderId}`,
        ),
      });
    }
  });

  // ── ZarinPal: verify ──────────────────────────────────────────────────────
  bot.callbackQuery(/^renew_verify_zarinpal_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery({ text: "⏳..." });
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId || !info.zarinpalAuthority)
      return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const settings = await PaymentRepository.getSettings();
    if (!settings?.zarinpalMerchantId) return;

    const verifyUrl = settings.zarinpalSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      : "https://api.zarinpal.com/pg/v4/payment/verify.json";

    try {
      const resp = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: settings.zarinpalMerchantId,
          amount: Math.round(info.finalPrice) * 10,
          authority: info.zarinpalAuthority,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await resp.json()) as any;
      const code: number = data?.data?.code ?? -1;

      if (code === 100 || code === 101) {
        const refId = String(data?.data?.ref_id ?? info.zarinpalAuthority);
        const result = await createRenewalOrder(
          userId,
          info,
          "zarinpal",
          "pending_admin",
          refId,
        );
        if (!result) return;

        renewalPendingState.delete(userId);

        await notifyAdminRenewal(bot, {
          userId,
          username: user?.username ?? null,
          firstName: user?.firstName ?? null,
          orderId: result.order.id,
          originalOrderId: orderId,
          productName: result.product.name,
          planName: result.plan.name,
          finalPrice: info.finalPrice,
          paymentMethod: "zarinpal",
          delivery: info.delivery,
        });

        await ctx.editText(
          t("rechargeZarinpalSuccess", info.finalPrice.toLocaleString()),
          {
            parse_mode: "HTML",
            reply_markup: new InlineKeyboard()
              .text(t("btnMyOrders"), "orders")
              .row()
              .text(t("btnBackToMenu"), "categories"),
          },
        );
      } else {
        await ctx.editText(
          t("rechargeZarinpalFailed") + "\n\n" + t("rechargeZarinpalRetry"),
          {
            parse_mode: "HTML",
            reply_markup: new InlineKeyboard()
              .url(t("btnPayNow"), info.zarinpalPayUrl!)
              .row()
              .text(t("btnVerifyPayment"), `renew_verify_zarinpal_${orderId}`)
              .row()
              .text(t("btnBackToOrders"), `order_${orderId}`),
          },
        );
      }
    } catch (err) {
      console.error("[RENEW] ZarinPal verify error:", err);
      await ctx.editText(t("rechargeZarinpalFailed"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(
          t("btnBackToOrders"),
          `order_${orderId}`,
        ),
      });
    }
  });

  // ── Crypto (NOWPayments): create payment ─────────────────────────────────
  bot.callbackQuery(/^renew_crypto_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const settings = await PaymentRepository.getSettings();
    if (
      !settings?.nowpaymentsEnabled ||
      !settings.nowpaymentsApiKey ||
      !settings.nowpaymentsIpnCallbackUrl ||
      (settings.cryptoExchangeRate ?? 0) <= 0
    ) {
      await ctx.answerCallbackQuery({
        text: t("rechargeMethodDisabled"),
        show_alert: true,
      });
      return;
    }

    const network = (settings.cryptoNetwork ?? "TRC20").toUpperCase();
    const payCurrency = settings.nowpaymentsPayCurrency?.trim()
      ? settings.nowpaymentsPayCurrency.trim().toLowerCase()
      : network === "ERC20"
        ? "usdterc20"
        : network === "BEP20"
          ? "usdtbsc"
          : "usdttrc20";

    const usdtAmount = (info.finalPrice / settings.cryptoExchangeRate).toFixed(
      4,
    );

    const nowpaymentsOrderId = `renew-${userId}-${orderId}-${Date.now()}`;

    try {
      const ipnUrl = new URL(settings.nowpaymentsIpnCallbackUrl);
      ipnUrl.searchParams.set("flow", "renew");
      ipnUrl.searchParams.set("userId", String(userId));
      ipnUrl.searchParams.set("orderId", String(orderId));

      const resp = await fetch("https://api.nowpayments.io/v1/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.nowpaymentsApiKey,
        },
        body: JSON.stringify({
          price_amount: Number(usdtAmount),
          price_currency: "usd",
          pay_currency: payCurrency,
          ipn_callback_url: ipnUrl.toString(),
          order_id: nowpaymentsOrderId,
          order_description: `Renewal payment for user ${userId}, order ${orderId}`,
        }),
        signal: AbortSignal.timeout(12_000),
      });

      const data = (await resp.json()) as any;
      if (!resp.ok || !data?.payment_id) {
        throw new Error(JSON.stringify(data));
      }

      const payAddress =
        data.pay_address !== undefined ? String(data.pay_address) : "-";
      const payAmount =
        data.pay_amount !== undefined ? String(data.pay_amount) : usdtAmount;
      const payUrl =
        data.invoice_url !== undefined
          ? String(data.invoice_url)
          : data.payment_url !== undefined
            ? String(data.payment_url)
            : undefined;

      renewalPendingState.set(userId, {
        ...info,
        nowpaymentsPaymentId: String(data.payment_id),
        nowpaymentsOrderId,
        nowpaymentsPayUrl: payUrl,
        nowpaymentsPayAddress: payAddress,
        nowpaymentsPayAmount: payAmount,
      });

      const keyboard = new InlineKeyboard();
      if (payUrl) {
        keyboard.url(t("btnPayNow"), payUrl).row();
      }

      keyboard
        .text(t("btnVerifyPayment"), `renew_verify_crypto_${orderId}`)
        .row()
        .text(t("btnBackToOrders"), `order_renew_${orderId}`);

      const msg =
        `🪙 <b>${t("rechargeCryptoTitle")}</b>\n\n` +
        `${t("rechargeCryptoAddress", payAddress)}\n\n` +
        `${t("rechargeCryptoAmount", Number(payAmount).toFixed(6))}\n` +
        (settings.cryptoNetwork
          ? `${t("rechargeCryptoNetwork", settings.cryptoNetwork)}\n\n`
          : "\n") +
        t("rechargeCryptoInstructions");

      await ctx.editText(msg, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (err) {
      console.error("[RENEW] NOWPayments request error:", err);
      await ctx.editText(t("rechargePaymentFailed"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(
          t("btnBackToOrders"),
          `order_${orderId}`,
        ),
      });
    }
  });

  // ── Crypto (NOWPayments): verify ─────────────────────────────────────────
  bot.callbackQuery(/^renew_verify_crypto_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery({ text: "⏳..." });
    const orderId = parseInt(ctx.queryData[1]);
    const userId = ctx.from?.id;
    if (!userId) return;

    const info = renewalPendingState.get(userId);
    if (!info || info.originalOrderId !== orderId || !info.nowpaymentsPaymentId)
      return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const settings = await PaymentRepository.getSettings();
    if (!settings?.nowpaymentsEnabled || !settings.nowpaymentsApiKey) {
      await ctx.reply(t("rechargeMethodDisabled"), { parse_mode: "HTML" });
      return;
    }

    try {
      const resp = await fetch(
        `https://api.nowpayments.io/v1/payment/${info.nowpaymentsPaymentId}`,
        {
          method: "GET",
          headers: {
            "x-api-key": settings.nowpaymentsApiKey,
          },
          signal: AbortSignal.timeout(10_000),
        },
      );

      const data = (await resp.json()) as any;
      const paymentStatus = String(
        data?.payment_status ?? "unknown",
      ).toLowerCase();

      if (paymentStatus !== "finished") {
        const kb = new InlineKeyboard();
        if (info.nowpaymentsPayUrl) {
          kb.url(t("btnPayNow"), info.nowpaymentsPayUrl).row();
        }
        kb.text(t("btnVerifyPayment"), `renew_verify_crypto_${orderId}`).row();
        kb.text(t("btnBackToOrders"), `order_renew_${orderId}`);

        await ctx.editText(
          `${t("rechargePaymentPending")}\n\nStatus: <code>${paymentStatus}</code>`,
          {
            parse_mode: "HTML",
            reply_markup: kb,
          },
        );
        return;
      }

      const result = await createRenewalOrder(
        userId,
        info,
        "crypto",
        "pending_admin",
        String(data?.payment_id ?? info.nowpaymentsPaymentId),
      );
      if (!result) {
        await ctx.editText(t("errorRenewingOrder"), { parse_mode: "HTML" });
        return;
      }

      renewalPendingState.delete(userId);

      await notifyAdminRenewal(bot, {
        userId,
        username: user?.username ?? null,
        firstName: user?.firstName ?? null,
        orderId: result.order.id,
        originalOrderId: orderId,
        productName: result.product.name,
        planName: result.plan.name,
        finalPrice: info.finalPrice,
        paymentMethod: "nowpayments",
        delivery: info.delivery,
      });

      await ctx.editText(
        t("rechargeZarinpalSuccess", info.finalPrice.toLocaleString()),
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text(t("btnMyOrders"), "orders")
            .row()
            .text(t("btnBackToMenu"), "categories"),
        },
      );
    } catch (err) {
      console.error("[RENEW] NOWPayments verify error:", err);
      await ctx.editText(t("rechargePaymentFailed"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(
          t("btnBackToOrders"),
          `order_${orderId}`,
        ),
      });
    }
  });
}
