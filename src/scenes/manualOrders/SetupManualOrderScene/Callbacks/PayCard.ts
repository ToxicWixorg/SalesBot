import { Context, InlineKeyboard } from "gramio";
import {
  ProductPlanRepository,
  UserRepository,
} from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { appliedDiscountState } from "../../../../handlers/products/discountOrderState";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";

export async function PayCardCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

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
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount && pendingDiscount.planId === state.planId;
  const finalPrice = hasDiscount
    ? pendingDiscount.finalPrice
    : parseFloat((plan?.price as string) ?? "0");

  // Build card instructions — show all active cards
  let msg = `💳 <b>${t("paymentSummaryTitle" as any)}</b>\n\n💰 ${finalPrice.toLocaleString()} ${t("currency")}\n\n`;
  for (const card of cards) {
    msg += `🏦 ${card.bankName ?? ""} — ${card.holderName}\n`;
    msg += `<code>${card.cardNumber}</code>\n\n`;
  }
  // Prompt user to confirm after transferring
  const cardNoteKey = "payCardConfirmNote" as any;
  msg += t(cardNoteKey);

  pendingPaymentState.set(userId, { planId: state.planId, finalPrice });

  await ctx.editText(msg, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text(t("btnConfirmCardPayment" as any), `confirm_card_${state.planId}`)
      .row()
      .text(t("btnCancelManualOrder"), "cancel_manual_order"),
  });
}
