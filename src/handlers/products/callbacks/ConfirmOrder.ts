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
import {
  pendingOrderInfoState,
  type InfoStep,
} from "../pendingOrderInfoState.ts";
import { createManualOrderDirect } from "../../../scenes/manual-order.ts";
import { getBotInstance } from "../../../botInstance.ts";

/** Delivery types that are fulfilled instantly from a pre-loaded config pool */
const CONFIG_DELIVERY_TYPES = ["automatic", "code", "family_join"] as const;

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

  await context.answerCallbackQuery();

  // ── Branch by delivery type ──────────────────────────────────────────────
  const isConfigBased = (CONFIG_DELIVERY_TYPES as readonly string[]).includes(
    product.deliveryType,
  );

  if (isConfigBased) {
    // ── Automatic / instant config delivery ─────────────────────────────
    let config = await ProductConfigRepository.findAvailableByPlanId(planId);
    if (!config) {
      config = await ProductConfigRepository.findAvailableByProductId(
        plan.productId,
      );
    }

    if (!config) {
      await context.editText(t("noConfigAvailable"), {
        reply_markup: new InlineKeyboard().text(t("btnCancel"), "cancel_order"),
        parse_mode: "HTML",
      });
      return;
    }

    // Create completed order
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

    await ProductConfigRepository.markAsUsed(config.id, order.id);
    await ProductRepository.decreaseStock(plan.productId);

    const updatedUser = await UserRepository.findById(userId);
    const newBalance = parseFloat(updatedUser?.walletBalance || "0");

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

    await context.send(
      t("vpnConfigMessage", {
        configData: config.configData,
        label: config.label ?? undefined,
      }),
      { parse_mode: "HTML" },
    );
  } else {
    // ── Manual / Custom-schedule / Invite delivery ──────────────────────
    // Determine which fields to collect from the user (from plan-level requirements)
    const steps: InfoStep[] = [];
    if (plan.requiresEmail) steps.push("email");
    if (plan.requiresLogin) {
      steps.push("loginUsername");
      steps.push("loginPassword");
    }
    if (plan.requiresRegion) steps.push("region");

    if (steps.length === 0) {
      // No info needed – create the order immediately
      await createManualOrderDirect(
        getBotInstance(),
        userId,
        planId,
        product.deliveryType,
        (text, opts) => context.editText(text, opts),
      );
      return;
    }

    // Save state and ask for the first field
    pendingOrderInfoState.set(userId, {
      planId,
      deliveryType: product.deliveryType,
      phase: "info",
      steps,
      currentStep: 0,
      collected: {},
      discount: hasDiscount ? pendingDiscount : undefined,
    });

    const stepIndicator = t("manualOrderStep", {
      current: 1,
      total: steps.length,
    });
    const firstPromptKey = getPromptKey(steps[0]);
    const message = `${t("manualOrderInfoRequired")}\n\n${stepIndicator}\n\n${t(firstPromptKey as any)}`;

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
  }
}

function getPromptKey(step: InfoStep): string {
  const map: Record<InfoStep, string> = {
    email: "manualOrderEmailPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };
  return map[step];
}
