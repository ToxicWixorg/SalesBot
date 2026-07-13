import { Context, InlineKeyboard } from "gramio";
import {
  ProductPlanRepository,
  UserRepository,
} from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";
import {
  formatToman,
  getCardTomanAmount,
} from "../../../../shared/utils/currency";
import { resolveOrderPricing } from "../../Helpers/orderPricing";

export async function PayCardCallback(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") {
    await ctx.answerCallbackQuery({
      text: "جلسه پرداخت منقضی شده، لطفاً دوباره سفارش را شروع کنید.",
      show_alert: true,
    });
    return;
  }

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

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

  const plan = await ProductPlanRepository.findById(state.planId);
  // Scheduled products are wallet-only (their slot picker runs on the wallet
  // path). Guard against a stale card button from an old payment screen.
  if (plan?.deliveryType === "custom_schedule") {
    await ctx.answerCallbackQuery({
      text: "⛔ این محصول زمان‌بندی‌شده است و فقط با کیف پول قابل پرداخت است.",
      show_alert: true,
    });
    return;
  }
  const finalPrice = resolveOrderPricing(
    userId,
    state,
    parseFloat((plan?.price as string) ?? "0"),
  ).totalFinal;

  // Card-to-card is a Toman transfer — convert the canonical USD total to Toman
  // (snapshotting the rate) so the user pays and the admin reviews in Toman.
  const converted = await getCardTomanAmount(finalPrice);
  if (!converted) {
    await ctx.answerCallbackQuery({
      text: t("rateUnavailable"),
      show_alert: true,
    });
    return;
  }

  // Build card instructions — show all active cards
  let msg = `💳 <b>${t("paymentSummaryTitle" as any)}</b>\n\n💰 ${formatToman(converted.toman)} تومان\n\n`;
  for (const card of cards) {
    msg += `🏦 ${card.bankName ?? ""} — ${card.holderName}\n`;
    msg += `<code>${card.cardNumber}</code>\n\n`;
  }
  msg += `📸 ${t("rechargeCardSendReceipt" as any)}`;

  pendingPaymentState.set(userId, {
    planId: state.planId,
    finalPrice,
    awaitingCardReceipt: true,
    cardTomanAmount: converted.toman,
    cardUsdtRate: converted.rate,
  });

  await ctx.editText(msg, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(
      t("btnCancelManualOrder"),
      "cancel_manual_order",
    ),
  });

  await ctx.answerCallbackQuery();
}
