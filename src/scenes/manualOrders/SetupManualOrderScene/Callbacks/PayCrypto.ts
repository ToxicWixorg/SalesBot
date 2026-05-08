import { Context, InlineKeyboard } from "gramio";
import {
  ProductPlanRepository,
  UserRepository,
} from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { appliedDiscountState } from "../../../../handlers/products/discountOrderState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";

export async function PayCryptoCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const settings = await PaymentRepository.getSettings();
  if (
    !settings?.cryptoEnabled ||
    !settings.cryptoAddress ||
    (settings.cryptoExchangeRate ?? 0) <= 0
  ) {
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

  const usdtAmount = finalPrice / settings.cryptoExchangeRate!;

  pendingPaymentState.set(userId, { planId: state.planId, finalPrice });

  await ctx.editText(
    `${t("rechargeCryptoTitle")}\n\n` +
      `${t("rechargeAmount", finalPrice.toLocaleString())}\n\n` +
      `${t("rechargeCryptoAddress", settings.cryptoAddress)}\n\n` +
      `${t("rechargeCryptoAmount", usdtAmount.toFixed(4))}\n` +
      `${t("rechargeCryptoNetwork", settings.cryptoNetwork ?? "TRC20")}\n\n` +
      `${t("payCryptoConfirmNote" as any)}`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(
          t("btnConfirmCryptoPayment" as any),
          `confirm_crypto_${state.planId}`,
        )
        .row()
        .text(t("btnCancelManualOrder"), "cancel_manual_order"),
    },
  );
}
