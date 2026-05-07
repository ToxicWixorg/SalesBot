import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import { orderConfirmationKeyboard } from "../../../shared/keyboards/index.ts";
import { enterQuantityKeyboard } from "../../../shared/keyboards/products/inventoryOrder.ts";
import { regionSelectionKeyboard } from "../../../shared/keyboards/products/regionSelect.ts";
import { pendingQuantityState } from "../quantityOrderState.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";

/** Delivery types fulfilled from the inventory pool */
const INVENTORY_TYPES = ["automatic", "code", "family_join"] as const;

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

  await context.answerCallbackQuery();

  // ── Inventory-based products: show quantity prompt ───────────────────────
  const isInventory = (INVENTORY_TYPES as readonly string[]).includes(
    product.deliveryType,
  );

  if (isInventory) {
    const availableStock = await InventoryRepository.countAvailable(product.id);

    if (availableStock === 0) {
      await context.editText(t("quantityExceedsStock", { stock: 0 }), {
        parse_mode: "HTML",
        reply_markup: enterQuantityKeyboard(t, product.id)
          .row()
          .text(t("btnNotifyStock"), `notify_stock_${product.id}`),
      });
      return;
    }

    // Save state so the message handler knows what product/plan this is for
    pendingQuantityState.set(userId, {
      planId,
      productId: product.id,
      productName: product.name,
      pricePerUnit: parseFloat(plan.price as string),
      availableStock,
      maxPerUser: product.maxPerUser ?? 0,
    });

    // Build quantity prompt with product details + terms
    let msg = `<b>${product.name}</b>\n\n`;
    msg += `💰 ${t("price")} ${plan.price} ${t("currency")}\n`;
    msg += `📦 ${t("stock")} ${availableStock}\n`;
    if ((product.warrantyDays ?? 0) > 0) {
      msg += `🛡 ${t("warrantyDays", { days: product.warrantyDays })}\n`;
    }
    msg += `⚡ ${t("deliveryType")} ${deliveryTypeBadge(product.deliveryType)}\n`;

    if (product.terms) {
      msg += `\n━━━━━━━━━━━━━━\n⚠️ <b>${t("termsTitle")}</b>\n\n${product.terms}\n`;
    }

    msg += `\n━━━━━━━━━━━━━━\n${t("enterQuantityPrompt")}\n${t("enterQuantityHint")}`;

    await context.editText(msg, {
      parse_mode: "HTML",
      reply_markup: enterQuantityKeyboard(t, product.id),
    });
    return;
  }

  // ── Non-inventory: original confirm-order flow ───────────────────────────

  // If the product requires a region AND has predefined region options,
  // show an inline keyboard for region selection before the order summary.
  const regions =
    (product.regions as Array<{ flag: string; name: string }> | null) ?? [];
  if (plan.requiresRegion && regions.length > 0) {
    // Clear any stale pre-selected region for this plan
    preSelectedRegionState.delete(userId);

    const message =
      `${t("selectRegion")}\n\n` + `📦 ${product.name}\n` + `📋 ${plan.name}`;

    await context.editText(message, {
      reply_markup: regionSelectionKeyboard(t, planId, regions),
      parse_mode: "HTML",
    });
    return;
  }

  // ── Standard non-inventory: show order summary directly ─────────────────
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

  const needs: string[] = [];
  if (plan.requiresEmail) needs.push("📧 Email");
  if (plan.requiresLogin) needs.push("🔐 Account login");
  if (plan.requiresRegion) needs.push("🌍 Region");
  if (needs.length > 0) {
    message += `\n📝 ${t("manualOrderNeedsLabel")}:\n`;
    for (const n of needs) message += `  • ${n}\n`;
  }

  message += `\n🚚 ${deliveryTypeBadge(product.deliveryType)}\n`;
  message += `\n${t("total")} ${plan.price} ${t("currency")}`;

  await context.editText(message, {
    reply_markup: orderConfirmationKeyboard(t, planId),
    parse_mode: "HTML",
  });
}
