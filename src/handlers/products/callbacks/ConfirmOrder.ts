import { Context, InlineKeyboard } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
  ProductConfigRepository,
} from "../../../repositories/ProductRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { WalletRepository } from "../../../repositories/WalletRepository.ts";
import { DiscountCodeRepository } from "../../../repositories/DiscountCodeRepository.ts";
import { appliedDiscountState } from "../discountOrderState.ts";

export async function ConfirmOrderCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]);
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  // Get plan
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery("❌ Plan not found");
    return;
  }

  // Get product
  const product = await ProductRepository.findById(plan.productId);
  if (!product) {
    await context.answerCallbackQuery("❌ Product not found");
    return;
  }

  const price = parseFloat(plan.price as string);

  // Check for a pending discount applied by the user
  const pendingDiscount = appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === planId;

  const discountAmount = hasDiscount ? pendingDiscount.discountAmount : 0;
  const finalPrice = hasDiscount ? pendingDiscount.finalPrice : price;

  // Check wallet balance against the final (after-discount) price
  const currentBalance = parseFloat(user.walletBalance || "0");
  if (currentBalance < finalPrice) {
    await context.answerCallbackQuery("❌ Insufficient balance");
    const insufficientMsg = hasDiscount
      ? t("discountInsufficientBalanceWithDiscount", {
          required: finalPrice.toFixed(0),
          current: currentBalance.toFixed(0),
        })
      : t("insufficientBalance", {
          required: finalPrice.toFixed(0),
          current: currentBalance.toFixed(0),
        });
    await context.editText(insufficientMsg, {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnRechargeWallet"), "wallet")
        .row()
        .text(t("btnCancel"), "cancel_order"),
    });
    return;
  }

  // Find available config — prefer plan-specific first, then product-wide
  let config = await ProductConfigRepository.findAvailableByPlanId(planId);
  if (!config) {
    config = await ProductConfigRepository.findAvailableByProductId(
      plan.productId,
    );
  }

  if (!config) {
    await context.answerCallbackQuery("❌ No config available");
    await context.editText(t("noConfigAvailable"), {
      reply_markup: new InlineKeyboard().text(t("btnCancel"), "cancel_order"),
    });
    return;
  }

  // Create the order first (pending state)
  const order = await OrderRepository.create({
    userId: userId as any,
    productId: plan.productId,
    planId,
    status: "completed",
    quantity: 1,
    totalPrice: plan.price as any,
    discountAmount: discountAmount.toString() as any,
    walletUsed: finalPrice.toString() as any,
    finalPrice: finalPrice.toString() as any,
    paymentMethod: "wallet",
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
    delivery: { configId: config.id, configData: config.configData },
    deliveredAt: new Date(),
  });

  // Deduct wallet balance (only the final price after discount)
  await UserRepository.updateWalletBalance(userId, finalPrice, "subtract");

  // Record wallet transaction
  await WalletRepository.debitBalance(
    userId,
    finalPrice.toFixed(2),
    "purchase",
    order.id,
    `خرید ${product.name} - ${plan.name}`,
  );

  // If a discount code was used, record its usage and clear the pending state
  if (hasDiscount && pendingDiscount) {
    await DiscountCodeRepository.recordUsage(
      pendingDiscount.discountCodeId,
      userId,
      order.id,
      pendingDiscount.discountAmount,
    );
    appliedDiscountState.delete(userId);
  }

  // Mark config as used
  await ProductConfigRepository.markAsUsed(config.id, order.id);

  // Decrease product stock
  await ProductRepository.decreaseStock(plan.productId);

  // Get updated balance
  const updatedUser = await UserRepository.findById(userId);
  const newBalance = parseFloat(updatedUser?.walletBalance || "0");

  // Send success message
  await context.editText(
    t("orderSuccess", {
      orderId: order.id,
      productName: product.name,
      planName: plan.name,
      amount: finalPrice.toFixed(0),
      remainingBalance: newBalance.toFixed(0),
    }),
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnMyOrders"), "orders")
        .row()
        .text(t("btnMainMenu"), "main_menu"),
    },
  );

  // Send the config in a separate message
  await context.send(
    t("vpnConfigMessage", {
      configData: config.configData,
      label: config.label ?? undefined,
    }),
    { parse_mode: "HTML" },
  );
}
