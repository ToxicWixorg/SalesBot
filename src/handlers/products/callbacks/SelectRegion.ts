import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { orderConfirmationKeyboard } from "../../../shared/keyboards/index.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";
import { appliedDiscountState } from "../discountOrderState.ts";

function deliveryTypeBadge(deliveryType: string): string {
  const badges: Record<string, string> = {
    automatic: "⚡ Instant delivery",
    code: "🔑 Code delivery",
    family_join: "👨‍👩‍👧 Family plan",
    manual: "👤 Manual (1-24 hours)",
    custom_schedule: "📅 Scheduled delivery",
    invite: "📨 Via invite link",
    renewable: "🔄 Renewable subscription",
    reservation: "📋 Reservation-based",
  };
  return badges[deliveryType] ?? `🚚 ${deliveryType}`;
}

export async function SelectRegionCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  // Callback data: select_region_{planId}_{index}
  const planId = Number.parseInt(context.queryData[1]);
  const regionIndex = Number.parseInt(context.queryData[2]);
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

  const regions =
    (product.regions as Array<{ flag: string; name: string }> | null) ?? [];
  const selectedRegion = regions[regionIndex];
  if (!selectedRegion) {
    await context.answerCallbackQuery(t("planNotFound"));
    return;
  }

  // Save the pre-selected region for this user
  preSelectedRegionState.set(userId, {
    planId,
    region: `${selectedRegion.flag} ${selectedRegion.name}`,
  });

  await context.answerCallbackQuery();

  // Show the order summary (same as SelectPlan does for non-inventory)
  const pendingDiscount = appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === planId;

  let message = `${t("orderSummary")}\n\n`;
  message += `📦 ${product.name}\n`;
  message += `📋 ${plan.name}\n`;

  if (plan.duration) {
    const unitKey = plan.durationUnit || "day";
    let durationUnit = "";
    if (unitKey === "day") durationUnit = t("duration_day");
    else if (unitKey === "month") durationUnit = t("duration_month");
    else if (unitKey === "year") durationUnit = t("duration_year");
    message += `⏱️ ${plan.duration} ${durationUnit}\n`;
  }

  message += `\n🌍 ${t("selectedRegion")}: <b>${selectedRegion.flag} ${selectedRegion.name}</b>\n`;

  const needs: string[] = [];
  if (plan.requiresEmail) needs.push("📧 Email");
  if (plan.requiresLogin) needs.push("🔐 Account login");
  if (needs.length > 0) {
    message += `\n📝 ${t("manualOrderNeedsLabel")}:\n`;
    for (const n of needs) message += `  • ${n}\n`;
  }

  message += `\n🚚 ${deliveryTypeBadge(product.deliveryType)}\n`;

  if (hasDiscount && pendingDiscount) {
    message += `\n${t("orderSummaryWithDiscount", {
      productName: product.name,
      planName: plan.name,
      duration: plan.duration ? String(plan.duration) : "",
      originalPrice: parseFloat(plan.price as string).toFixed(0),
      discountAmount: pendingDiscount.discountAmount.toFixed(0),
      finalPrice: pendingDiscount.finalPrice.toFixed(0),
      code: pendingDiscount.code,
    })}`;
  } else {
    message += `\n${t("total")} ${plan.price} ${t("currency")}`;
  }

  await context.editText(message, {
    reply_markup: orderConfirmationKeyboard(t, planId),
    parse_mode: "HTML",
  });
}
