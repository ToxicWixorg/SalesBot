import { InlineKeyboard } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { getBotInstance } from "../../../botInstance.ts";
import {
  pendingOrderInfoState,
  type InfoStep,
  type PendingOrderInfo,
} from "../pendingOrderInfoState.ts";
import { appliedDiscountState } from "../discountOrderState.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";
import {
  createManualOrderDirect,
  showPaymentScreen,
} from "../../../scenes/manualOrders/index.ts";

/**
 * Maps each InfoStep to its i18n prompt key.
 */
const promptKeyMap: Record<InfoStep, string> = {
  email: "manualOrderEmailPrompt",
  password: "manualOrderPasswordPrompt",
  loginUsername: "manualOrderLoginUsernamePrompt",
  loginPassword: "manualOrderLoginPasswordPrompt",
  region: "manualOrderRegionPrompt",
};

/**
 * Handler for `confirm_order_{planId}` callback.
 *
 * Flow for custom_schedule products (زمان‌بندی):
 *   payment → info collection → review → day picker → slot picker → done
 *
 * Flow for all other delivery types:
 *   info collection → review → payment → done
 *   (or: payment directly if no info steps required)
 */
export async function ConfirmOrderCallback(context: any): Promise<void> {
  const planId = parseInt(context.queryData[1]);
  const userId = context.from?.id;
  if (!userId) return;

  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const product = await ProductRepository.findById(plan.productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  // ── Resolve pre-selected region ────────────────────────────────────────────
  const preRegion = preSelectedRegionState.get(userId);
  const regionForThisPlan =
    preRegion?.planId === planId ? preRegion : undefined;
  const regionPrice = regionForThisPlan?.price;

  // ── Resolve price (region override > plan base) ────────────────────────────
  const basePrice = regionPrice ?? parseFloat(plan.price as string);
  const discount = appliedDiscountState.get(userId);
  const hasDiscount = discount && discount.planId === planId;
  const finalPrice = hasDiscount ? discount.finalPrice : basePrice;

  // ── Pre-check wallet (show hint, not hard-block — card/crypto still possible) ─
  const walletBalance = parseFloat(user.walletBalance ?? "0");
  if (walletBalance < finalPrice) {
    // We don't block here — card / zarinpal / crypto paths are still available.
    // The payment screen itself will hide the wallet button if balance is low.
  }

  // ── Build required info steps ──────────────────────────────────────────────
  // Region via keyboard is already captured in preSelectedRegionState;
  // only add "region" text-input step when no region UI is available.
  const planHasRegions = (plan.regions?.length ?? 0) > 0;
  const productHasRegions = (product.regions?.length ?? 0) > 0;
  const regionCoveredByKeyboard = planHasRegions || productHasRegions;

  const steps: InfoStep[] = [];

  if (
    product.requiresRegion &&
    !regionCoveredByKeyboard &&
    !regionForThisPlan
  ) {
    steps.push("region");
  }
  if (product.requiresEmail || plan.requiresEmail) {
    steps.push("email");
    steps.push("password");
  }
  if (product.requiresLogin || plan.requiresLogin) {
    steps.push("loginUsername");
    steps.push("loginPassword");
  }

  // ── Pre-collected region (from keyboard selection) ──────────────────────────
  const preCollected: Partial<Record<InfoStep, string>> = {};
  if (regionForThisPlan) {
    preCollected.region = `${regionForThisPlan.flag} ${regionForThisPlan.name}`;
  }

  // ── No info steps → go straight to payment ────────────────────────────────
  // For custom_schedule: payment always comes FIRST (before info collection),
  // so we go to payment regardless of whether there are info steps.
  if (product.deliveryType === "custom_schedule") {
    const state: PendingOrderInfo = {
      planId,
      deliveryType: product.deliveryType,
      phase: "payment",
      steps,
      currentStep: 0,
      collected: preCollected,
      discount: hasDiscount ? discount : undefined,
      regionPrice,
    };
    pendingOrderInfoState.set(userId, state);
    await showPaymentScreen(
      (text, opts) => context.editText(text, opts),
      userId,
      state,
    );
    return;
  }

  if (steps.length === 0) {
    await createManualOrderDirect(
      getBotInstance(),
      userId,
      planId,
      product.deliveryType,
      (text, opts) => context.editText(text, opts),
      preCollected,
    );
    return;
  }

  // ── Store state and send first info-collection prompt ──────────────────────
  const state: PendingOrderInfo = {
    planId,
    deliveryType: product.deliveryType,
    phase: "info",
    steps,
    currentStep: 0,
    collected: preCollected,
    discount: hasDiscount ? discount : undefined,
    regionPrice,
  };

  pendingOrderInfoState.set(userId, state);

  const firstStep = steps[0]!;
  const stepIndicator = t("manualOrderStep", {
    current: 1,
    total: steps.length,
  });
  const promptText = `${stepIndicator}\n\n${t(promptKeyMap[firstStep] as any)}`;

  await context.editText(promptText, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(
      t("btnCancelManualOrder"),
      "cancel_manual_order",
      { icon_custom_emoji_id: emojiIds.cross },
    ),
  });
}
