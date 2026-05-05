import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { orderConfirmationKeyboard } from "../../../shared/keyboards/index.ts";

/** Delivery types that are fulfilled instantly */
const INSTANT_TYPES = ["automatic", "code", "family_join"] as const;

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

export async function SelectPlanCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]);
  const user = await UserRepository.findById(context.from.id);
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

  // Build order summary
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

  // Show what info the user will need to provide
  const isInstant = (INSTANT_TYPES as readonly string[]).includes(
    product.deliveryType,
  );
  if (!isInstant) {
    const needs: string[] = [];
    if (plan.requiresEmail) needs.push("📧 Email");
    if (plan.requiresLogin) needs.push("🔐 Account login");
    if (plan.requiresRegion) needs.push("🌍 Region");
    if (needs.length > 0) {
      message += `\n📝 ${t("manualOrderNeedsLabel")}:\n`;
      for (const n of needs) message += `  • ${n}\n`;
    }
  }

  message += `\n🚚 ${deliveryTypeBadge(product.deliveryType)}\n`;
  message += `\n${t("total")} ${plan.price} ${t("currency")}`;

  await context.editText(message, {
    reply_markup: orderConfirmationKeyboard(t, planId),
    parse_mode: "HTML",
  });
}
