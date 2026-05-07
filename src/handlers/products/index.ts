import { Composer } from "gramio";
import { InlineKeyboard } from "gramio";
import { composer } from "../../plugins/index.ts";
import { i18n } from "../../shared/locales/index.ts";
import { emojiIds } from "../../shared/locales/emojies.ts";
import { getBotSettings } from "../../plugins/base.ts";
import { UserRepository } from "../../repositories/UserRepository.ts";
import {
  CategoryRepository,
  ProductRepository,
  ProductPlanRepository,
} from "../../repositories/ProductRepository.ts";
import { InventoryRepository } from "../../repositories/InventoryRepository.ts";
import { StockNotificationRepository } from "../../repositories/ExtraRepositories.ts";
import {
  categoriesKeyboard,
  productsListKeyboard,
  productDetailsKeyboard,
  productPlansKeyboard,
  orderConfirmationKeyboard,
  backToMainKeyboard,
} from "../../shared/keyboards/index.ts";
import { regionSelectionKeyboard } from "../../shared/keyboards/products/regionSelect.ts";
import { enterQuantityKeyboard } from "../../shared/keyboards/products/inventoryOrder.ts";
import { enterDiscountCodeOrderScene } from "../../scenes/enter-discount-code-order.ts";
import { discountEntryState } from "./discountOrderState.ts";
import { preSelectedRegionState } from "./preSelectedRegionState.ts";
import { enterQuantityState } from "./callbacks/EnterQuantity.ts";
import { ConfirmOrderCallback } from "./callbacks/ConfirmOrder.ts";

export const productsComposer = new Composer().extend(composer);

// ─────────────────────────────────────────────────────────────────────────────
// Helper — resolve the effective stock count for a product
// ─────────────────────────────────────────────────────────────────────────────
async function getEffectiveStock(product: {
  id: number;
  stock: number | null;
  deliveryType: string;
}): Promise<number> {
  if (product.deliveryType === "inventory") {
    return InventoryRepository.countAvailable(product.id);
  }
  return product.stock ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// products / categories — show categories list
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery("products", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  // Check if shop is enabled
  const settings = await getBotSettings();
  if (!settings.shopEnabled) {
    await context.editText(t("shopDisabled"), { parse_mode: "HTML" });
    return;
  }

  const categories = await CategoryRepository.findAll();
  if (categories.length === 0) {
    await context.editText(t("noProducts"), { parse_mode: "HTML" });
    return;
  }

  await context.editText(t("selectCategory"), {
    parse_mode: "HTML",
    reply_markup: categoriesKeyboard(t, categories),
  });
});

productsComposer.callbackQuery("categories", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const settings = await getBotSettings();
  if (!settings.shopEnabled) {
    await context.editText(t("shopDisabled"), { parse_mode: "HTML" });
    return;
  }

  const categories = await CategoryRepository.findAll();
  if (categories.length === 0) {
    await context.editText(t("noProducts"), { parse_mode: "HTML" });
    return;
  }

  await context.editText(t("selectCategory"), {
    parse_mode: "HTML",
    reply_markup: categoriesKeyboard(t, categories),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// category_{id} — show products in a category
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^category_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const categoryId = Number.parseInt(context.queryData[1]!);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const category = await CategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  const products = await ProductRepository.findByCategory(categoryId);

  const message =
    products.length === 0
      ? `${t("categoryProducts", category.name)}\n\n${t("noProducts")}`
      : t("categoryProducts", category.name);

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: productsListKeyboard(t, products, categoryId),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// product_{id} — show product details
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^product_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  const stock = await getEffectiveStock(product);
  const hasStock = stock > 0;

  // Build details message
  let message = `📦 <b>${product.name}</b>\n\n`;
  if (product.description) message += `${product.description}\n\n`;

  message += `${t("stock")} ${hasStock ? t("available") : t("outOfStock")}\n`;

  message += `${t("deliveryType")} `;
  if (
    product.deliveryType === "automatic" ||
    product.deliveryType === "inventory"
  ) {
    message += t("deliveryAutomatic");
  } else if (product.deliveryType === "manual") {
    message += t("deliveryManual");
  } else {
    message += t("deliveryCoordination");
  }

  if (product.warrantyDays && product.warrantyDays > 0) {
    message += `\n${t("warrantyDays", { days: product.warrantyDays })}`;
  }

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: productDetailsKeyboard(t, product, hasStock),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buy_product_{id} — show plan selection
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^buy_product_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  const stock = await getEffectiveStock(product);
  if (stock <= 0) {
    await context.answerCallbackQuery({
      text: t("insufficientBalanceAlert"),
      show_alert: true,
    });
    return;
  }

  const plans = await ProductPlanRepository.findByProductId(productId);
  if (plans.length === 0) {
    await context.answerCallbackQuery({
      text: t("noPlansAvailable"),
      show_alert: true,
    });
    return;
  }

  await context.editText(`📦 <b>${product.name}</b>\n\n${t("selectPlan")}`, {
    parse_mode: "HTML",
    reply_markup: productPlansKeyboard(t, plans, productId),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// select_plan_{id} — choose region or show order confirmation
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^select_plan_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const userId = context.from.id;
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

  // Clear any previously applied discount / region for this plan
  preSelectedRegionState.delete(userId);

  // ── Inventory products → ask for quantity ──────────────────────────────────
  if (product.deliveryType === "inventory") {
    const available = await InventoryRepository.countAvailable(product.id);
    if (available <= 0) {
      await context.answerCallbackQuery({
        text: t("outOfStock"),
        show_alert: true,
      });
      return;
    }

    enterQuantityState.set(userId, { planId, productId: product.id });

    await context.editText(t("enterQuantityPrompt"), {
      parse_mode: "HTML",
      reply_markup: enterQuantityKeyboard(t, product.id),
    });
    return;
  }

  // ── Determine regions (plan-level overrides product-level) ─────────────────
  const regions: Array<{ flag: string; name: string; price?: string }> =
    plan.regions && plan.regions.length > 0
      ? plan.regions
      : product.regions && product.regions.length > 0
        ? product.regions
        : [];

  if (regions.length > 0) {
    // Show region selection
    await context.editText(t("selectRegion"), {
      parse_mode: "HTML",
      reply_markup: regionSelectionKeyboard(t, planId, regions),
    });
    return;
  }

  // ── No regions — show order summary ───────────────────────────────────────
  const price = parseFloat(plan.price as string);
  let duration = t("oneTime");
  if (plan.duration) {
    const unitKey = plan.durationUnit ?? "day";
    let unitLabel = "";
    if (unitKey === "day") unitLabel = t("duration_day");
    else if (unitKey === "month") unitLabel = t("duration_month");
    else if (unitKey === "year") unitLabel = t("duration_year");
    duration = `${plan.duration} ${unitLabel}`;
  }

  let message = `${t("orderSummary")}\n\n`;
  message += `📦 ${product.name}\n`;
  message += `📋 ${plan.name} — ${duration}\n`;
  message += `\n${t("total")} <b>${price.toLocaleString()}</b> ${t("currency")}`;

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: orderConfirmationKeyboard(t, planId),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// select_region_{planId}_{index} — store region, show order summary
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(
  /^select_region_(\d+)_(\d+)$/,
  async (context) => {
    if (!context.from || !context.queryData) return;

    const planId = Number.parseInt(context.queryData[1]!);
    const regionIndex = Number.parseInt(context.queryData[2]!);
    const userId = context.from.id;
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
    if (!product) return;

    // Resolve regions list (same logic as select_plan)
    const regions: Array<{ flag: string; name: string; price?: string }> =
      plan.regions && plan.regions.length > 0
        ? plan.regions
        : (product.regions ?? []);

    const region = regions[regionIndex];
    if (!region) {
      await context.answerCallbackQuery({
        text: "❌ Region not found",
        show_alert: true,
      });
      return;
    }

    // Store selection
    const regionPrice = region.price ? parseFloat(region.price) : undefined;
    preSelectedRegionState.set(userId, {
      planId,
      flag: region.flag,
      name: region.name,
      price: regionPrice,
    });

    // Calculate display price
    const effectivePrice = regionPrice ?? parseFloat(plan.price as string);

    let duration = t("oneTime");
    if (plan.duration) {
      const unitKey = plan.durationUnit ?? "day";
      let unitLabel = "";
      if (unitKey === "day") unitLabel = t("duration_day");
      else if (unitKey === "month") unitLabel = t("duration_month");
      else if (unitKey === "year") unitLabel = t("duration_year");
      duration = `${plan.duration} ${unitLabel}`;
    }

    let message = `${t("orderSummary")}\n\n`;
    message += `📦 ${product.name}\n`;
    message += `📋 ${plan.name} — ${duration}\n`;
    message += `🌍 ${t("selectedRegion")}: ${region.flag} ${region.name}\n`;
    message += `\n${t("total")} <b>${effectivePrice.toLocaleString()}</b> ${t("currency")}`;

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderConfirmationKeyboard(t, planId),
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// confirm_order_{planId} — start info collection or go to payment
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^confirm_order_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;
  await ConfirmOrderCallback(context);
});

// ─────────────────────────────────────────────────────────────────────────────
// add_discount_{planId} — enter discount code scene
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^add_discount_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  discountEntryState.set(userId, planId);

  await context.editText(t("enterDiscountCodeForOrder"), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text(t("btnSkipDiscount"), `select_plan_${planId}`)
      .row()
      .text(t("btnCancel"), "cancel_order"),
  });

  await context.scene.enter(enterDiscountCodeOrderScene);
});

// ─────────────────────────────────────────────────────────────────────────────
// notify_stock_{id} — subscribe to restock notification
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery(/^notify_stock_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const existing = await StockNotificationRepository.findByUserAndProduct(
    userId,
    productId,
  );

  if (existing) {
    if (!existing.isActive) {
      await StockNotificationRepository.reactivate(existing.id);
    }
    await context.answerCallbackQuery({
      text: t("stockAlreadySubscribed"),
      show_alert: true,
    });
    return;
  }

  await StockNotificationRepository.create({
    userId: userId as any,
    productId,
  });

  await context.answerCallbackQuery({
    text: t("stockSubscribed"),
    show_alert: true,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cancel_order — cancel and return to main menu
// ─────────────────────────────────────────────────────────────────────────────
productsComposer.callbackQuery("cancel_order", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  await context.editText(t("mainMenu"), {
    parse_mode: "HTML",
    reply_markup: backToMainKeyboard(t),
  });
});
