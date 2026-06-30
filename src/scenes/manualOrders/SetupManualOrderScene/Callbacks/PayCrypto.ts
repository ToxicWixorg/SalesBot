import { InlineKeyboard } from "gramio";
import {
  ProductPlanRepository,
  UserRepository,
} from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { appliedDiscountState } from "../../../../handlers/products/discountOrderState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";
import { emojiIds } from "../../../../shared/locales/emojies";

export async function PayCryptoCallback(ctx: any) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const settings = await PaymentRepository.getSettings();
  const nowpaymentsReady =
    !!settings?.nowpaymentsEnabled &&
    !!settings.nowpaymentsApiKey &&
    !!settings.nowpaymentsIpnCallbackUrl;

  if (!nowpaymentsReady || (settings.cryptoExchangeRate ?? 0) <= 0) {
    await ctx.answerCallbackQuery({
      text: t("rechargeMethodDisabled"),
      show_alert: true,
    });
    return;
  }

  const plan = await ProductPlanRepository.findById(state.planId);
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount && pendingDiscount.planId === state.planId;
  const finalPrice = hasDiscount
    ? pendingDiscount.finalPrice
    : (state.basePriceToman ??
      state.regionPrice ??
      parseFloat((plan?.price as string) ?? "0"));

  const usdtAmount = finalPrice / settings.cryptoExchangeRate!;

  const network = (settings.cryptoNetwork ?? "TRC20").toUpperCase();
  const payCurrency = settings.nowpaymentsPayCurrency?.trim()
    ? settings.nowpaymentsPayCurrency.trim().toLowerCase()
    : network === "ERC20"
      ? "usdterc20"
      : network === "BEP20"
        ? "usdtbsc"
        : "usdttrc20";

  const orderId = `manual-order-${userId}-${Date.now()}`;

  try {
    const ipnUrl = new URL(settings.nowpaymentsIpnCallbackUrl!);
    ipnUrl.searchParams.set("flow", "manual-order");
    ipnUrl.searchParams.set("userId", String(userId));
    ipnUrl.searchParams.set("planId", String(state.planId));

    const resp = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.nowpaymentsApiKey!,
      },
      body: JSON.stringify({
        price_amount: Number(usdtAmount.toFixed(4)),
        price_currency: "usd",
        pay_currency: payCurrency,
        ipn_callback_url: ipnUrl.toString(),
        order_id: orderId,
        order_description: `Manual order payment for user ${userId}, plan ${state.planId}`,
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
      data.pay_amount !== undefined
        ? String(data.pay_amount)
        : usdtAmount.toFixed(4);
    const payUrl =
      data.invoice_url !== undefined
        ? String(data.invoice_url)
        : data.payment_url !== undefined
          ? String(data.payment_url)
          : undefined;

    pendingPaymentState.set(userId, {
      planId: state.planId,
      finalPrice,
      nowpaymentsPaymentId: String(data.payment_id),
      nowpaymentsOrderId: orderId,
      nowpaymentsPayUrl: payUrl,
      nowpaymentsPayAddress: payAddress,
      nowpaymentsPayAmount: payAmount,
    });

    const keyboard = new InlineKeyboard();
    if (payUrl) {
      keyboard
        .url(t("btnPayNow"), payUrl, {
          icon_custom_emoji_id: emojiIds.card,
          style: "success",
        })
        .row();
    }
    keyboard
      .text(t("btnVerifyPayment"), `verify_crypto_order_${state.planId}`)
      .row()
      .text(t("btnCancelManualOrder"), "cancel_manual_order");

    await ctx.editText(
      `${t("rechargeCryptoTitle")}\n\n` +
        `${t("rechargeAmount", finalPrice.toLocaleString())}\n\n` +
        `${t("rechargeCryptoAddress", payAddress)}\n\n` +
        `${t("rechargeCryptoAmount", Number(payAmount).toFixed(6))}\n` +
        `${t("rechargeCryptoNetwork", settings.cryptoNetwork ?? "TRC20")}\n\n` +
        `${t("rechargeCryptoInstructions")}`,
      {
        parse_mode: "HTML",
        reply_markup: keyboard,
      },
    );

    return;
  } catch (err) {
    console.error("[manual-order] NOWPayments request error:", err);
    await ctx.editText(t("rechargePaymentFailed"), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
  }
}
