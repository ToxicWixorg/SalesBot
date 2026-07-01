import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type {
  Category,
  Inventory,
  Product,
  ProductPlan,
} from "../../../db/schema.ts";
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

/** Delivery types the order flow can actually fulfil. */
export const DELIVERY_TYPES = ["automatic", "manual", "custom_schedule"] as const;

/** Human-readable label for a delivery type. */
export function deliveryTypeLabel(t: TFunction, type: string | null): string {
  switch (type) {
    case "automatic":
      return t("deliveryType_automatic");
    case "manual":
      return t("deliveryType_manual");
    case "custom_schedule":
      return t("deliveryType_custom_schedule");
    default:
      return type ?? "-";
  }
}

export function adminPanelPlanKeyboard(
  t: TFunction,
  plan: ProductPlan,
): InlineKeyboard {
  const planId = plan.id;
  const activeLabel =
    plan.isActive === false ? t("btnPlanActivate") : t("btnPlanDeactivate");

  const keyboard = new InlineKeyboard()
    .text(t("btnPlanEditName"), `admin_edit_plan_${planId}`, { style: "primary" })
    .text(t("btnEditPrice"), `admin_edit_plan_price_${planId}`, {
      style: "primary",
    })
    .row()
    .text(t("btnPlanEditDesc"), `admin_plan_desc_${planId}`, { style: "primary" })
    .text(t("btnPlanEditDuration"), `admin_plan_duration_${planId}`, {
      style: "primary",
    })
    .row()
    .text(
      `${t("btnPlanDelivery")}: ${deliveryTypeLabel(t, plan.deliveryType)}`,
      `admin_plan_delivery_${planId}`,
      { style: "primary" },
    )
    .row()
    .text(t("btnPlanRequirements"), `admin_plan_reqs_${planId}`, {
      style: "primary",
    })
    .text(t("btnPlanOrder"), `admin_plan_order_${planId}`, { style: "primary" })
    .row();

  // Inventory management only applies to automatic delivery (draws from stock).
  if (plan.deliveryType === "automatic") {
    keyboard
      .text(t("btnPlanInventory"), `admin_plan_inventory_${planId}`, {
        style: "primary",
      })
      .row();
  }

  keyboard
    .text(activeLabel, `admin_plan_toggleactive_${planId}`, {
      style: plan.isActive === false ? "success" : "danger",
    })
    .text(t("btnDelete"), `admin_delete_plan_${planId}`, { style: "danger" })
    .row()
    .text(t("btnBack"), `admin_product_plans_${plan.productId}`, {
      icon_custom_emoji_id: emojiIds.back,
    });

  return keyboard;
}

export function adminPlanInventoryKeyboard(
  t: TFunction,
  plan: ProductPlan,
  counts: { available: number; reserved: number; used: number; dead: number },
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text(t("btnPlanAddStock"), `admin_plan_addstock_${plan.id}`, {
      style: "success",
    })
    .row();

  if (counts.available > 0) {
    keyboard
      .text(t("btnPlanManageItems"), `admin_plan_items_${plan.id}`, {
        style: "primary",
      })
      .row()
      .text(t("btnPlanClearStock"), `admin_plan_clearstock_${plan.id}`, {
        style: "danger",
      })
      .row();
  }

  keyboard.text(t("btnBack"), `admin_plan_${plan.id}`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}

const ITEMS_PER_PAGE = 8;

/** Short single-line preview of an inventory item for a button label. */
function itemPreview(item: Inventory): string {
  const credentials = [item.email, item.password].filter(Boolean).join(":");
  const raw = item.content || credentials || item.extraData || "";
  const oneLine = raw.replace(/\s+/g, " ").trim();
  return oneLine.length > 30 ? `${oneLine.slice(0, 30)}…` : oneLine || "—";
}

/**
 * Paginated list of available inventory items, one button per item that opens
 * its detail view. Used by the "manage items individually" flow.
 */
export function adminPlanItemsListKeyboard(
  t: TFunction,
  plan: ProductPlan,
  items: Inventory[],
  page: number,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * ITEMS_PER_PAGE;
  const pageItems = items.slice(start, start + ITEMS_PER_PAGE);

  for (const item of pageItems) {
    keyboard
      .text(
        `#${item.id} · ${itemPreview(item)}`,
        `admin_inv_item_${plan.id}_${item.id}`,
      )
      .row();
  }

  if (totalPages > 1) {
    if (current > 1) {
      keyboard.text(t("previous"), `admin_plan_items_${plan.id}_${current - 1}`);
    }
    keyboard.text(`${current}/${totalPages}`, "noop");
    if (current < totalPages) {
      keyboard.text(t("next"), `admin_plan_items_${plan.id}_${current + 1}`);
    }
    keyboard.row();
  }

  keyboard.text(t("btnBack"), `admin_plan_inventory_${plan.id}`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}

/** Detail view of a single inventory item — delete or go back to the list. */
export function adminInventoryItemKeyboard(
  t: TFunction,
  planId: number,
  itemId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnDeleteItem"), `admin_inv_del_${planId}_${itemId}`, {
      style: "danger",
    })
    .row()
    .text(t("btnBack"), `admin_plan_items_${planId}_1`, {
      icon_custom_emoji_id: emojiIds.back,
    });
}

export function adminPlanDeliveryKeyboard(
  t: TFunction,
  plan: ProductPlan,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const type of DELIVERY_TYPES) {
    const mark = plan.deliveryType === type ? "✅ " : "";
    keyboard
      .text(
        `${mark}${deliveryTypeLabel(t, type)}`,
        `admin_plan_setdelivery_${plan.id}_${type}`,
      )
      .row();
  }
  keyboard.text(t("btnBack"), `admin_plan_${plan.id}`, {
    icon_custom_emoji_id: emojiIds.back,
  });
  return keyboard;
}

export function adminPlanRequirementsKeyboard(
  t: TFunction,
  plan: ProductPlan,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const fields = plan.requiredInputs ?? [];

  fields.forEach((field, index) => {
    const label = `🗑 ${field.textFA || field.textEN || field.textRU || field.key}`;
    keyboard
      .text(label, `admin_plan_delfield_${plan.id}_${index}`, {
        style: "danger",
      })
      .row();
  });

  keyboard
    .text(t("btnPlanAddField"), `admin_plan_addfield_${plan.id}`, {
      style: "success",
    })
    .row()
    .text(t("btnBack"), `admin_plan_${plan.id}`, {
      icon_custom_emoji_id: emojiIds.back,
    });

  return keyboard;
}
