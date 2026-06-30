import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Category, Product, ProductPlan } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { getLocalizedName } from "../../utils/localizedFields.ts";
import { normalizeCustomEmojiId } from "../../utils/customEmoji.ts";

export function adminPanelCategoriesKeyboard(
  t: TFunction,
  categories: Category[],
  languageCode = "fa",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (categories.length === 0) {
    keyboard.text(t("btnCreateCategory"), "admin_create_category", {
      style: "success",
    });
    keyboard.row();
    keyboard.text(t("btnBack"), "admin_panel", {
      icon_custom_emoji_id: emojiIds.back,
    });
    return keyboard;
  }

  categories.forEach((category, index) => {
    const prefix = category.isActive === false ? "🚫 " : "";
    const safeEmojiId = normalizeCustomEmojiId(category.customEmojiId);
    const label = `${prefix}${category.icon ?? ""} ${getLocalizedName(
      category,
      languageCode,
    )}`.trim();
    const opts = safeEmojiId ? { icon_custom_emoji_id: safeEmojiId } : undefined;

    keyboard.text(label, `admin_category_${category.id}`, opts);
    if (index % 2 === 1 && index !== categories.length - 1) {
      keyboard.row();
    }
  });

  keyboard.row();
  keyboard.text(t("btnCreateCategory"), "admin_create_category", {
    style: "success",
  });
  keyboard.row();
  keyboard.text(t("btnBack"), "admin_panel", {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}

export function adminPanelCategoryKeyboard(
  t: TFunction,
  categoryId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnCreateProduct"), `admin_create_product_${categoryId}`, {
      style: "success",
    })
    .row()
    .text(t("btnProductsInCategory"), `admin_category_products_${categoryId}`, {
      style: "primary",
    })
    .row()
    .text(t("btnEdit"), `admin_edit_category_${categoryId}`, {
      style: "primary",
    })
    .text(t("btnDelete"), `admin_delete_category_${categoryId}`, {
      style: "danger",
    })
    .row()
    .text(t("btnBack"), "panel_products", {
      icon_custom_emoji_id: emojiIds.back,
    });
}

export function adminPanelProductsListKeyboard(
  t: TFunction,
  products: Product[],
  categoryId: number,
  languageCode = "fa",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  if (products.length === 0) {
    keyboard.text(t("btnCreateProduct"), `admin_create_product_${categoryId}`, {
      style: "success",
    });
    keyboard.row();
    keyboard.text(t("btnBack"), `admin_category_${categoryId}`, {
      icon_custom_emoji_id: emojiIds.back,
    });
    return keyboard;
  }

  products.forEach((product, index) => {
    const prefix = product.isActive === false ? "🚫 " : "";
    const safeEmojiId = normalizeCustomEmojiId(product.customEmojiId);
    const label = `${prefix}${getLocalizedName(product, languageCode)}`;
    const opts = safeEmojiId ? { icon_custom_emoji_id: safeEmojiId } : undefined;

    keyboard.text(label, `admin_product_${product.id}`, opts);
    if (index % 2 === 1 && index !== products.length - 1) {
      keyboard.row();
    }
  });

  keyboard.row();
  keyboard.text(t("btnCreateProduct"), `admin_create_product_${categoryId}`, {
    style: "success",
  });
  keyboard.row();
  keyboard.text(t("btnBack"), `admin_category_${categoryId}`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}

export function adminPanelProductDetailsKeyboard(
  t: TFunction,
  productId: number,
  categoryId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnViewPlans"), `admin_product_plans_${productId}`, {
      style: "primary",
    })
    .text(t("btnCreatePlan"), `admin_create_plan_${productId}`, {
      style: "success",
    })
    .row()
    .text(t("btnEdit"), `admin_edit_product_${productId}`, {
      style: "primary",
    })
    .text(t("btnDelete"), `admin_delete_product_${productId}`, {
      style: "danger",
    })
    .row()
    .text(t("btnBack"), `admin_category_products_${categoryId}`, {
      icon_custom_emoji_id: emojiIds.back,
    });
}

export function adminPanelProductPlansKeyboard(
  t: TFunction,
  plans: ProductPlan[],
  productId: number,
  languageCode = "fa",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  if (plans.length === 0) {
    keyboard.text(t("btnCreatePlan"), `admin_create_plan_${productId}`, {
      style: "success",
    });
    keyboard.row();
    keyboard.text(t("btnBack"), `admin_product_${productId}`, {
      icon_custom_emoji_id: emojiIds.back,
    });
    return keyboard;
  }

  plans.forEach((plan, index) => {
    const prefix = plan.isActive === false ? "🚫 " : "";
    const safeEmojiId = normalizeCustomEmojiId(plan.customEmojiId);
    const label = `${prefix}${getLocalizedName(plan, languageCode)}`;
    const opts = safeEmojiId ? { icon_custom_emoji_id: safeEmojiId } : undefined;

    keyboard.text(label, `admin_plan_${plan.id}`, opts);
    if (index % 2 === 1 && index !== plans.length - 1) {
      keyboard.row();
    }
  });

  keyboard.row();
  keyboard.text(t("btnCreatePlan"), `admin_create_plan_${productId}`, {
    style: "success",
  });
  keyboard.row();
  keyboard.text(t("btnBack"), `admin_product_${productId}`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}

export function adminPanelPlanKeyboard(
  t: TFunction,
  planId: number,
  productId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnEditPrice"), `admin_edit_plan_price_${planId}`, {
      style: "primary",
    })
    .row()
    .text(t("btnEdit"), `admin_edit_plan_${planId}`, {
      style: "primary",
    })
    .text(t("btnDelete"), `admin_delete_plan_${planId}`, {
      style: "danger",
    })
    .row()
    .text(t("btnBack"), `admin_product_plans_${productId}`, {
      icon_custom_emoji_id: emojiIds.back,
    });
}
