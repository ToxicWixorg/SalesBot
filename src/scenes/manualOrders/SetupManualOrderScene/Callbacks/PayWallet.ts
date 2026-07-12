import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { bot } from "../../../../bot";
import { appliedDiscountState } from "../../../../handlers/products/discountOrderState";
import {
  DiscountCodeRepository,
  OrderRepository,
  ProductPlanRepository,
  ProductRepository,
  UserRepository,
  WalletRepository,
} from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { Context, InlineKeyboard } from "gramio";
import { emojiIds } from "../../../../shared/locales/emojies";
import { sendStepPrompt } from "../../SendStepPrompt";
import { showDayPicker } from "../../Helpers/showDayPicker";
import { getLocalizedName } from "../../../../shared/utils/localizedFields";

export async function PayWalletCallback(
  ctx: Context<any>,
  finishManualOrder: any,
) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

  // ── custom_schedule: pay first, then collect info + pick slot ────────────
  if (state.deliveryType === "custom_schedule") {
    const plan = await ProductPlanRepository.findById(state.planId);
    if (!plan) return;
    const product = await ProductRepository.findById(plan.productId);
    if (!product) return;

    // USD base price resolved on the payment screen.
    const originalPrice =
      state.basePriceUsd ??
      state.regionPrice ??
      parseFloat(plan.price as string);
    const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
    const hasDiscount =
      pendingDiscount !== undefined && pendingDiscount.planId === state.planId;
    const discountAmount = hasDiscount ? pendingDiscount.discountAmount : 0;
    const finalPrice = hasDiscount ? pendingDiscount.finalPrice : originalPrice;

    // Validate wallet balance
    const freshUser = await UserRepository.findById(userId);
    const user = freshUser;
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "fa");
    const productName = getLocalizedName(product, user.languageCode);
    const planName = getLocalizedName(plan, user.languageCode);
    const currentBalance = parseFloat(freshUser.walletBalance ?? "0");
    if (currentBalance < finalPrice) {
      await ctx.editText(
        t("insufficientBalance", {
          required: finalPrice.toFixed(2),
          current: currentBalance.toFixed(2),
        }),
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text(t("btnRechargeWallet"), "wallet", {
              icon_custom_emoji_id: emojiIds.wallet,
            })
            .row()
            .text(t("btnCancelManualOrder"), "cancel_manual_order", {
              icon_custom_emoji_id: emojiIds.reject,
            }),
        },
      );
      return;
    }

    const delivery: Record<string, string> = {};
    if (state.collected.region) delivery.region = state.collected.region;

    // Create order with waiting_schedule status (info/slot not collected yet)
    const order = await OrderRepository.create({
      userId: userId as any,
      productId: plan.productId,
      planId: plan.id,
      status: "waiting_schedule",
      quantity: 1,
      totalPrice: originalPrice.toFixed(2) as any,
      discountAmount: discountAmount.toFixed(2) as any,
      walletUsed: finalPrice.toFixed(2) as any,
      finalPrice: finalPrice.toFixed(2) as any,
      paymentMethod: "wallet",
      discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
      delivery,
    });

    // Deduct wallet
    await UserRepository.updateWalletBalance(userId, finalPrice, "subtract");
    await WalletRepository.debitBalance(
      userId,
      finalPrice.toFixed(2),
      "purchase",
      order.id,
      `خرید ${productName} - ${planName}`,
    );

    if (hasDiscount && pendingDiscount) {
      await DiscountCodeRepository.recordUsage(
        pendingDiscount.discountCodeId,
        userId,
        order.id,
        pendingDiscount.discountAmount,
      );
      appliedDiscountState.delete(userId);
    }

    // Store paid order ID in state for later slot linking
    state.paidOrderId = order.id;

    if (state.steps.length > 0) {
      // Collect info steps first
      state.phase = "info";
      state.currentStep = 0;
      await sendStepPrompt(
        ctx,
        t,
        state,
        true, // edit the payment screen
      );
    } else {
      // No info steps — go straight to day picker
      await showDayPicker(
        (text, opts) => ctx.editText(text, opts),
        t,
        state,
        plan,
      );
    }
    return;
  }

  // ── Non-scheduled products: original wallet flow ─────────────────────────
  pendingOrderInfoState.delete(userId);
  await finishManualOrder(bot, userId, state, (text: string, opts?: any) =>
    ctx.editText(text, opts),
  );
}
