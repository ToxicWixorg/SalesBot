import { Context, InlineKeyboard } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { WalletRepository } from "../../../repositories/WalletRepository.ts";
import { DiscountCodeRepository } from "../../../repositories/DiscountCodeRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import { appliedDiscountState } from "../discountOrderState.ts";
import { pendingQuantityState } from "../quantityOrderState.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";

/**
 * Handles callback: confirm_inv_{planId}_{qty}
 *
 * Steps:
 *  1. Validate wallet balance
 *  2. Reserve inventory items (with lock)
 *  3. Create order (status = completed)
 *  4. Debit wallet
 *  5. Mark items as used
 *  6. Send delivery message
 */
export async function ConfirmInventoryOrderCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]);
  const qty = Number.parseInt(context.queryData[2]);
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery(t("planNotFound"));
    return;
  }

  const product = await ProductRepository.findById(plan.productId);
  if (!product) {
    await context.answerCallbackQuery(t("productNotFound"));
    return;
  }

  // ── Discount ───────────────────────────────────────────────────────────────
  const pendingDiscount = appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === planId;

  const pricePerUnit = parseFloat(plan.price as string);
  const discountAmount = hasDiscount ? pendingDiscount.discountAmount : 0;
  // Discount applies per-unit (same as the plan price reduction)
  const finalPricePerUnit = hasDiscount
    ? pendingDiscount.finalPrice
    : pricePerUnit;
  const totalPrice = pricePerUnit * qty;
  const totalFinal = finalPricePerUnit * qty;

  // ── Wallet check ───────────────────────────────────────────────────────────
  const currentBalance = parseFloat(user.walletBalance || "0");
  if (currentBalance < totalFinal) {
    await context.answerCallbackQuery(t("insufficientBalanceAlert"));
    await context.editText(
      t("insufficientBalance", {
        required: totalFinal.toFixed(0),
        current: currentBalance.toFixed(0),
      }),
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text(t("btnRechargeWallet"), "wallet", {
            icon_custom_emoji_id: emojiIds.wallet,
          })
          .row()
          .text(t("btnCancel"), "cancel_order", {
            icon_custom_emoji_id: emojiIds.cross,
          }),
      },
    );
    return;
  }

  await context.answerCallbackQuery();

  // ── Reserve inventory items ────────────────────────────────────────────────
  // We need an order ID to reserve — create a placeholder order first (pending)
  const placeholderOrder = await OrderRepository.create({
    userId: userId as any,
    productId: plan.productId,
    planId,
    status: "pending_payment",
    quantity: qty,
    totalPrice: totalPrice.toString() as any,
    discountAmount: (discountAmount * qty).toString() as any,
    walletUsed: totalFinal.toString() as any,
    finalPrice: totalFinal.toString() as any,
    paymentMethod: "wallet",
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
  });

  const reserved = await InventoryRepository.reserveItems(
    plan.productId,
    qty,
    placeholderOrder.id,
  );

  if (!reserved) {
    // Not enough stock — release placeholder order
    await OrderRepository.updateStatus(placeholderOrder.id, "cancelled");
    await context.editText(
      t("quantityExceedsStock", { stock: 0 }),
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text(t("btnBack"), `product_${plan.productId}`)
          .row()
          .text(t("btnNotifyStock"), `notify_stock_${plan.productId}`),
      },
    );
    return;
  }

  // ── Finalize: debit wallet + mark order completed ──────────────────────────
  await UserRepository.updateWalletBalance(userId, totalFinal, "subtract");

  await WalletRepository.debitBalance(
    userId,
    totalFinal.toFixed(2),
    "purchase",
    placeholderOrder.id,
    `خرید ${product.name} × ${qty}`,
  );

  if (hasDiscount && pendingDiscount) {
    await DiscountCodeRepository.recordUsage(
      pendingDiscount.discountCodeId,
      userId,
      placeholderOrder.id,
      pendingDiscount.discountAmount * qty,
    );
    appliedDiscountState.delete(userId);
  }

  // Mark inventory items as used
  await InventoryRepository.markUsed(
    reserved.map((i) => i.id),
    placeholderOrder.id,
  );

  // Update order to completed with delivery payload
  const deliveryPayload = reserved.map((item) => ({
    inventoryId: item.id,
    email: item.email,
    password: item.password,
    extraData: item.extraData,
  }));

  await OrderRepository.markAsDelivered(placeholderOrder.id, deliveryPayload);

  // Decrease product stock counter
  await ProductRepository.decreaseStock(plan.productId, qty);

  // Clear pending state
  pendingQuantityState.delete(userId);

  // ── Get updated balance ────────────────────────────────────────────────────
  const updatedUser = await UserRepository.findById(userId);
  const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

  // ── Confirmation message ───────────────────────────────────────────────────
  await context.editText(
    t("inventoryOrderSuccess", {
      orderId: placeholderOrder.id,
      productName: product.name,
      qty,
      total: totalFinal.toFixed(0),
      remainingBalance: newBalance.toFixed(0),
      currency: t("currency"),
    }),
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnMyOrders"), "orders", {
          icon_custom_emoji_id: emojiIds.box,
        })
        .row()
        .text(t("btnMainMenu"), "main_menu", {
          icon_custom_emoji_id: emojiIds.home,
        }),
    },
  );

  // ── Delivery: send each item in a separate message ─────────────────────────
  const deliveryMsg = t("inventoryDeliveryHeader", {
    productName: product.name,
  });

  await context.send(deliveryMsg, { parse_mode: "HTML" });

  for (let i = 0; i < reserved.length; i++) {
    const item = reserved[i]!;
    const itemMsg = t("inventoryDeliveryItem", {
      index: i + 1,
      content: item.content ?? [item.email, item.password, item.extraData].filter(Boolean).join(":") || "—",
    });
    await context.send(itemMsg, { parse_mode: "HTML" });
  }

  await context.send(t("inventoryDeliveryFooter"), { parse_mode: "HTML" });
}
