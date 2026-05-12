import { type AnyBot, Context, InlineKeyboard } from "gramio";
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

export async function PayZarinpalCallback(ctx: Context, bot: AnyBot) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

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

  const plan = await ProductPlanRepository.findById(state.planId);
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount && pendingDiscount.planId === state.planId;
  const finalPrice = hasDiscount
    ? pendingDiscount.finalPrice
    : parseFloat((plan?.price as string) ?? "0");

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
        amount: Math.round(finalPrice) * 10, // Toman → Rial
        description: `سفارش اشتراک - کاربر ${userId}`,
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

    pendingPaymentState.set(userId, {
      planId: state.planId,
      finalPrice,
      zarinpalAuthority: authority,
      zarinpalPayUrl: payUrl,
    });

    await ctx.editText(
      `${t("rechargeZarinpalTitle")}\n\n${t("rechargeAmount", finalPrice.toLocaleString())}\n\n${t("rechargeZarinpalInstructions")}`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .url(t("btnPayNow"), payUrl, {
            icon_custom_emoji_id: emojiIds.card,
            style: "success",
          })
          .row()
          .text(t("btnVerifyPayment"), `verify_zarinpal_order_${state.planId}`)
          .row()
          .text(t("btnCancelManualOrder"), "cancel_manual_order"),
      },
    );
  } catch (err) {
    console.error("[manual-order] ZarinPal request error:", err);
    await ctx.editText(t("rechargeZarinpalFailed"), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
  }
}
