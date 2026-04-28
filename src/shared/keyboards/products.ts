import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";
import type { Category, Product, ProductPlan } from "../../db/schema.ts";

/**
 * Generate categories selection keyboard
 */
export function categoriesKeyboard(
  t: TFunction,
  categories: Category[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  categories.reverse().forEach((category, index) => {
    const icon = category.icon || "📦";
    keyboard.text(`${icon} ${category.name}`, `category_${category.id}`);

    // Add row after every 2 categories
    if (index % 2 === 1 && index !== categories.length - 1) {
      keyboard.row();
    }
  });

  keyboard.row();
  keyboard.text(t("btnMainMenu"), "main_menu");

  return keyboard;
}

/**
 * Generate products list keyboard for a category
 */
export function productsListKeyboard(
  t: TFunction,
  products: Product[],
  categoryId: number,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (products.length === 0) {
    keyboard.text(t("btnBack"), `categories`);
    return keyboard;
  }

  products.forEach((product) => {
    const stockIcon = (product.stock || 0) > 0 ? "✅" : "❌";
    keyboard.text(`${stockIcon} ${product.name}`, `product_${product.id}`);
    keyboard.row();
  });

  keyboard.text(t("btnBack"), `categories`);

  return keyboard;
}

/**
 * Generate product details keyboard
 */
export function productDetailsKeyboard(
  t: TFunction,
  product: Product,
  hasStock: boolean,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (hasStock) {
    keyboard.text(t("btnBuyProduct"), `buy_product_${product.id}`);
    keyboard.row();
  } else {
    keyboard.text(t("btnNotifyStock"), `notify_stock_${product.id}`);
    keyboard.row();
  }

  keyboard.text(t("btnBack"), `category_${product.categoryId}`);

  return keyboard;
}

/**
 * Generate product plans selection keyboard
 */
export function productPlansKeyboard(
  t: TFunction,
  plans: ProductPlan[],
  productId: number,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  plans.forEach((plan) => {
    let duration = t("oneTime");

    if (plan.duration) {
      const unitKey = plan.durationUnit || "day";
      let durationUnit = "";

      if (unitKey === "day") durationUnit = t("duration_day");
      else if (unitKey === "month") durationUnit = t("duration_month");
      else if (unitKey === "year") durationUnit = t("duration_year");

      duration = `${plan.duration} ${durationUnit}`;
    }

    keyboard.text(
      `${plan.name} - ${plan.price} ${t("currency")} (${duration})`,
      `select_plan_${plan.id}`,
    );
    keyboard.row();
  });

  keyboard.text(t("btnBack"), `product_${productId}`);

  return keyboard;
}

/**
 * Generate order confirmation keyboard
 */
export function orderConfirmationKeyboard(
  t: TFunction,
  planId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnConfirmOrder"), `confirm_order_${planId}`)
    .row()
    .text(t("btnAddDiscountCode"), `add_discount_${planId}`)
    .row()
    .text(t("btnCancel"), `cancel_order`);
}
