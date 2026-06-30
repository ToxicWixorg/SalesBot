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
import { notifyAdminNewOrder } from "./notifyAdminNewOrder";

export async function finishManualOrder(
  bot: AnyBot,
  userId: number,
  state: PendingOrderInfo,
  sendFn: (text: string, opts?: any) => Promise<any>,
) {
  const user = await UserRepository.findById(userId);
  if (!user) return;
  const userLang = user.languageCode;

  const t = i18n.buildT(userLang || "en");

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

  // Toman base price resolved on the payment screen (USD → Toman).
  const originalPrice =
    state.basePriceToman ??
    state.regionPrice ??
    parseFloat(plan.price as string);

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
        icon_custom_emoji_id: emojiIds.failed,
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
  const delivery: Record<string, string> = Object.fromEntries(
    Object.entries(state.collected).filter(
      ([, value]) => typeof value === "string" && value.trim() !== "",
    ),
  );

  // Create order with pending_admin status
  const order = await OrderRepository.create({
    userId: userId as any,
    productId: plan.productId,
    planId: plan.id,
    status: "pending_admin",
    quantity: 1,
    totalPrice: originalPrice.toString() as any,
    discountAmount: discountAmount.toString() as any,
    walletUsed: finalPrice.toString() as any,
    finalPrice: finalPrice.toString() as any,
    paymentMethod: "wallet",
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
    delivery,
  });

  const productName =
    userLang.toLowerCase() === "fa"
      ? product.nameFA
      : userLang.toLowerCase() === "en"
        ? product.nameEN
        : product.nameRU;
  const planName =
    userLang.toLowerCase() === "fa"
      ? plan.nameFA
      : userLang.toLowerCase() === "en"
        ? plan.nameEN
        : plan.nameRU;

  // Deduct wallet balance
  await UserRepository.updateWalletBalance(userId, finalPrice, "subtract");

  // Record wallet transaction
  await WalletRepository.debitBalance(
    userId,
    finalPrice.toFixed(2),
    "purchase",
    order.id,
    `خرید ${productName} - ${planName}`,
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
    productName: productName,
    planName: planName,
    finalPrice,
    collected: state.collected,
    steps: state.steps,
    deliveryType: plan.deliveryType,
    paymentMethod: "wallet",
  });

  // Tell user their order was placed
  const keyboard = new InlineKeyboard()
    .text(t("btnMyOrders"), "orders", { icon_custom_emoji_id: emojiIds.bag })
    .row()
    .text(t("btnBackToMenu"), "categories", {
      icon_custom_emoji_id: emojiIds.home,
    });

  await sendFn(
    t("manualOrderPending", {
      orderId: order.id,
      productName: productName,
      planName: planName,
      amount: finalPrice.toFixed(0),
      remainingBalance: newBalance.toFixed(0),
    }),
    { parse_mode: "HTML", reply_markup: keyboard },
  );
}
