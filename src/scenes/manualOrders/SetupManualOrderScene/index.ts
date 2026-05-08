import { AnyBot } from "gramio";
import { i18n } from "../../../shared/locales";
import {
  buildOrderInfoReviewText,
  orderInfoReviewKeyboard,
} from "../../../handlers/products/orderInfoReview";

import { CancelManualOrderCallback } from "./Callbacks/CancelManualOrder";
import { SlotFullCallback } from "./Callbacks/SlotFull";
import { SlotCallback } from "./Callbacks/Slot";
import {
  PendingOrderInfo,
  pendingOrderInfoState,
} from "../../../handlers/products/pendingOrderInfoState";
import {
  OrderRepository,
  ProductPlanRepository,
  ProductRepository,
  UserRepository,
} from "../../../repositories";
import { ConfirmInfoCallback } from "./Callbacks/ConfirmInfo";
import { PayWalletCallback } from "./Callbacks/PayWallet";
import { PayCardCallback } from "./Callbacks/PayCard";
import { ConfirmCardCallback } from "./Callbacks/ConfirmCard";
import { finishManualOrder } from "../Helpers/finishManualOrder";
import { PayZarinpalCallback } from "./Callbacks/PayZarinpal";
import { VerifyZarinpalOrderCallback } from "./Callbacks/VerifyZarinpalOrder";
import { PayCryptoCallback } from "./Callbacks/PayCrypto";
import { ConfirmCryptoCallback } from "./Callbacks/ConfirmCrypto";
import { sendStepPrompt } from "../SendStepPrompt";
import { appliedDiscountState } from "../../../handlers/products/discountOrderState";
import { getPromptKey } from "../Helpers/getPromptKey";
import { showDayPicker } from "../Helpers/showDayPicker";
import { showSlotPicker } from "../Helpers/showSlotPicker";
import { finishManualOrderWithSlot } from "../Helpers/finishManualOrderWithSlot";
import { notifyAdminNewOrder } from "../Helpers/notifyAdminNewOrder";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create an unpaid order (card / crypto / zarinpal flow)
// Returns the created order ID.
// ─────────────────────────────────────────────────────────────────────────────

async function createPendingPaymentOrder(
  userId: number,
  state: PendingOrderInfo,
  paymentMethod: "card" | "zarinpal" | "crypto",
  paymentId?: string,
): Promise<{
  orderId: number;
  finalPrice: number;
  productName: string;
  planName: string;
} | null> {
  const plan = await ProductPlanRepository.findById(state.planId);
  if (!plan) return null;
  const product = await ProductRepository.findById(plan.productId);
  if (!product) return null;

  const originalPrice = state.regionPrice ?? parseFloat(plan.price as string);
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;
  const discountAmount = hasDiscount ? pendingDiscount.discountAmount : 0;
  const finalPrice = hasDiscount ? pendingDiscount.finalPrice : originalPrice;

  const delivery: Record<string, string> = {};
  if (state.collected.email) delivery.email = state.collected.email;
  if (state.collected.password) delivery.password = state.collected.password;
  if (state.collected.loginUsername)
    delivery.loginUsername = state.collected.loginUsername;
  if (state.collected.loginPassword)
    delivery.loginPassword = state.collected.loginPassword;
  if (state.collected.region) delivery.region = state.collected.region;

  const order = await OrderRepository.create({
    userId: userId as any,
    productId: plan.productId,
    planId: plan.id,
    status: "pending_payment",
    quantity: 1,
    totalPrice: plan.price as any,
    discountAmount: discountAmount.toString() as any,
    walletUsed: "0" as any,
    finalPrice: finalPrice.toString() as any,
    paymentMethod,
    paymentId: paymentId ?? null,
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
    delivery,
  });

  return {
    orderId: order.id,
    finalPrice,
    productName: product.name,
    planName: plan.name,
  };
}

export function setupManualOrderScene(bot: AnyBot) {
  /** User cancels info collection or slot selection mid-flow */
  bot.callbackQuery("cancel_manual_order", async (ctx) => {
    return await CancelManualOrderCallback(ctx);
  });

  /** Alert when a user taps a full slot */
  bot.callbackQuery("slot_full", async (ctx) => {
    return await SlotFullCallback(ctx);
  });

  /** User selected a time slot — slot_{templateId}_{date} */
  bot.callbackQuery(/^slot_(\d+)_(\d{4}-\d{2}-\d{2})$/, async (ctx) => {
    return await SlotCallback(
      ctx,
      showSlotPicker,
      finishManualOrderWithSlot,
      bot,
    );
  });

  /** Intercept every incoming text message to collect pending info */
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.text) return next?.();

    const state = pendingOrderInfoState.get(userId);
    if (!state) return next?.();

    // Ignore text during non-input phases
    if (
      state.phase === "slot" ||
      state.phase === "review" ||
      state.phase === "day" ||
      state.phase === "payment"
    )
      return next?.();

    const answer = ctx.text.trim();
    if (!answer) return next?.();

    // ── Re-edit mode: user is fixing a single field from review ──────────
    if (state.editingStep) {
      state.collected[state.editingStep] = answer;
      state.editingStep = undefined;
      state.phase = "review";

      const user = await UserRepository.findById(userId);
      const t = i18n.buildT(user?.languageCode ?? "en");

      await ctx.send(buildOrderInfoReviewText(t, state), {
        parse_mode: "HTML",
        reply_markup: orderInfoReviewKeyboard(t, state.planId, state.steps),
      });
      return;
    }

    // ── Normal info-collection flow ───────────────────────────────────────
    const step = state.steps[state.currentStep];
    state.collected[step] = answer;
    state.currentStep++;

    if (state.currentStep >= state.steps.length) {
      const user = await UserRepository.findById(userId);
      const t = i18n.buildT(user?.languageCode ?? "en");
      const plan = await ProductPlanRepository.findById(state.planId);

      const needsSlot = state.deliveryType === "custom_schedule" && plan;

      if (needsSlot) {
        // For custom_schedule: after info collection, show day picker
        const shown = await showDayPicker(
          (text, opts) => ctx.send(text, opts),
          t,
          state,
          plan,
        );
        if (!shown) {
          pendingOrderInfoState.delete(userId);
        }
      } else {
        // All info done — show review screen
        state.phase = "review";
        await ctx.send(buildOrderInfoReviewText(t, state), {
          parse_mode: "HTML",
          reply_markup: orderInfoReviewKeyboard(t, state.planId, state.steps),
        });
      }
    } else {
      // Ask next step
      const user = await UserRepository.findById(userId);
      const t = i18n.buildT(user?.languageCode ?? "en");
      await sendStepPrompt(ctx, t, state, false, getPromptKey);
    }
  });

  /** User confirms collected info — show payment screen */
  bot.callbackQuery(/^confirm_info_(\d+)$/, async (ctx) => {
    return await ConfirmInfoCallback(ctx);
  });

  /** User pays from wallet — create the order */
  bot.callbackQuery(/^pay_wallet_(\d+)$/, async (ctx) => {
    return await PayWalletCallback(ctx, finishManualOrder);
  });

  /** User chooses card payment */
  bot.callbackQuery(/^pay_card_(\d+)$/, async (ctx) => {
    return await PayCardCallback(ctx);
  });

  /** User confirms they transferred via card */
  bot.callbackQuery(/^confirm_card_(\d+)$/, async (ctx) => {
    return await ConfirmCardCallback(
      ctx,
      createPendingPaymentOrder,
      notifyAdminNewOrder,
      bot,
    );
  });

  /** User chooses ZarinPal payment */
  bot.callbackQuery(/^pay_zarinpal_(\d+)$/, async (ctx) => {
    return await PayZarinpalCallback(ctx, bot);
  });

  /** Verify ZarinPal order payment */
  bot.callbackQuery(/^verify_zarinpal_order_(\d+)$/, async (ctx) => {
    return await VerifyZarinpalOrderCallback(
      ctx,
      createPendingPaymentOrder,
      bot,
    );
  });

  /** User chooses crypto/USDT payment */
  bot.callbackQuery(/^pay_crypto_(\d+)$/, async (ctx) => {
    return await PayCryptoCallback(ctx);
  });

  /** User confirms crypto transfer done */
  bot.callbackQuery(/^confirm_crypto_(\d+)$/, async (ctx) => {
    return await ConfirmCryptoCallback(ctx, createPendingPaymentOrder, bot);
  });

  /** User wants to re-edit a specific field */
  bot.callbackQuery(/^edit_info_(\d+)_(\w+)$/, async (ctx) => {});

  /** User selected a day of week — slot_day_{0-6} */
  bot.callbackQuery(/^slot_day_([0-6])$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state || state.phase !== "day") return;

    const match = ctx.queryData.match(/^slot_day_([0-6])$/);
    if (!match) return;
    const dayOfWeek = parseInt(match[1]!);

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const plan = await ProductPlanRepository.findById(state.planId);
    if (!plan) return;

    // Compute the next calendar date for this day of week
    const date = ScheduleRepository.getNextDateForDayOfWeek(dayOfWeek);
    state.pendingDayOfWeek = dayOfWeek;
    state.phase = "slot";

    const shown = await showSlotPicker(
      (text, opts) => ctx.editText(text, opts),
      t,
      state,
      plan,
      date,
    );
    if (!shown) {
      // No slots on this day — go back to day picker
      state.phase = "day";
      await showDayPicker(
        (text, opts) => ctx.editText(text, opts),
        t,
        state,
        plan,
      );
    }
  });
}
