import { type AnyBot, Context, InlineKeyboard } from "gramio";
import { OrderRepository, UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { notifyAdminNewOrder } from "../../Helpers/notifyAdminNewOrder";
import { emojiIds } from "../../../../shared/locales/emojies";
import { getUsdtRate } from "../../../../services/tetherland";

export async function VerifyZarinpalOrderCallback(
  ctx: Context,
  createPendingPaymentOrder: any,
  bot: AnyBot,
) {
  await ctx.answerCallbackQuery({ text: "⏳..." });
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  const payState = pendingPaymentState.get(userId);
  if (!state || state.phase !== "payment" || !payState?.zarinpalAuthority)
    return;

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const settings = await PaymentRepository.getSettings();
  if (!settings?.zarinpalMerchantId) return;

  const verifyUrl = settings.zarinpalSandbox
    ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
    : "https://api.zarinpal.com/pg/v4/payment/verify.json";

  // The stored amount is USD; Zarinpal was charged in Rial. Recompute the same
  // Rial amount with the live USD→Toman rate. Abort if the rate is unavailable.
  const usdtRate = await getUsdtRate();
  if (usdtRate === null || !(usdtRate > 0)) {
    await ctx.reply(t("priceRateUnavailable"), { parse_mode: "HTML" });
    return;
  }
  const amountRial = Math.round(payState.finalPrice * usdtRate) * 10;

  try {
    const resp = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: settings.zarinpalMerchantId,
        amount: amountRial,
        authority: payState.zarinpalAuthority,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await resp.json()) as any;
    const code: number = data?.data?.code ?? -1;

    if (code === 100 || code === 101) {
      const refId: string = String(
        data?.data?.ref_id ?? payState.zarinpalAuthority,
      );
      const result = await createPendingPaymentOrder(
        userId,
        state,
        "zarinpal",
        refId,
      );
      if (!result) return;

      // Mark as paid immediately since ZarinPal confirmed
      await OrderRepository.updateStatus(result.orderId, "pending_admin");

      pendingOrderInfoState.delete(userId);
      pendingPaymentState.delete(userId);

      await notifyAdminNewOrder(bot, {
        orderId: result.orderId,
        userId,
        username: user?.username ?? null,
        firstName: user?.firstName ?? null,
        productName: result.productName,
        planName: result.planName,
        finalPrice: result.finalPrice,
        collected: state.collected,
        steps: state.steps,
        deliveryType: "manual",
        paymentMethod: "zarinpal",
      });

      await ctx.editText(
        t("rechargeZarinpalSuccess", result.finalPrice.toFixed(2)),
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text(t("btnMyOrders"), "orders", {
              icon_custom_emoji_id: emojiIds.bag,
            })
            .row()
            .text(t("btnBackToMenu"), "categories", {
              icon_custom_emoji_id: emojiIds.home,
            }),
        },
      );
    } else {
      await ctx.editText(
        t("rechargeZarinpalFailed") + "\n\n" + t("rechargeZarinpalRetry"),
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url(t("btnPayNow"), payState.zarinpalPayUrl!, {
              icon_custom_emoji_id: emojiIds.card,
              style: "success",
            })
            .row()
            .text(
              t("btnVerifyPayment"),
              `verify_zarinpal_order_${state.planId}`,
            )
            .row()
            .text(t("btnCancelManualOrder"), "cancel_manual_order"),
        },
      );
    }
  } catch (err) {
    console.error("[manual-order] ZarinPal verify error:", err);
    await ctx.reply(t("rechargeZarinpalFailed"), { parse_mode: "HTML" });
  }
}
