import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { WalletRepository } from "../../../repositories/WalletRepository.ts";
import { DiscountCodeRepository } from "../../../repositories/DiscountCodeRepository.ts";
import { inventoryOrderSummaryKeyboard } from "../../../shared/keyboards/index.ts";
import { appliedDiscountState } from "../discountOrderState.ts";

/**
 * Per-user state tracking which product/plan the user is entering a quantity for.
 * Set by the products index handler after the user selects a plan on an inventory product.
 */
export const enterQuantityState = new Map<
  number,
  { planId: number; productId: number }
>();

/**
 * Register two handlers on the bot:
 *  1. A message handler that intercepts text from users in the quantity-entry state.
 *  2. A callbackQuery handler for `confirm_inv_{planId}_{qty}` that finalises the order.
 *
 * Must be called after setBotInstance() (i.e., after bot.ts creates the Bot instance).
 */
export function setupEnterQuantityHandler(bot: AnyBot): void {
  // ── 1. Intercept text while user is entering quantity ──────────────────────
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.text) return next?.();

    const state = enterQuantityState.get(userId);
    if (!state) return next?.();

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    const qty = parseInt(ctx.text.trim(), 10);
    if (isNaN(qty) || qty < 1) {
      await ctx.send(t("quantityInvalid"), { parse_mode: "HTML" });
      return;
    }

    const available = await InventoryRepository.countAvailable(state.productId);
    if (qty > available) {
      await ctx.send(t("quantityExceedsStock", { stock: available }), {
        parse_mode: "HTML",
      });
      return;
    }

    const product = await ProductRepository.findById(state.productId);
    if (
      product?.maxPerUser &&
      product.maxPerUser > 0 &&
      qty > product.maxPerUser
    ) {
      await ctx.send(t("quantityExceedsLimit", { max: product.maxPerUser }), {
        parse_mode: "HTML",
      });
      return;
    }

    // Accept quantity — clear state and show summary
    enterQuantityState.delete(userId);

    const plan = await ProductPlanRepository.findById(state.planId);
    if (!plan) {
      await ctx.send(t("planNotFound"), { parse_mode: "HTML" });
      return;
    }

    const unitPrice = parseFloat(plan.price as string);
    const discount = appliedDiscountState.get(userId);
    const hasDiscount = discount && discount.planId === state.planId;
    const finalTotal = hasDiscount
      ? discount.finalPrice * qty
      : unitPrice * qty;

    await ctx.send(
      t("inventoryOrderSummary", {
        productName: product?.name ?? "",
        qty,
        unitPrice: unitPrice.toLocaleString(),
        total: finalTotal.toLocaleString(),
        currency: t("currency"),
      }),
      {
        parse_mode: "HTML",
        reply_markup: inventoryOrderSummaryKeyboard(t, state.planId, qty),
      },
    );
  });

  // ── 2. Re-prompt quantity (change_qty_{planId}) ────────────────────────────
  bot.callbackQuery(/^change_qty_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const [, planIdStr] = ctx.queryData as [string, string];
    const planId = parseInt(planIdStr);

    const plan = await ProductPlanRepository.findById(planId);
    if (!plan) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    enterQuantityState.set(userId, { planId, productId: plan.productId });

    await ctx.editText(t("enterQuantityPrompt"), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(t("btnCancel"), "cancel_order"),
    });
  });

  // ── 3. Confirm inventory order (confirm_inv_{planId}_{qty}) ────────────────
  bot.callbackQuery(/^confirm_inv_(\d+)_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const [, planIdStr, qtyStr] = ctx.queryData as [string, string, string];
    const planId = parseInt(planIdStr);
    const qty = parseInt(qtyStr);

    const user = await UserRepository.findById(userId);
    if (!user) return;

    const t = i18n.buildT(user.languageCode ?? "fa");

    const plan = await ProductPlanRepository.findById(planId);
    if (!plan) {
      await ctx.answerCallbackQuery({
        text: t("planNotFound"),
        show_alert: true,
      });
      return;
    }

    const product = await ProductRepository.findById(plan.productId);
    if (!product) return;

    const discount = appliedDiscountState.get(userId);
    const hasDiscount = discount && discount.planId === planId;
    const unitPrice = parseFloat(plan.price as string);
    const totalPrice = unitPrice * qty;
    const discountAmount = hasDiscount ? discount.discountAmount * qty : 0;
    const finalPrice = hasDiscount ? discount.finalPrice * qty : totalPrice;

    // Pre-check wallet balance
    const walletBalance = parseFloat(user.walletBalance ?? "0");
    if (walletBalance < finalPrice) {
      await ctx.editText(
        t("insufficientBalance", {
          required: finalPrice.toFixed(0),
          current: walletBalance.toFixed(0),
        }),
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text(t("btnRechargeWallet"), "wallet", {
              icon_custom_emoji_id: emojiIds.wallet,
            })
            .row()
            .text(t("btnCancel"), "cancel_order"),
        },
      );
      return;
    }

    // Create order first (needed for inventory reservation)
    const order = await OrderRepository.create({
      userId: userId as any,
      productId: plan.productId,
      planId: plan.id,
      status: "paid",
      quantity: qty,
      totalPrice: totalPrice.toString() as any,
      discountAmount: discountAmount.toString() as any,
      walletUsed: finalPrice.toString() as any,
      finalPrice: finalPrice.toString() as any,
      paymentMethod: "wallet",
      discountCodeId: hasDiscount ? discount.discountCodeId : undefined,
    });

    // Reserve inventory items (locked to prevent double-delivery)
    const reserved = await InventoryRepository.reserveItems(
      plan.productId,
      qty,
      order.id,
    );

    if (!reserved) {
      // Not enough stock — cancel the order
      await OrderRepository.updateStatus(order.id, "cancelled");
      await ctx.editText(t("quantityExceedsStock", { stock: 0 }), {
        parse_mode: "HTML",
      });
      return;
    }

    // Mark items as used and collect delivery content
    const itemIds = reserved.map((i) => i.id);
    await InventoryRepository.markUsed(itemIds, order.id);

    const deliveryLines: string[] = [];
    for (const item of reserved) {
      if (item.content) {
        deliveryLines.push(item.content);
      } else if (item.email && item.password) {
        deliveryLines.push(`${item.email} : ${item.password}`);
      } else if (item.email) {
        deliveryLines.push(item.email);
      }
    }

    // Mark order delivered
    await OrderRepository.markAsDelivered(order.id, { items: deliveryLines });

    // Deduct wallet
    await UserRepository.updateWalletBalance(userId, finalPrice, "subtract");
    await WalletRepository.debitBalance(
      userId,
      finalPrice.toFixed(2),
      "purchase",
      order.id,
      `خرید ${product.name} x${qty}`,
    );

    if (hasDiscount && discount) {
      await DiscountCodeRepository.recordUsage(
        discount.discountCodeId,
        userId,
        order.id,
        discountAmount,
      );
      appliedDiscountState.delete(userId);
    }

    // Reduce product stock counter
    await ProductRepository.decreaseStock(plan.productId, qty);

    const updatedUser = await UserRepository.findById(userId);
    const newBalance = parseFloat(updatedUser?.walletBalance ?? "0");

    const deliveryItems = deliveryLines.map((content, idx) => ({
      index: idx + 1,
      content,
    }));

    const successMsg = t("inventoryOrderSuccess", {
      orderId: order.id,
      productName: product.name,
      qty,
      total: finalPrice.toLocaleString(),
      remainingBalance: newBalance.toLocaleString(),
      currency: t("currency"),
    });

    const deliveryMsg =
      deliveryItems.length > 0
        ? `\n\n${t("inventoryDeliveryHeader", { productName: product.name })}\n` +
          t("inventoryDeliveryItem", deliveryItems)
        : "";

    await ctx.editText(successMsg + deliveryMsg, {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnMyOrders"), "my_orders", {
          icon_custom_emoji_id: emojiIds.box,
        })
        .row()
        .text(t("btnMainMenu"), "categories", {
          icon_custom_emoji_id: emojiIds.home,
        }),
    });
  });
}
