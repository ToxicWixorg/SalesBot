import { AnyBot, InlineKeyboard } from "gramio";
import {
  OrderRepository,
  ProductPlanRepository,
  ProductRepository,
  UserRepository,
} from "../../../repositories";
import { PendingOrderInfo } from "../../../handlers/products/pendingOrderInfoState";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository";
import { i18n } from "../../../shared/locales";
import { emojiIds } from "../../../shared/locales/emojies";
import { notifyAdminNewOrder } from "./notifyAdminNewOrder";

/**
 * Called after the user selects a slot AND the order already exists (was paid).
 *
 * For custom_schedule products the flow is:
 *   pay → collect info → day picker → slot picker → THIS FUNCTION
 *
 * This function:
 *   1. Re-validates that the chosen slot is still available
 *   2. Updates the existing order: status = "scheduled", stores slot info
 *   3. Creates the schedule booking row
 *   4. Notifies admin forum
 *   5. Shows confirmation to the user
 */
export async function linkSlotToOrder(
  bot: AnyBot,
  userId: number,
  orderId: number,
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

  // Re-check slot availability (guard against race condition)
  const slots = await ScheduleRepository.getAvailableSlots(
    slot.date,
    plan.productId,
  );
  const slotInfo = slots.find((s) => s.template.id === slot.templateId);
  if (!slotInfo || slotInfo.isFull) {
    await sendFn(t("scheduleSlotFullAlert"), { parse_mode: "HTML" });
    return;
  }

  // Update existing order → scheduled
  await OrderRepository.scheduleOrder(orderId, slot);

  // Create schedule booking row
  await ScheduleRepository.createBooking(
    slot.templateId,
    slot.date,
    slot.timeSlot,
    orderId,
    userId,
  );

  // Notify admin
  const finalPrice = state.regionPrice ?? parseFloat(plan.price as string);
  await notifyAdminNewOrder(bot, {
    orderId,
    userId,
    username: user.username ?? null,
    firstName: user.firstName ?? null,
    productName: product.name,
    planName: plan.name,
    finalPrice,
    collected: state.collected,
    steps: state.steps,
    deliveryType: plan.deliveryType,
    paymentMethod: "wallet",
    scheduledSlot: `${slot.date} ${slot.timeSlot}`,
  });

  const kb = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders", { icon_custom_emoji_id: emojiIds.box })
    .row()
    .text(t("btnBackToMenu"), "categories", {
      icon_custom_emoji_id: emojiIds.home,
    });

  await sendFn(
    t("scheduleBooked", {
      orderId,
      productName: product.name,
      planName: plan.name,
      timeSlot: slot.timeSlot,
      date: slot.date,
      amount: finalPrice.toFixed(0),
      remainingBalance: "0",
    }),
    { parse_mode: "HTML", reply_markup: kb },
  );
}
