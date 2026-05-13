import { AnyBot, InlineKeyboard } from "gramio";
import { appliedDiscountState } from "../../../handlers/products/discountOrderState";
import { PendingOrderInfo } from "../../../handlers/products/pendingOrderInfoState";
import {
  DiscountCodeRepository,
  OrderRepository,
  ProductPlanRepository,
  ProductRepository,
  UserRepository,
  WalletRepository,
} from "../../../repositories";
import { i18n } from "../../../shared/locales";
import { emojiIds } from "../../../shared/locales/emojies";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository";
import { notifyAdminNewOrder } from "../Helpers/notifyAdminNewOrder";

export async function finishManualOrderWithSlot(
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

  const delivery: Record<string, string> = Object.fromEntries(
    Object.entries(state.collected).filter(
      ([, value]) => typeof value === "string" && value.trim() !== "",
    ),
  );

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
    steps: state.steps,
    deliveryType: plan.deliveryType,
    paymentMethod: "wallet",
    scheduledSlot: `${slot.date} ${slot.timeSlot}`,
  });

  const updatedUser = await UserRepository.findById(userId);
  const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

  const keyboard = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders", { icon_custom_emoji_id: emojiIds.bag })
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
