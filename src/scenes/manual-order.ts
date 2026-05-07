/**
 * Manual / Custom-Schedule Order Scene
 *
 * This scene handles the conversational info-collection flow for products
 * whose deliveryType is NOT automatic/code/family_join (e.g. ChatGPT, invite-based).
 *
 * Flow:
 *   ConfirmOrder (callback) sets pendingOrderInfoState for this user
 *         ↓
 *   User types answers one by one (email → username → password → region)
 *         ↓
 *   After all steps → wallet is debited → order created (pending_admin) →
 *   admin forum notified → user receives confirmation
 */

import { type AnyBot, InlineKeyboard } from "gramio";
import { i18n } from "../shared/locales/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../repositories/ProductRepository.ts";
import { OrderRepository } from "../repositories/OrderRepository.ts";
import { WalletRepository } from "../repositories/WalletRepository.ts";
import { DiscountCodeRepository } from "../repositories/DiscountCodeRepository.ts";
import { ScheduleRepository } from "../repositories/ScheduleRepository.ts";
import { PaymentRepository } from "../repositories/PaymentRepository.ts";
import { TicketService } from "../services/bot/ticket.ts";
import {
  pendingOrderInfoState,
  type InfoStep,
  type PendingOrderInfo,
} from "../handlers/products/pendingOrderInfoState.ts";
import {
  buildOrderInfoReviewText,
  orderInfoReviewKeyboard,
} from "../handlers/products/orderInfoReview.ts";
import {
  buildPaymentSummaryText,
  paymentKeyboard,
} from "../handlers/products/orderPayment.ts";
import { pendingPaymentState } from "../handlers/products/pendingPaymentState.ts";
import { appliedDiscountState } from "../handlers/products/discountOrderState.ts";
import { preSelectedRegionState } from "../handlers/products/preSelectedRegionState.ts";
import { config } from "../config.ts";
import { emojiIds } from "../shared/locales/emojies.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Human-readable prompt key for each info step */
function getPromptKey(step: InfoStep): string {
  const map: Record<InfoStep, string> = {
    email: "manualOrderEmailPrompt",
    password: "manualOrderPasswordPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };
  return map[step];
}

/**
 * Fetch plan/product/user and display the payment confirmation screen.
 * Transitions state to "payment" phase.
 */
async function showPaymentScreen(
  sendFn: (text: string, opts?: any) => Promise<any>,
  userId: number,
  state: PendingOrderInfo,
) {
  const user = await UserRepository.findById(userId);
  if (!user) return;
  const t = i18n.buildT(user.languageCode || "en");

  const plan = await ProductPlanRepository.findById(state.planId);
  if (!plan) return;
  const product = await ProductRepository.findById(plan.productId);
  if (!product) return;

  const originalPrice = state.regionPrice ?? parseFloat(plan.price as string);
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;

  const finalPrice = hasDiscount ? pendingDiscount.finalPrice : originalPrice;
  const walletBalance = parseFloat(user.walletBalance ?? "0");

  // Fetch payment settings and active cards for dynamic keyboard
  const [paySettings, activeCards] = await Promise.all([
    PaymentRepository.getSettings(),
    PaymentRepository.getActiveCards(),
  ]);

  state.phase = "payment";

  await sendFn(
    buildPaymentSummaryText(t, {
      productName: product.name,
      planName: plan.name,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      collected: state.collected,
      originalPrice,
      discountCode: hasDiscount ? pendingDiscount.code : undefined,
      discountAmount: hasDiscount ? pendingDiscount.discountAmount : undefined,
      finalPrice,
      walletBalance,
    }),
    {
      parse_mode: "HTML",
      reply_markup: paymentKeyboard(t, state.planId, {
        settings: paySettings,
        cards: activeCards,
        walletBalance,
        finalPrice,
      }),
    },
  );
}

/** Send the current step's prompt to the user */
async function sendStepPrompt(
  ctx: any,
  t: any,
  state: PendingOrderInfo,
  isEdit = false,
) {
  const step = state.steps[state.currentStep];
  const total = state.steps.length;
  const current = state.currentStep + 1;

  const stepIndicator = t("manualOrderStep", { current, total });
  const promptText = `${stepIndicator}\n\n${t(getPromptKey(step) as any)}`;

  const keyboard = new InlineKeyboard().text(
    t("btnCancelManualOrder"),
    "cancel_manual_order",
    { icon_custom_emoji_id: emojiIds.cross },
  );

  if (isEdit) {
    await ctx.editText(promptText, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } else {
    await ctx.send(promptText, { reply_markup: keyboard, parse_mode: "HTML" });
  }
}

/** Notify the admin forum group about a new manual order by creating a proper ticket */
async function notifyAdminNewOrder(
  bot: AnyBot,
  data: {
    orderId: number;
    userId: number;
    username: string | null;
    firstName: string | null;
    productName: string;
    planName: string;
    finalPrice: number;
    collected: Partial<Record<InfoStep, string>>;
    deliveryType: string;
    paymentMethod?: string;
    scheduledSlot?: string;
  },
) {
  const t = i18n.buildT("fa");
  const userLabel = data.username
    ? `@${data.username}`
    : data.firstName || "User";

  let description =
    `🆔 Order: #${data.orderId}\n` +
    `👤 User: ${userLabel} (${data.userId})\n` +
    `📦 Product: ${data.productName}\n` +
    `📋 Plan: ${data.planName}\n` +
    `🚚 Delivery: ${data.deliveryType}\n` +
    `💰 Amount: ${data.finalPrice.toLocaleString()} Toman\n`;

  if (data.paymentMethod)
    description += `${t("adminOrderPayment")}: ${data.paymentMethod}\n`;
  if (data.collected.email)
    description += `${t("adminOrderEmail")}: ${data.collected.email}\n`;
  if (data.collected.password)
    description += `${t("adminOrderEmailPassword")}: ${data.collected.password}\n`;
  if (data.collected.loginUsername)
    description += `${t("adminOrderUsername")}: ${data.collected.loginUsername}\n`;
  if (data.collected.loginPassword)
    description += `${t("adminOrderLoginPassword")}: ${data.collected.loginPassword}\n`;
  if (data.collected.region)
    description += `${t("adminOrderRegion")}: ${data.collected.region}\n`;
  if (data.scheduledSlot)
    description += `${t("adminOrderScheduled")}: ${data.scheduledSlot}\n`;

  description += `\n⏰ ${new Date().toLocaleString("en-GB")}`;

  try {
    const ticketService = new TicketService(bot.api);
    await ticketService.createTicket({
      userId: data.userId,
      type: "order",
      title: `Order #${data.orderId} — ${data.productName} (${data.planName})`,
      description,
      orderId: data.orderId,
      priority: "high",
    });
  } catch (err) {
    console.error("[MANUAL-ORDER] Failed to create order ticket:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Finish / create the order after all info collected
// ─────────────────────────────────────────────────────────────────────────────

async function finishManualOrder(
  bot: AnyBot,
  userId: number,
  state: PendingOrderInfo,
  sendFn: (text: string, opts?: any) => Promise<any>,
) {
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  const plan = await ProductPlanRepository.findById(state.planId);
  if (!plan) {
    await sendFn("❌ Plan not found. Please start over.");
    return;
  }

  const product = await ProductRepository.findById(plan.productId);
  if (!product) {
    await sendFn("❌ Product not found. Please start over.");
    return;
  }

  const originalPrice = state.regionPrice ?? parseFloat(plan.price as string);

  // Re-check discount state (or use forwarded discount)
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;

  const discountAmount = hasDiscount ? pendingDiscount.discountAmount : 0;
  const finalPrice = hasDiscount ? pendingDiscount.finalPrice : originalPrice;

  // Re-validate wallet balance
  const freshUser = await UserRepository.findById(userId);
  const currentBalance = parseFloat(freshUser?.walletBalance ?? "0");
  if (currentBalance < finalPrice) {
    const keyboard = new InlineKeyboard()
      .text(t("btnRechargeWallet"), "wallet", {
        icon_custom_emoji_id: emojiIds.wallet,
      })
      .row()
      .text(t("btnCancel"), "cancel_order", {
        icon_custom_emoji_id: emojiIds.cross,
      });
    await sendFn(
      t("insufficientBalance", {
        required: finalPrice.toFixed(0),
        current: currentBalance.toFixed(0),
      }),
      { parse_mode: "HTML", reply_markup: keyboard },
    );
    return;
  }

  // Build delivery payload from collected info
  const delivery: Record<string, string> = {};
  if (state.collected.email) delivery.email = state.collected.email;
  if (state.collected.password) delivery.password = state.collected.password;
  if (state.collected.loginUsername)
    delivery.loginUsername = state.collected.loginUsername;
  if (state.collected.loginPassword)
    delivery.loginPassword = state.collected.loginPassword;
  if (state.collected.region) delivery.region = state.collected.region;

  // Create order with pending_admin status
  const order = await OrderRepository.create({
    userId: userId as any,
    productId: plan.productId,
    planId: plan.id,
    status: "pending_admin",
    quantity: 1,
    totalPrice: plan.price as any,
    discountAmount: discountAmount.toString() as any,
    walletUsed: finalPrice.toString() as any,
    finalPrice: finalPrice.toString() as any,
    paymentMethod: "wallet",
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
    delivery,
  });

  // Deduct wallet balance
  await UserRepository.updateWalletBalance(userId, finalPrice, "subtract");

  // Record wallet transaction
  await WalletRepository.debitBalance(
    userId,
    finalPrice.toFixed(2),
    "purchase",
    order.id,
    `خرید ${product.name} - ${plan.name}`,
  );

  // Record discount usage
  if (hasDiscount && pendingDiscount) {
    await DiscountCodeRepository.recordUsage(
      pendingDiscount.discountCodeId,
      userId,
      order.id,
      pendingDiscount.discountAmount,
    );
    appliedDiscountState.delete(userId);
  }

  // Get updated balance
  const updatedUser = await UserRepository.findById(userId);
  const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

  // Notify admin forum
  await notifyAdminNewOrder(bot, {
    orderId: order.id,
    userId,
    username: user.username ?? null,
    firstName: user.firstName ?? null,
    productName: product.name,
    planName: plan.name,
    finalPrice,
    collected: state.collected,
    deliveryType: product.deliveryType,
    paymentMethod: "wallet",
  });

  // Tell user their order was placed
  const keyboard = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders", { icon_custom_emoji_id: emojiIds.box })
    .row()
    .text(t("btnBackToMenu"), "categories", {
      icon_custom_emoji_id: emojiIds.home,
    });

  await sendFn(
    t("manualOrderPending", {
      orderId: order.id,
      productName: product.name,
      planName: plan.name,
      amount: finalPrice.toFixed(0),
      remainingBalance: newBalance.toFixed(0),
    }),
    { parse_mode: "HTML", reply_markup: keyboard },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slot Selection — for custom_schedule delivery type
// ─────────────────────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD */
function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

/** Build and send the time slot selection keyboard */
async function showSlotPicker(
  sendFn: (text: string, opts?: any) => Promise<any>,
  t: any,
  state: PendingOrderInfo,
  plan: { productId: number },
) {
  const date = todayDate();
  const slots = await ScheduleRepository.getAvailableSlots(
    date,
    plan.productId,
  );

  if (slots.length === 0) {
    // No slots available today – inform the user and let them cancel
    await sendFn(t("scheduleNoSlotsToday"), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
    return false;
  }

  // Build inline keyboard — 2 slots per row
  const kb = new InlineKeyboard();
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    const label = slot.isFull
      ? `❌ ${slot.timeSlot}`
      : `✅ ${slot.timeSlot} (${slot.capacity - slot.booked} ${t("scheduleSlotFree")})`;
    const callbackData = slot.isFull
      ? `slot_full`
      : `slot_${slot.template.id}_${date}`;
    kb.text(label, callbackData);
    if (i % 2 === 1) kb.row();
  }
  kb.row().text(t("btnCancelManualOrder"), "cancel_manual_order", {
    icon_custom_emoji_id: emojiIds.cross,
  });

  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await sendFn(t("schedulePickSlot", { date: dateLabel }), {
    parse_mode: "HTML",
    reply_markup: kb,
  });
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene setup – called once from bot.ts
// ─────────────────────────────────────────────────────────────────────────────

export function setupManualOrderScene(bot: AnyBot) {
  /** User cancels info collection or slot selection mid-flow */
  bot.callbackQuery("cancel_manual_order", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (userId) pendingOrderInfoState.delete(userId);

    const user = userId ? await UserRepository.findById(userId) : null;
    const t = i18n.buildT(user?.languageCode ?? "en");

    await ctx.editText(t("manualOrderCancelled"), {
      reply_markup: new InlineKeyboard().text(t("btnMainMenu"), "categories"),
      parse_mode: "HTML",
    });
  });

  /** Alert when a user taps a full slot */
  bot.callbackQuery("slot_full", async (ctx) => {
    const userId = ctx.from?.id;
    const user = userId ? await UserRepository.findById(userId) : undefined;
    const t = i18n.buildT(user?.languageCode ?? "fa");
    await ctx.answerCallbackQuery(t("scheduleSlotFullAlert"));
  });

  /** User selected a time slot — slot_{templateId}_{date} */
  bot.callbackQuery(/^slot_(\d+)_(\d{4}-\d{2}-\d{2})$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state || state.phase !== "slot") return;

    const [, templateIdStr, date] = ctx.queryData as [string, string, string];
    const templateId = parseInt(templateIdStr);

    // Re-check slot availability (protect against race condition)
    const slots = await ScheduleRepository.getAvailableSlots(date);
    const slot = slots.find((s) => s.template.id === templateId);

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");

    if (!slot || slot.isFull) {
      await ctx.answerCallbackQuery(t("scheduleSlotFullAlert"));
      // Refresh the picker
      const plan = await ProductPlanRepository.findById(state.planId);
      if (plan)
        await showSlotPicker(
          (text, opts) => ctx.editText(text, opts),
          t,
          state,
          plan,
        );
      return;
    }

    // Transition: finish the order with the selected slot
    pendingOrderInfoState.delete(userId);
    await finishManualOrderWithSlot(
      bot,
      userId,
      state,
      { templateId, date, timeSlot: slot.timeSlot },
      (text, opts) => ctx.editText(text, opts),
    );
  });

  /** Intercept every incoming text message to collect pending info */
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.text) return next?.();

    const state = pendingOrderInfoState.get(userId);
    if (!state) return next?.();

    // Ignore text during slot/review phases
    if (state.phase === "slot" || state.phase === "review") return next?.();

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
        // Transition to slot selection phase
        state.phase = "slot";
        const shown = await showSlotPicker(
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
      await sendStepPrompt(ctx, t, state, false);
    }
  });

  /** User confirms collected info — show payment screen */
  bot.callbackQuery(/^confirm_info_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state || state.phase !== "review") return;

    await showPaymentScreen(
      (text, opts) => ctx.editText(text, opts),
      userId,
      state,
    );
  });

  /** User pays from wallet — create the order */
  bot.callbackQuery(/^pay_wallet_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state || state.phase !== "payment") return;

    pendingOrderInfoState.delete(userId);
    await finishManualOrder(bot, userId, state, (text, opts) =>
      ctx.editText(text, opts),
    );
  });

  /** User chooses card payment */
  bot.callbackQuery(/^pay_card_(\d+)$/, async (ctx) => {
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
  });

  /** User confirms they transferred via card */
  bot.callbackQuery(/^confirm_card_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state || state.phase !== "payment") return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const result = await createPendingPaymentOrder(userId, state, "card");
    if (!result) {
      await ctx.editText(t("errorFetchingOrderDetails"), {
        parse_mode: "HTML",
      });
      return;
    }

    pendingOrderInfoState.delete(userId);
    pendingPaymentState.delete(userId);

    // Notify admin
    await notifyAdminNewOrder(bot, {
      orderId: result.orderId,
      userId,
      username: user?.username ?? null,
      firstName: user?.firstName ?? null,
      productName: result.productName,
      planName: result.planName,
      finalPrice: result.finalPrice,
      collected: state.collected,
      deliveryType: "manual",
      paymentMethod: "card",
    });

    await ctx.editText(t("payCardPending" as any, result.orderId as any), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnMyOrders"), "orders", {
          icon_custom_emoji_id: emojiIds.box,
        })
        .row()
        .text(t("btnBackToMenu"), "categories", {
          icon_custom_emoji_id: emojiIds.home,
        }),
    });
  });

  /** User chooses ZarinPal payment */
  bot.callbackQuery(/^pay_zarinpal_(\d+)$/, async (ctx) => {
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
            .url(t("btnPayNow"), payUrl)
            .row()
            .text(
              t("btnVerifyPayment"),
              `verify_zarinpal_order_${state.planId}`,
            )
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
  });

  /** Verify ZarinPal order payment */
  bot.callbackQuery(/^verify_zarinpal_order_(\d+)$/, async (ctx) => {
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

    try {
      const resp = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: settings.zarinpalMerchantId,
          amount: Math.round(payState.finalPrice) * 10,
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
          deliveryType: "manual",
          paymentMethod: "zarinpal",
        });

        await ctx.editText(
          t("rechargeZarinpalSuccess", result.finalPrice.toLocaleString()),
          {
            parse_mode: "HTML",
            reply_markup: new InlineKeyboard()
              .text(t("btnMyOrders"), "orders", {
                icon_custom_emoji_id: emojiIds.box,
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
              .url(t("btnPayNow"), payState.zarinpalPayUrl!)
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
  });

  /** User chooses crypto/USDT payment */
  bot.callbackQuery(/^pay_crypto_(\d+)$/, async (ctx) => {
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
  });

  /** User confirms crypto transfer done */
  bot.callbackQuery(/^confirm_crypto_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state || state.phase !== "payment") return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const result = await createPendingPaymentOrder(userId, state, "crypto");
    if (!result) {
      await ctx.editText(t("errorFetchingOrderDetails"), {
        parse_mode: "HTML",
      });
      return;
    }

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
      deliveryType: "manual",
      paymentMethod: "crypto",
    });

    await ctx.editText(t("payCryptoPending" as any, result.orderId as any), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnMyOrders"), "orders", {
          icon_custom_emoji_id: emojiIds.box,
        })
        .row()
        .text(t("btnBackToMenu"), "categories", {
          icon_custom_emoji_id: emojiIds.home,
        }),
    });
  });

  /** User wants to re-edit a specific field */
  bot.callbackQuery(/^edit_info_(\d+)_(\w+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = pendingOrderInfoState.get(userId);
    if (!state) return;

    const [, , stepName] = ctx.queryData as [string, string, string];
    const step = stepName as InfoStep;
    if (!state.steps.includes(step)) return;

    state.editingStep = step;
    state.phase = "info";

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");

    const promptKey = getPromptKey(step);
    await ctx.editText(t(promptKey as any), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
  });
}

/** Called directly from ConfirmOrder when no info steps are needed */
export async function createManualOrderDirect(
  bot: AnyBot,
  userId: number,
  planId: number,
  deliveryType: string,
  editFn: (text: string, opts?: any) => Promise<any>,
  preCollected?: Partial<Record<InfoStep, string>>,
) {
  const preRegion = preSelectedRegionState.get(userId);
  const regionPrice =
    preRegion?.planId === planId ? preRegion.price : undefined;
  if (preRegion?.planId === planId) preSelectedRegionState.delete(userId);

  const state: PendingOrderInfo = {
    planId,
    deliveryType,
    phase: "info",
    steps: [],
    currentStep: 0,
    collected: preCollected ?? {},
    discount: appliedDiscountState.get(userId),
    regionPrice,
  };

  // If custom_schedule with no info steps, show slot picker immediately
  if (deliveryType === "custom_schedule") {
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");
    const plan = await ProductPlanRepository.findById(planId);
    if (plan) {
      state.phase = "slot";
      pendingOrderInfoState.set(userId, state);
      try {
        const shown = await showSlotPicker(editFn, t, state, plan);
        if (shown) return; // wait for slot callback
      } catch (err) {
        console.error("[createManualOrderDirect] showSlotPicker error:", err);
      }
      // No slots shown (empty or error) — clean up state, do NOT create order
      pendingOrderInfoState.delete(userId);
      return;
    }
  }

  // Show payment confirmation screen
  pendingOrderInfoState.set(userId, state);
  await showPaymentScreen(editFn, userId, state);
}

// ─────────────────────────────────────────────────────────────────────────────
// finishManualOrderWithSlot — same as finishManualOrder but creates a schedule row
// ─────────────────────────────────────────────────────────────────────────────

async function finishManualOrderWithSlot(
  bot: AnyBot,
  userId: number,
  state: PendingOrderInfo,
  slot: { templateId: number; date: string; timeSlot: string },
  sendFn: (text: string, opts?: any) => Promise<any>,
) {
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");
  const plan = await ProductPlanRepository.findById(state.planId);
  if (!plan) {
    await sendFn("❌ Plan not found.");
    return;
  }
  const product = await ProductRepository.findById(plan.productId);
  if (!product) {
    await sendFn("❌ Product not found.");
    return;
  }

  const originalPrice = state.regionPrice ?? parseFloat(plan.price as string);
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;
  const discountAmount = hasDiscount ? pendingDiscount.discountAmount : 0;
  const finalPrice = hasDiscount ? pendingDiscount.finalPrice : originalPrice;

  // Re-validate wallet
  const freshUser = await UserRepository.findById(userId);
  const currentBalance = parseFloat(freshUser?.walletBalance ?? "0");
  if (currentBalance < finalPrice) {
    const keyboard = new InlineKeyboard()
      .text(t("btnRechargeWallet"), "wallet", {
        icon_custom_emoji_id: emojiIds.wallet,
      })
      .row()
      .text(t("btnCancel"), "cancel_order", {
        icon_custom_emoji_id: emojiIds.cross,
      });
    await sendFn(
      t("insufficientBalance", {
        required: finalPrice.toFixed(0),
        current: currentBalance.toFixed(0),
      }),
      { parse_mode: "HTML", reply_markup: keyboard },
    );
    return;
  }

  const delivery: Record<string, string> = {};
  if (state.collected.email) delivery.email = state.collected.email;
  if (state.collected.password) delivery.password = state.collected.password;
  if (state.collected.loginUsername)
    delivery.loginUsername = state.collected.loginUsername;
  if (state.collected.loginPassword)
    delivery.loginPassword = state.collected.loginPassword;
  if (state.collected.region) delivery.region = state.collected.region;

  // Create order as "scheduled"
  const order = await OrderRepository.create({
    userId: userId as any,
    productId: plan.productId,
    planId: plan.id,
    status: "scheduled",
    quantity: 1,
    totalPrice: plan.price as any,
    discountAmount: discountAmount.toString() as any,
    walletUsed: finalPrice.toString() as any,
    finalPrice: finalPrice.toString() as any,
    paymentMethod: "wallet",
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
    delivery,
    scheduledTime: new Date(`${slot.date}T${slot.timeSlot.split("-")[0]}:00`),
    schedule: {
      templateId: slot.templateId,
      date: slot.date,
      timeSlot: slot.timeSlot,
    },
  });

  // Deduct wallet
  await UserRepository.updateWalletBalance(userId, finalPrice, "subtract");
  await WalletRepository.debitBalance(
    userId,
    finalPrice.toFixed(2),
    "purchase",
    order.id,
    `خرید ${product.name} - ${plan.name}`,
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

  // Create schedule booking row
  await ScheduleRepository.createBooking(
    slot.templateId,
    slot.date,
    slot.timeSlot,
    order.id,
    userId,
  );

  // Notify admin forum
  await notifyAdminNewOrder(bot, {
    orderId: order.id,
    userId,
    username: user.username ?? null,
    firstName: user.firstName ?? null,
    productName: product.name,
    planName: plan.name,
    finalPrice,
    collected: state.collected,
    deliveryType: product.deliveryType,
    paymentMethod: "wallet",
    scheduledSlot: `${slot.date} ${slot.timeSlot}`,
  });

  const updatedUser = await UserRepository.findById(userId);
  const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

  const keyboard = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders", { icon_custom_emoji_id: emojiIds.box })
    .row()
    .text(t("btnBackToMenu"), "categories", {
      icon_custom_emoji_id: emojiIds.home,
    });
  await sendFn(
    t("scheduleBooked", {
      orderId: order.id,
      productName: product.name,
      planName: plan.name,
      timeSlot: slot.timeSlot,
      date: slot.date,
      amount: finalPrice.toFixed(0),
      remainingBalance: newBalance.toFixed(0),
    }),
    { parse_mode: "HTML", reply_markup: keyboard },
  );
}

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
