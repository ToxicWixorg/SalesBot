import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { i18n } from "../shared/locales/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import {
  CategoryRepository,
  ProductRepository,
  ProductPlanRepository,
} from "../repositories/ProductRepository.ts";
import {
  categoriesKeyboard,
  productsListKeyboard,
  productDetailsKeyboard,
  productPlansKeyboard,
  orderConfirmationKeyboard,
  backToMainKeyboard,
  mainMenuKeyboard,
} from "../shared/keyboards/index.ts";

export const productsComposer = new Composer().extend(composer);

/**
 * Handle "main_menu" callback - Return to main menu
 */
productsComposer.callbackQuery("main_menu", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  await context.editText(t("mainMenu") + "\n\n" + t("chooseAction"), {
    reply_markup: mainMenuKeyboard(t),
  });
});

/**
 * Handle "products" callback - Show categories
 */
productsComposer.callbackQuery("products", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  // Get all categories
  const categories = await CategoryRepository.findAll();

  if (categories.length === 0) {
    await context.editText("❌ No categories available.");
    return;
  }

  await context.editText(t("selectCategory"), {
    reply_markup: categoriesKeyboard(t, categories),
  });
});

/**
 * Handle "categories" callback - Show categories list again
 */
productsComposer.callbackQuery("categories", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");
  const categories = await CategoryRepository.findAll();

  await context.editText(t("selectCategory"), {
    reply_markup: categoriesKeyboard(t, categories),
  });
});

/**
 * Handle "category_{id}" callback - Show products in category
 */
productsComposer.callbackQuery(/^category_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const categoryId = Number.parseInt(context.queryData[1]);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  // Get category
  const category = await CategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery("❌ Category not found");
    return;
  }

  // Get products in category
  const products = await ProductRepository.findByCategory(categoryId);

  let message = `${t("categoryProducts", category.name)}\n\n`;

  if (products.length === 0) {
    message += t("noProducts");
  } else {
    message += `${products.length} product(s) available`;
  }

  await context.editText(message, {
    reply_markup: productsListKeyboard(t, products, categoryId),
  });
});

/**
 * Handle "product_{id}" callback - Show product details
 */
productsComposer.callbackQuery(/^product_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  // Get product
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery("❌ Product not found");
    return;
  }

  const hasStock = (product.stock || 0) > 0;

  // Build product details message
  let message = `${t("productDetails")}\n\n`;
  message += `📦 ${product.name}\n\n`;

  if (product.description) {
    message += `${product.description}\n\n`;
  }

  // Stock status
  message += `${t("stock")} ${hasStock ? t("available") : t("outOfStock")}\n`;

  // Delivery type
  message += `${t("deliveryType")} `;
  if (product.deliveryType === "automatic") {
    message += t("deliveryAutomatic");
  } else if (product.deliveryType === "manual") {
    message += t("deliveryManual");
  } else {
    message += t("deliveryCoordination");
  }

  await context.editText(message, {
    reply_markup: productDetailsKeyboard(t, product, hasStock),
  });
});

/**
 * Handle "buy_product_{id}" callback - Show product plans
 */
productsComposer.callbackQuery(/^buy_product_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  // Get product
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery("❌ Product not found");
    return;
  }

  // Check stock
  if ((product.stock || 0) <= 0) {
    await context.answerCallbackQuery("❌ Out of stock");
    return;
  }

  // Get plans
  const plans = await ProductPlanRepository.findByProductId(productId);

  if (plans.length === 0) {
    await context.answerCallbackQuery("❌ No plans available");
    return;
  }

  let message = `📦 ${product.name}\n\n`;
  message += `${t("selectPlan")}`;

  await context.editText(message, {
    reply_markup: productPlansKeyboard(t, plans, productId),
  });
});

/**
 * Handle "select_plan_{id}" callback - Show order confirmation
 */
productsComposer.callbackQuery(/^select_plan_(\d+)$/, async (context) => {
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

  message += `\n${t("total")} ${plan.price} ${t("currency")}`;

  await context.editText(message, {
    reply_markup: orderConfirmationKeyboard(t, planId),
  });
});

/**
 * Handle "notify_stock_{id}" callback - Notify when product is available
 */
productsComposer.callbackQuery(/^notify_stock_(\d+)$/, async (context) => {
  if (!context.from || !context.queryData) return;

  // TODO: Implement stock notification system
  await context.answerCallbackQuery(
    "✅ You will be notified when this product is available",
  );
});

/**
 * Handle "cancel_order" callback - Cancel order
 */
productsComposer.callbackQuery("cancel_order", async (context) => {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  await context.editText("❌ Order cancelled", {
    reply_markup: backToMainKeyboard(t),
  });
});
