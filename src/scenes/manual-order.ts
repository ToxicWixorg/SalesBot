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
import {
  pendingOrderInfoState,
  type InfoStep,
  type PendingOrderInfo,
} from "../handlers/products/pendingOrderInfoState.ts";
import { appliedDiscountState } from "../handlers/products/discountOrderState.ts";
import { config } from "../config.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Human-readable prompt key for each info step */
function getPromptKey(step: InfoStep): string {
  const map: Record<InfoStep, string> = {
    email: "manualOrderEmailPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };
  return map[step];
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

/** Notify the admin forum group about a new manual order */
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
    scheduledSlot?: string;
  },
) {
  if (!config.SUPPORT_GROUP_ID || !config.ORDERS_TOPIC_ID) return;

  const userLabel = data.username
    ? `@${data.username}`
    : data.firstName || "User";

  let msg =
    `🆕 <b>New Manual Order</b>\n\n` +
    `🆔 Order: <b>#${data.orderId}</b>\n` +
    `👤 User: ${userLabel} (<code>${data.userId}</code>)\n` +
    `📦 Product: <b>${data.productName}</b>\n` +
    `📋 Plan: ${data.planName}\n` +
    `🚚 Type: <code>${data.deliveryType}</code>\n` +
    `💰 Amount: <b>${data.finalPrice.toLocaleString()}</b> Toman\n`;

  if (data.collected.email)
    msg += `📧 Email: <code>${data.collected.email}</code>\n`;
  if (data.collected.loginUsername)
    msg += `👤 Username: <code>${data.collected.loginUsername}</code>\n`;
  if (data.collected.loginPassword)
    msg += `🔐 Password: <code>${data.collected.loginPassword}</code>\n`;
  if (data.collected.region)
    msg += `🌍 Region: <code>${data.collected.region}</code>\n`;

  if (data.scheduledSlot) msg += `📅 Scheduled: <b>${data.scheduledSlot}</b>\n`;

  msg += `\n⏰ ${new Date().toLocaleString("en-GB")}`;

  try {
    await (bot.api as any).sendMessage({
      chat_id: Number(config.SUPPORT_GROUP_ID),
      message_thread_id: config.ORDERS_TOPIC_ID,
      text: msg,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("[MANUAL-ORDER] Failed to notify admin forum:", err);
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

  const originalPrice = parseFloat(plan.price as string);

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
      .text(t("btnRechargeWallet"), "wallet")
      .row()
      .text(t("btnCancel"), "cancel_order");
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
  });

  // Tell user their order was placed
  const keyboard = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders")
    .row()
    .text(t("btnBackToMenu"), "categories");

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
    // No slots configured – fall back to manual pending order flow
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
  kb.row().text(t("btnCancelManualOrder"), "cancel_manual_order");

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
    });
  });

  /** Alert when a user taps a full slot */
  bot.callbackQuery("slot_full", async (ctx) => {
    await ctx.answerCallbackQuery(
      "❌ این بازه پر شده، یک بازه دیگر انتخاب کنید",
    );
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

    // During slot selection phase, ignore text messages
    if (state.phase === "slot") return next?.();

    const answer = ctx.text.trim();
    if (!answer) return next?.();

    const step = state.steps[state.currentStep];
    state.collected[step] = answer;
    state.currentStep++;

    if (state.currentStep >= state.steps.length) {
      // All info steps done — decide next phase
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
          // No templates configured, fall through to pending_admin
          pendingOrderInfoState.delete(userId);
          await finishManualOrder(bot, userId, state, (text, opts) =>
            ctx.send(text, opts),
          );
        }
      } else {
        // manual/invite/etc — no slot needed
        pendingOrderInfoState.delete(userId);
        await finishManualOrder(bot, userId, state, (text, opts) =>
          ctx.send(text, opts),
        );
      }
    } else {
      // Ask next step
      const user = await UserRepository.findById(userId);
      const t = i18n.buildT(user?.languageCode ?? "en");
      await sendStepPrompt(ctx, t, state, false);
    }
  });
}

/** Called directly from ConfirmOrder when no info steps are needed */
export async function createManualOrderDirect(
  bot: AnyBot,
  userId: number,
  planId: number,
  deliveryType: string,
  editFn: (text: string, opts?: any) => Promise<any>,
) {
  const state: PendingOrderInfo = {
    planId,
    deliveryType,
    phase: "info",
    steps: [],
    currentStep: 0,
    collected: {},
    discount: appliedDiscountState.get(userId),
  };

  // If custom_schedule with no info steps, show slot picker immediately
  if (deliveryType === "custom_schedule") {
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");
    const plan = await ProductPlanRepository.findById(planId);
    if (plan) {
      state.phase = "slot";
      pendingOrderInfoState.set(userId, state);
      const shown = await showSlotPicker(editFn, t, state, plan);
      if (shown) return; // wait for slot callback
    }
  }

  await finishManualOrder(bot, userId, state, editFn);
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

  const originalPrice = parseFloat(plan.price as string);
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
      .text(t("btnRechargeWallet"), "wallet")
      .row()
      .text(t("btnCancel"), "cancel_order");
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
    scheduledSlot: `${slot.date} ${slot.timeSlot}`,
  });

  const updatedUser = await UserRepository.findById(userId);
  const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

  const keyboard = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders")
    .row()
    .text(t("btnBackToMenu"), "categories");
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
