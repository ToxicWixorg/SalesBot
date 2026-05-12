import { type AnyBot, InlineKeyboard } from "gramio";
import { OrderRepository, UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { notifyAdminNewOrder } from "../../Helpers/notifyAdminNewOrder";
import { emojiIds } from "../../../../shared/locales/emojies";

export async function VerifyCryptoOrderCallback(
  ctx: any,
  createPendingPaymentOrder: any,
  bot: AnyBot,
) {
  await ctx.answerCallbackQuery({ text: "⏳..." });

  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  const payState = pendingPaymentState.get(userId);

  if (!state || state.phase !== "payment" || !payState?.nowpaymentsPaymentId) {
    return;
  }

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const settings = await PaymentRepository.getSettings();
  if (!settings?.nowpaymentsEnabled || !settings.nowpaymentsApiKey) {
    await ctx.reply(t("rechargeMethodDisabled"), { parse_mode: "HTML" });
    return;
  }

  try {
    const resp = await fetch(
      `https://api.nowpayments.io/v1/payment/${payState.nowpaymentsPaymentId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": settings.nowpaymentsApiKey,
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    const data = (await resp.json()) as any;
    const status = String(data?.payment_status ?? "unknown").toLowerCase();

    if (status === "finished") {
      const paymentId = String(
        data?.payment_id ?? payState.nowpaymentsPaymentId ?? "crypto-payment",
      );

      const result = await createPendingPaymentOrder(
        userId,
        state,
        "crypto",
        paymentId,
      );
      if (!result) return;

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
        paymentMethod: "crypto",
      });

      await ctx.editText(
        t("rechargeZarinpalSuccess", result.finalPrice.toLocaleString()),
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

      return;
    }

    const keyboard = new InlineKeyboard();
    if (payState.nowpaymentsPayUrl) {
      keyboard
        .url(t("btnPayNow"), payState.nowpaymentsPayUrl, {
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
      `${t("rechargePaymentPending")}\n\nStatus: <code>${status}</code>`,
      {
        parse_mode: "HTML",
        reply_markup: keyboard,
      },
    );
  } catch (err) {
    console.error("[manual-order] NOWPayments verify error:", err);
    await ctx.reply(t("rechargePaymentFailed"), { parse_mode: "HTML" });
  }
}
