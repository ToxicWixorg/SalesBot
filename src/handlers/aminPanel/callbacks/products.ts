import type { AnyBot } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import { AdminSections } from "../../../services/bot/admin/Admin/Section.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  getUsdtRate,
  usdToTomanWithRate,
} from "../../../services/tetherland/index.ts";
import {
  ProductRepository,
  ProductPlanRepository,
  PremiumCategoryRepository,
} from "../../../repositories/ProductRepository.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import {
  adminPanelCategoriesKeyboard,
  adminPanelCategoryKeyboard,
  adminPanelProductsListKeyboard,
  adminPanelProductDetailsKeyboard,
  adminPanelProductPlansKeyboard,
  adminPanelPlanKeyboard,
  adminPlanDeliveryKeyboard,
  adminPlanRequirementsKeyboard,
  adminPlanInventoryKeyboard,
  deliveryTypeLabel,
  DELIVERY_TYPES,
} from "../../../shared/keyboards/adminPanel/products.ts";
import {
  getLocalizedName,
  getLocalizedDescription,
} from "../../../shared/utils/localizedFields.ts";
import { normalizeCustomEmojiId } from "../../../shared/utils/customEmoji.ts";

async function getT(context: any) {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  return i18n.buildT(user.languageCode ?? "fa");
}

async function requireProductAccess(context: any) {
  if (!context.from) return false;
  const isAdmin = await AdminService.isAdmin(context.from.id);
  if (!isAdmin) return false;
  return await AdminService.hasPermission(
    context.from.id,
    AdminSections.PRODUCTS,
  );
}

export async function adminPanelProductsCallback(context: any) {
  const t = await getT(context);
  if (!t || !context.from) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const categories = await PremiumCategoryRepository.findAll();
  await context.editText(t("adminProductsTitle"), {
    parse_mode: "HTML",
    reply_markup: adminPanelCategoriesKeyboard(
      t,
      categories,
      context.from.languageCode ?? "fa",
    ),
  });
}

export async function adminCategoryCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const categoryId = Number.parseInt(context.queryData[1]!);
  const category = await PremiumCategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  const categoryName = getLocalizedName(category, context.from.languageCode);
  const categoryDescription = getLocalizedDescription(
    category,
    context.from.languageCode,
  );
  const status = category.isActive ? t("active") : t("inactive");
  const prefix = normalizeCustomEmojiId(category.customEmojiId)
    ? `<tg-emoji emoji-id="${normalizeCustomEmojiId(category.customEmojiId)}">ðŸ“</tg-emoji> `
    : "ðŸ“ ";

  const message =
    `${prefix}<b>${categoryName}</b>
` +
    `${categoryDescription ? `${categoryDescription}

` : ""}` +
    `${t("adminCategoryStatus", status)}`;

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: adminPanelCategoryKeyboard(t, categoryId),
  });
}

export async function adminCategoryProductsCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const categoryId = Number.parseInt(context.queryData[1]!);
  const category = await PremiumCategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  const products = await ProductRepository.findAllByCategory(categoryId);
  const categoryName = getLocalizedName(category, context.from.languageCode);

  await context.editText(t("adminCategoryProductsTitle", categoryName), {
    parse_mode: "HTML",
    reply_markup: adminPanelProductsListKeyboard(
      t,
      products,
      categoryId,
      context.from.languageCode ?? "fa",
    ),
  });
}

export async function adminProductCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  const productName = getLocalizedName(product, context.from.languageCode);
  const productDescription = getLocalizedDescription(
    product,
    context.from.languageCode,
  );
  const status = product.isActive ? t("active") : t("inactive");

  const category =
    product.categoryId &&
      (await PremiumCategoryRepository.findById(product.categoryId));
  const categoryName = category
    ? getLocalizedName(category, context.from.languageCode)
    : "-";

  const safeEmojiId = normalizeCustomEmojiId(product.customEmojiId);
  const icon = safeEmojiId
    ? `<tg-emoji emoji-id="${safeEmojiId}">ðŸ›ï¸</tg-emoji> `
    : "ðŸ›ï¸ ";

  const message =
    `${icon}<b>${productName}</b>
` +
    `${productDescription ? `${productDescription}

` : ""}` +
    `${t("adminProductStatus", status)}
` +
    `${t("adminProductCategory", categoryName)}`;

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: adminPanelProductDetailsKeyboard(
      t,
      productId,
      product.categoryId ?? 0,
    ),
  });
}

export async function adminProductPlansCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  const plans = await ProductPlanRepository.findAllByProductId(productId);
  const productName = getLocalizedName(product, context.from.languageCode);

  await context.editText(t("adminProductPlansTitle", productName), {
    parse_mode: "HTML",
    reply_markup: adminPanelProductPlansKeyboard(
      t,
      plans,
      productId,
      context.from.languageCode ?? "fa",
    ),
  });
}

export async function adminPlanCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const planName = getLocalizedName(plan, context.from.languageCode);
  const planDescription = getLocalizedDescription(
    plan,
    context.from.languageCode,
  );
  const status = plan.isActive ? t("active") : t("inactive");

  // Prices are stored in USD; show the dollar value plus the live Toman value.
  let price = t("notAvailable");
  if (plan.price) {
    const usd = Number.parseFloat(plan.price as string);
    const rate = await getUsdtRate();
    price =
      rate !== null
        ? `$${usd} (≈ ${usdToTomanWithRate(usd, rate).toLocaleString()} ${t("currency")})`
        : `$${usd}`;
  }
  const duration = plan.duration ? `${plan.duration} ${plan.durationUnit ?? "days"}` : t("oneTime");

  const message =
    `<b>${planName}</b>
` +
    `${planDescription ? `${planDescription}

` : ""}` +
    `${t("adminPlanStatus", status)}
` +
    `${t("priceLabel", price)}
` +
    `${t("durationLabel", duration)}`;

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: adminPanelPlanKeyboard(t, plan),
  });
}

async function replyNotImplemented(context: any, t: any) {
  await context.answerCallbackQuery({
    text: t("adminFeatureNotImplemented"),
    show_alert: true,
  });
}

export async function adminCreateCategoryCallback(context: any) {
  if (!context.from) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  createCategoryState.set(context.from.id, { step: "nameFA" });

  await context.editText(t("adminCreateCategoryPromptFA"), {
    parse_mode: "HTML",
  });
}

export async function adminCreateProductCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const categoryId = Number.parseInt(context.queryData[1]!);
  const category = await PremiumCategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  createProductState.set(context.from.id, { categoryId, step: "nameFA" });

  await context.editText(t("adminCreateProductPromptFA"), {
    parse_mode: "HTML",
  });
}

export async function adminCreatePlanCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const productId = Number.parseInt(context.queryData[1]!);
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  createPlanState.set(context.from.id, { productId, step: "nameFA" });

  await context.editText(t("adminCreatePlanPromptFA"), {
    parse_mode: "HTML",
  });
}

export async function adminEditCategoryCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const categoryId = Number.parseInt(context.queryData[1]!);
  const category = await PremiumCategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  editCategoryState.set(context.from.id, { categoryId, step: "nameFA" });

  await context.editText(
    t("adminEditCategoryPromptFA", { current: category.nameFA }),
    {
      parse_mode: "HTML",
      reply_markup: adminPanelCategoryKeyboard(t, categoryId),
    },
  );
}

export async function adminEditProductCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const productId = Number.parseInt(context.queryData[1]!);
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  editProductState.set(context.from.id, { productId, step: "nameFA" });

  await context.editText(
    t("adminEditProductPromptFA", { current: product.nameFA }),
    {
      parse_mode: "HTML",
      reply_markup: adminPanelProductDetailsKeyboard(
        t,
        productId,
        product.categoryId ?? 0,
      ),
    },
  );
}

export async function adminEditPlanCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  editPlanState.set(context.from.id, { planId, step: "nameFA" });

  await context.editText(t("adminEditPlanPromptFA", { current: plan.nameFA }), {
    parse_mode: "HTML",
    reply_markup: adminPanelPlanKeyboard(t, plan),
  });
}

export async function adminDeleteCategoryCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const categoryId = Number.parseInt(context.queryData[1]!);
  const category = await PremiumCategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  // FK on products is ON DELETE no action, so orphan the products (set their
  // category to null) before removing the category row for good.
  const products = await ProductRepository.findAllByCategory(categoryId);
  await ProductRepository.clearCategory(categoryId);
  await PremiumCategoryRepository.delete(categoryId);

  const orphanNote =
    products.length > 0
      ? t("adminCategoryProductsOrphaned", { count: products.length })
      : "";

  const categories = await PremiumCategoryRepository.findAll();
  await context.editText(
    `${t("adminCategoryDeleted")}\n\n` +
      `<b>${getLocalizedName(category, context.from.languageCode)}</b>` +
      orphanNote,
    {
      parse_mode: "HTML",
      reply_markup: adminPanelCategoriesKeyboard(
        t,
        categories,
        context.from.languageCode ?? "fa",
      ),
    },
  );
}

export async function adminDeleteProductCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  const categoryId = product.categoryId ?? 0;
  const name = getLocalizedName(product, context.from.languageCode);

  let note = "";
  try {
    // Plans cascade-delete; this fails only if orders still reference it.
    await ProductRepository.delete(productId);
  } catch {
    await ProductRepository.update(productId, { isActive: false });
    note = `\n\n${t("adminProductDeactivatedHasOrders")}`;
  }

  const products = await ProductRepository.findAllByCategory(categoryId);
  await context.editText(`${t("adminProductDeleted")}\n\n<b>${name}</b>${note}`, {
    parse_mode: "HTML",
    reply_markup: adminPanelProductsListKeyboard(
      t,
      products,
      categoryId,
      context.from.languageCode ?? "fa",
    ),
  });
}

export async function adminDeletePlanCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const productId = plan.productId;
  const name = getLocalizedName(plan, context.from.languageCode);

  let note = "";
  try {
    // Fails only if orders still reference this plan.
    await ProductPlanRepository.delete(planId);
  } catch {
    await ProductPlanRepository.update(planId, { isActive: false });
    note = `\n\n${t("adminPlanDeactivatedHasOrders")}`;
  }

  const plans = await ProductPlanRepository.findAllByProductId(productId);
  await context.editText(`${t("adminPlanDeleted")}\n\n<b>${name}</b>${note}`, {
    parse_mode: "HTML",
    reply_markup: adminPanelProductPlansKeyboard(
      t,
      plans,
      productId,
      context.from.languageCode ?? "fa",
    ),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚚 PLAN FIELD MANAGEMENT (delivery / requirements / active) ━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** `admin_plan_delivery_{planId}` — show the delivery-type submenu. */
export async function adminPlanDeliveryCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  await context.editText(t("adminPlanDeliveryPrompt"), {
    parse_mode: "HTML",
    reply_markup: adminPlanDeliveryKeyboard(t, plan),
  });
}

/** `admin_plan_setdelivery_{planId}_{type}` — set the plan's delivery type. */
export async function adminPlanSetDeliveryCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const type = context.queryData[2]!;
  if (!(DELIVERY_TYPES as readonly string[]).includes(type)) {
    await context.answerCallbackQuery();
    return;
  }

  let plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  plan = await ProductPlanRepository.update(planId, { deliveryType: type });

  await context.editText(
    t("adminPlanDeliveryUpdated", { type: deliveryTypeLabel(t, type) }),
    {
      parse_mode: "HTML",
      reply_markup: adminPanelPlanKeyboard(t, plan),
    },
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PLAN INVENTORY (automatic delivery) ━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AddStockState {
  planId: number;
  productId: number;
}

/** adminUserId → plan/product awaiting pasted inventory items */
const addPlanStockState = new Map<number, AddStockState>();

/** `admin_plan_inventory_{planId}` — show the product's inventory summary. */
export async function adminPlanInventoryCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const counts = await InventoryRepository.statusCounts(plan.productId);
  await context.editText(t("adminPlanInventoryTitle", counts), {
    parse_mode: "HTML",
    reply_markup: adminPlanInventoryKeyboard(t, plan, counts),
  });
}

/** `admin_plan_addstock_{planId}` — prompt the admin to paste inventory items. */
export async function adminPlanAddStockCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  addPlanStockState.set(context.from.id, {
    planId,
    productId: plan.productId,
  });

  await context.editText(t("adminPlanAddStockPrompt"), {
    parse_mode: "HTML",
  });
}

/** `admin_plan_clearstock_{planId}` — delete all available inventory items. */
export async function adminPlanClearStockCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const removed = await InventoryRepository.deleteAvailableByProductId(
    plan.productId,
  );
  const counts = await InventoryRepository.statusCounts(plan.productId);

  await context.answerCallbackQuery({
    text: t("adminPlanStockCleared", { count: removed }),
  });
  await context.editText(t("adminPlanInventoryTitle", counts), {
    parse_mode: "HTML",
    reply_markup: adminPlanInventoryKeyboard(t, plan, counts),
  });
}

/** `admin_plan_reqs_{planId}` — show the requirement-toggles submenu. */
export async function adminPlanRequirementsCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  await context.editText(t("adminPlanRequirementsTitle"), {
    parse_mode: "HTML",
    reply_markup: adminPlanRequirementsKeyboard(t, plan),
  });
}

/** Build a unique, slug-safe field key from a name. */
function uniqueFieldKey(base: string, existing: Set<string>): string {
  const slug =
    base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field";
  let key = slug;
  let n = 2;
  while (existing.has(key)) key = `${slug}_${n++}`;
  return key;
}

/** `admin_plan_addfield_{planId}` — start the add-input-field flow. */
export async function adminPlanAddFieldCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  addPlanFieldState.set(context.from.id, { planId, step: "nameFA" });

  await context.editText(t("adminPlanAddFieldPromptFA"), {
    parse_mode: "HTML",
  });
}

/** `admin_plan_delfield_{planId}_{index}` — remove one input field by index. */
export async function adminPlanDeleteFieldCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const index = Number.parseInt(context.queryData[2]!);
  let plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const fields = [...(plan.requiredInputs ?? [])];
  if (index < 0 || index >= fields.length) {
    await context.answerCallbackQuery();
    return;
  }
  fields.splice(index, 1);

  plan = await ProductPlanRepository.update(planId, { requiredInputs: fields });

  await context.editText(
    `${t("adminPlanFieldDeleted")}\n\n${t("adminPlanRequirementsTitle")}`,
    {
      parse_mode: "HTML",
      reply_markup: adminPlanRequirementsKeyboard(t, plan),
    },
  );
}

/** `admin_plan_toggleactive_{planId}` — activate/deactivate the plan. */
export async function adminPlanToggleActiveCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  let plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  plan = await ProductPlanRepository.update(planId, {
    isActive: plan.isActive === false,
  });

  await context.editText(
    t("adminPlanActiveToggled", {
      status: plan.isActive ? t("active") : t("inactive"),
    }),
    {
      parse_mode: "HTML",
      reply_markup: adminPanelPlanKeyboard(t, plan),
    },
  );
}

/** `admin_plan_desc_{planId}` — start the description edit flow. */
export async function adminEditPlanDescCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  editPlanDescState.set(context.from.id, { planId, step: "nameFA" });

  await context.editText(
    t("adminEditPlanDescPromptFA", { current: plan.descriptionFA ?? "-" }),
    {
      parse_mode: "HTML",
      reply_markup: adminPanelPlanKeyboard(t, plan),
    },
  );
}

/** `admin_plan_duration_{planId}` — prompt for the new duration. */
export async function adminEditPlanDurationCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  editPlanDurationState.set(context.from.id, planId);

  await context.editText(t("adminEditPlanDurationPrompt"), {
    parse_mode: "HTML",
    reply_markup: adminPanelPlanKeyboard(t, plan),
  });
}

/** `admin_plan_order_{planId}` — prompt for the new display order. */
export async function adminEditPlanOrderCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  editPlanOrderState.set(context.from.id, planId);

  await context.editText(
    t("adminEditPlanOrderPrompt", { current: plan.order ?? 0 }),
    {
      parse_mode: "HTML",
      reply_markup: adminPanelPlanKeyboard(t, plan),
    },
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💵 EDIT PLAN PRICE (admin enters USD) ━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** adminUserId → planId being edited */
const editPlanPriceState = new Map<number, number>();

/** Convert Persian/Arabic-Indic digits to ASCII so `parseFloat` works. */
function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * `admin_edit_plan_price_{planId}` — prompt the admin to type the new USD price.
 */
export async function adminEditPlanPriceCallback(context: any) {
  if (!context.from || !context.queryData) return;
  const t = await getT(context);
  if (!t) return;

  if (!(await requireProductAccess(context))) {
    await context.answerCallbackQuery({
      text: t("noPermission"),
      show_alert: true,
    });
    return;
  }

  const planId = Number.parseInt(context.queryData[1]!);
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  editPlanPriceState.set(context.from.id, planId);

  const planName = getLocalizedName(plan, context.from.languageCode);
  await context.editText(t("adminEditPlanPricePrompt", { planName }), {
    parse_mode: "HTML",
    reply_markup: adminPanelPlanKeyboard(t, plan),
  });
}

/**
 * Registers the text-message interceptor that captures the new USD price typed
 * by an admin after pressing "Edit price". Wire via setupAdminPlanPriceHandler(bot).
 */
export function setupAdminPlanPriceHandler(bot: AnyBot): void {
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.text) return next?.();

    const planId = editPlanPriceState.get(userId);
    if (planId === undefined) return next?.();

    // Don't swallow input meant for an active scene.
    if ((ctx as any).scene?.current) return next?.();

    const t = i18n.buildT(ctx.from?.languageCode ?? "fa");

    const usd = Number.parseFloat(normalizeDigits(ctx.text.trim()));
    if (!Number.isFinite(usd) || usd <= 0) {
      await ctx.send(t("adminPlanPriceInvalid"), { parse_mode: "HTML" });
      return;
    }

    editPlanPriceState.delete(userId);

    const plan = await ProductPlanRepository.findById(planId);
    if (!plan) {
      await ctx.send(t("planNotFound"), { parse_mode: "HTML" });
      return;
    }

    // Store as USD with 2 decimals (matches the decimal(15,2) column).
    const usdValue = usd.toFixed(2);
    await ProductPlanRepository.update(planId, { price: usdValue });

    const rate = await getUsdtRate();
    const tomanLine =
      rate !== null
        ? `\n≈ ${usdToTomanWithRate(usd, rate).toLocaleString()} ${t("currency")}`
        : "";

    await ctx.send(
      t("adminPlanPriceUpdated", {
        planName: getLocalizedName(plan, ctx.from?.languageCode),
        usd: usdValue,
      }) + tomanLine,
      {
        parse_mode: "HTML",
        reply_markup: adminPanelPlanKeyboard(t, plan),
      },
    );
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆕 CREATE CATEGORY (admin enters names) ━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type CreateCategoryStep = "nameFA" | "nameEN" | "nameRU";

interface CreateCategoryState {
  step: CreateCategoryStep;
  nameFA?: string;
  nameEN?: string;
  nameRU?: string;
}

/** adminUserId → in-progress category being created */
const createCategoryState = new Map<number, CreateCategoryState>();

interface EditCategoryState {
  categoryId: number;
  step: CreateCategoryStep;
  nameFA?: string;
  nameEN?: string;
  nameRU?: string;
}

/** adminUserId → in-progress category being edited */
const editCategoryState = new Map<number, EditCategoryState>();

interface CreateProductState {
  categoryId: number;
  step: CreateCategoryStep;
  nameFA?: string;
  nameEN?: string;
  nameRU?: string;
}

/** adminUserId → in-progress product being created (under a category) */
const createProductState = new Map<number, CreateProductState>();

interface EditProductState {
  productId: number;
  step: CreateCategoryStep;
  nameFA?: string;
  nameEN?: string;
  nameRU?: string;
}

/** adminUserId → in-progress product being edited */
const editProductState = new Map<number, EditProductState>();

type CreatePlanStep = "nameFA" | "nameEN" | "nameRU" | "price";

interface CreatePlanState {
  productId: number;
  step: CreatePlanStep;
  nameFA?: string;
  nameEN?: string;
  nameRU?: string;
}

/** adminUserId → in-progress plan being created (under a product) */
const createPlanState = new Map<number, CreatePlanState>();

interface EditPlanState {
  planId: number;
  step: CreateCategoryStep;
  nameFA?: string;
  nameEN?: string;
  nameRU?: string;
}

/** adminUserId → in-progress plan being edited */
const editPlanState = new Map<number, EditPlanState>();

interface EditPlanDescState {
  planId: number;
  step: CreateCategoryStep;
  descFA?: string | null;
  descEN?: string | null;
  descRU?: string | null;
}

/** adminUserId → in-progress plan description being edited */
const editPlanDescState = new Map<number, EditPlanDescState>();

/** adminUserId → planId whose duration is being entered */
const editPlanDurationState = new Map<number, number>();

/** adminUserId → planId whose display order is being entered */
const editPlanOrderState = new Map<number, number>();

interface AddPlanFieldState {
  planId: number;
  step: CreateCategoryStep;
  textFA?: string;
  textEN?: string;
  textRU?: string;
}

/** adminUserId → in-progress dynamic input field being added to a plan */
const addPlanFieldState = new Map<number, AddPlanFieldState>();

/** Ensure a product slug is unique by appending an incrementing suffix. */
async function uniqueProductSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await ProductRepository.findBySlug(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/** Build a URL-safe slug from a name; empty result falls back to a timestamp. */
function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `category-${Date.now()}`;
}

/** Ensure the slug is unique by appending an incrementing suffix when needed. */
async function uniqueCategorySlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await PremiumCategoryRepository.findBySlug(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/**
 * Registers the text-message interceptor that walks an admin through creating a
 * category (Persian → English → Russian name). Wire via
 * setupAdminCreateCategoryHandler(bot).
 */
export function setupAdminCreateCategoryHandler(bot: AnyBot): void {
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.text) return next?.();

    const state = createCategoryState.get(userId);
    const editState = editCategoryState.get(userId);
    const productState = createProductState.get(userId);
    const editProdState = editProductState.get(userId);
    const planState = createPlanState.get(userId);
    const editPlState = editPlanState.get(userId);
    const planDescState = editPlanDescState.get(userId);
    const planDurationId = editPlanDurationState.get(userId);
    const planOrderId = editPlanOrderState.get(userId);
    const addFieldState = addPlanFieldState.get(userId);
    const addStockState = addPlanStockState.get(userId);
    if (
      !state &&
      !editState &&
      !productState &&
      !editProdState &&
      !planState &&
      !editPlState &&
      !planDescState &&
      planDurationId === undefined &&
      planOrderId === undefined &&
      !addFieldState &&
      !addStockState
    )
      return next?.();

    // Don't swallow input meant for an active scene.
    if ((ctx as any).scene?.current) return next?.();

    const t = i18n.buildT(ctx.from?.languageCode ?? "fa");
    const text = ctx.text.trim();

    // ── EDIT FLOW (send a new name per step, or /skip to keep it) ──────────
    if (editState) {
      if (text === "/cancel") {
        editCategoryState.delete(userId);
        await ctx.send(t("adminEditCategoryCancelled"), { parse_mode: "HTML" });
        return;
      }

      const keep = text === "/skip";

      if (editState.step === "nameFA") {
        if (!keep) editState.nameFA = text;
        editState.step = "nameEN";
        const category = await PremiumCategoryRepository.findById(
          editState.categoryId,
        );
        await ctx.send(
          t("adminEditCategoryPromptEN", { current: category?.nameEN ?? "" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      if (editState.step === "nameEN") {
        if (!keep) editState.nameEN = text;
        editState.step = "nameRU";
        const category = await PremiumCategoryRepository.findById(
          editState.categoryId,
        );
        await ctx.send(
          t("adminEditCategoryPromptRU", { current: category?.nameRU ?? "" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      // step === "nameRU" — final step: persist changed fields and confirm.
      if (!keep) editState.nameRU = text;
      editCategoryState.delete(userId);

      const update: { nameFA?: string; nameEN?: string; nameRU?: string } = {};
      if (editState.nameFA !== undefined) update.nameFA = editState.nameFA;
      if (editState.nameEN !== undefined) update.nameEN = editState.nameEN;
      if (editState.nameRU !== undefined) update.nameRU = editState.nameRU;

      let category = await PremiumCategoryRepository.findById(
        editState.categoryId,
      );
      if (!category) {
        await ctx.send(t("categoryNotFound"), { parse_mode: "HTML" });
        return;
      }
      if (Object.keys(update).length > 0) {
        category = await PremiumCategoryRepository.update(
          editState.categoryId,
          update,
        );
      }

      await ctx.send(
        t("adminCategoryUpdated", {
          name: getLocalizedName(category, ctx.from?.languageCode),
        }),
        {
          parse_mode: "HTML",
          reply_markup: adminPanelCategoryKeyboard(t, editState.categoryId),
        },
      );
      return;
    }

    // ── CREATE PRODUCT FLOW (Persian → English → Russian name) ────────────
    if (productState) {
      if (text === "/cancel") {
        createProductState.delete(userId);
        await ctx.send(t("adminCreateProductCancelled"), {
          parse_mode: "HTML",
        });
        return;
      }

      if (productState.step === "nameFA") {
        productState.nameFA = text;
        productState.step = "nameEN";
        await ctx.send(t("adminCreateProductPromptEN"), { parse_mode: "HTML" });
        return;
      }

      if (productState.step === "nameEN") {
        productState.nameEN = text;
        productState.step = "nameRU";
        await ctx.send(t("adminCreateProductPromptRU"), { parse_mode: "HTML" });
        return;
      }

      // step === "nameRU" — final step: persist and confirm.
      productState.nameRU = text;
      createProductState.delete(userId);

      const slug = await uniqueProductSlug(
        slugify(productState.nameEN ?? productState.nameFA ?? "product"),
      );

      const product = await ProductRepository.create({
        nameFA: productState.nameFA!,
        nameEN: productState.nameEN!,
        nameRU: productState.nameRU!,
        slug,
        categoryId: productState.categoryId,
      });

      await ctx.send(
        t("adminProductCreated", {
          name: getLocalizedName(product, ctx.from?.languageCode),
        }),
        {
          parse_mode: "HTML",
          reply_markup: adminPanelProductDetailsKeyboard(
            t,
            product.id,
            productState.categoryId,
          ),
        },
      );
      return;
    }

    // ── EDIT PRODUCT FLOW (new name per step, /skip to keep) ──────────────
    if (editProdState) {
      if (text === "/cancel") {
        editProductState.delete(userId);
        await ctx.send(t("adminEditProductCancelled"), { parse_mode: "HTML" });
        return;
      }

      const keep = text === "/skip";

      if (editProdState.step === "nameFA") {
        if (!keep) editProdState.nameFA = text;
        editProdState.step = "nameEN";
        const product = await ProductRepository.findById(
          editProdState.productId,
        );
        await ctx.send(
          t("adminEditProductPromptEN", { current: product?.nameEN ?? "" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      if (editProdState.step === "nameEN") {
        if (!keep) editProdState.nameEN = text;
        editProdState.step = "nameRU";
        const product = await ProductRepository.findById(
          editProdState.productId,
        );
        await ctx.send(
          t("adminEditProductPromptRU", { current: product?.nameRU ?? "" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      // step === "nameRU" — final step: persist changed fields and confirm.
      if (!keep) editProdState.nameRU = text;
      editProductState.delete(userId);

      const update: { nameFA?: string; nameEN?: string; nameRU?: string } = {};
      if (editProdState.nameFA !== undefined) update.nameFA = editProdState.nameFA;
      if (editProdState.nameEN !== undefined) update.nameEN = editProdState.nameEN;
      if (editProdState.nameRU !== undefined) update.nameRU = editProdState.nameRU;

      let product = await ProductRepository.findById(editProdState.productId);
      if (!product) {
        await ctx.send(t("productNotFound"), { parse_mode: "HTML" });
        return;
      }
      if (Object.keys(update).length > 0) {
        product = await ProductRepository.update(editProdState.productId, update);
      }

      await ctx.send(
        t("adminProductUpdated", {
          name: getLocalizedName(product, ctx.from?.languageCode),
        }),
        {
          parse_mode: "HTML",
          reply_markup: adminPanelProductDetailsKeyboard(
            t,
            product.id,
            product.categoryId ?? 0,
          ),
        },
      );
      return;
    }

    // ── CREATE PLAN FLOW (Persian → English → Russian name → USD price) ────
    if (planState) {
      if (text === "/cancel") {
        createPlanState.delete(userId);
        await ctx.send(t("adminCreatePlanCancelled"), { parse_mode: "HTML" });
        return;
      }

      if (planState.step === "nameFA") {
        planState.nameFA = text;
        planState.step = "nameEN";
        await ctx.send(t("adminCreatePlanPromptEN"), { parse_mode: "HTML" });
        return;
      }

      if (planState.step === "nameEN") {
        planState.nameEN = text;
        planState.step = "nameRU";
        await ctx.send(t("adminCreatePlanPromptRU"), { parse_mode: "HTML" });
        return;
      }

      if (planState.step === "nameRU") {
        planState.nameRU = text;
        planState.step = "price";
        await ctx.send(t("adminCreatePlanPromptPrice"), { parse_mode: "HTML" });
        return;
      }

      // step === "price" — final step: validate price and create the plan.
      const usd = Number.parseFloat(normalizeDigits(text));
      if (!Number.isFinite(usd) || usd <= 0) {
        await ctx.send(t("adminCreatePlanPriceInvalid"), { parse_mode: "HTML" });
        return;
      }
      createPlanState.delete(userId);

      const usdValue = usd.toFixed(2);
      const plan = await ProductPlanRepository.create({
        productId: planState.productId,
        nameFA: planState.nameFA!,
        nameEN: planState.nameEN!,
        nameRU: planState.nameRU!,
        price: usdValue,
      });

      await ctx.send(
        t("adminPlanCreated", {
          name: getLocalizedName(plan, ctx.from?.languageCode),
          usd: usdValue,
        }),
        {
          parse_mode: "HTML",
          reply_markup: adminPanelPlanKeyboard(t, plan),
        },
      );
      return;
    }

    // ── EDIT PLAN FLOW (new name per step, /skip to keep) ─────────────────
    if (editPlState) {
      if (text === "/cancel") {
        editPlanState.delete(userId);
        await ctx.send(t("adminEditPlanCancelled"), { parse_mode: "HTML" });
        return;
      }

      const keep = text === "/skip";

      if (editPlState.step === "nameFA") {
        if (!keep) editPlState.nameFA = text;
        editPlState.step = "nameEN";
        const plan = await ProductPlanRepository.findById(editPlState.planId);
        await ctx.send(
          t("adminEditPlanPromptEN", { current: plan?.nameEN ?? "" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      if (editPlState.step === "nameEN") {
        if (!keep) editPlState.nameEN = text;
        editPlState.step = "nameRU";
        const plan = await ProductPlanRepository.findById(editPlState.planId);
        await ctx.send(
          t("adminEditPlanPromptRU", { current: plan?.nameRU ?? "" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      // step === "nameRU" — final step: persist changed fields and confirm.
      if (!keep) editPlState.nameRU = text;
      editPlanState.delete(userId);

      const update: { nameFA?: string; nameEN?: string; nameRU?: string } = {};
      if (editPlState.nameFA !== undefined) update.nameFA = editPlState.nameFA;
      if (editPlState.nameEN !== undefined) update.nameEN = editPlState.nameEN;
      if (editPlState.nameRU !== undefined) update.nameRU = editPlState.nameRU;

      let plan = await ProductPlanRepository.findById(editPlState.planId);
      if (!plan) {
        await ctx.send(t("planNotFound"), { parse_mode: "HTML" });
        return;
      }
      if (Object.keys(update).length > 0) {
        plan = await ProductPlanRepository.update(editPlState.planId, update);
      }

      await ctx.send(
        t("adminPlanUpdated", {
          name: getLocalizedName(plan, ctx.from?.languageCode),
        }),
        {
          parse_mode: "HTML",
          reply_markup: adminPanelPlanKeyboard(t, plan),
        },
      );
      return;
    }

    // ── EDIT PLAN DESCRIPTION FLOW (per language; /skip keep, /clear empty) ─
    if (planDescState) {
      if (text === "/cancel") {
        editPlanDescState.delete(userId);
        await ctx.send(t("adminEditPlanDescCancelled"), { parse_mode: "HTML" });
        return;
      }

      const apply = (): string | null | undefined =>
        text === "/skip" ? undefined : text === "/clear" ? null : text;

      if (planDescState.step === "nameFA") {
        planDescState.descFA = apply();
        planDescState.step = "nameEN";
        const plan = await ProductPlanRepository.findById(planDescState.planId);
        await ctx.send(
          t("adminEditPlanDescPromptEN", { current: plan?.descriptionEN ?? "-" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      if (planDescState.step === "nameEN") {
        planDescState.descEN = apply();
        planDescState.step = "nameRU";
        const plan = await ProductPlanRepository.findById(planDescState.planId);
        await ctx.send(
          t("adminEditPlanDescPromptRU", { current: plan?.descriptionRU ?? "-" }),
          { parse_mode: "HTML" },
        );
        return;
      }

      // step === "nameRU" — final step: persist changed fields and confirm.
      planDescState.descRU = apply();
      editPlanDescState.delete(userId);

      const update: {
        descriptionFA?: string | null;
        descriptionEN?: string | null;
        descriptionRU?: string | null;
      } = {};
      if (planDescState.descFA !== undefined)
        update.descriptionFA = planDescState.descFA;
      if (planDescState.descEN !== undefined)
        update.descriptionEN = planDescState.descEN;
      if (planDescState.descRU !== undefined)
        update.descriptionRU = planDescState.descRU;

      let plan = await ProductPlanRepository.findById(planDescState.planId);
      if (!plan) {
        await ctx.send(t("planNotFound"), { parse_mode: "HTML" });
        return;
      }
      if (Object.keys(update).length > 0) {
        plan = await ProductPlanRepository.update(planDescState.planId, update);
      }

      await ctx.send(t("adminPlanDescUpdated"), {
        parse_mode: "HTML",
        reply_markup: adminPanelPlanKeyboard(t, plan),
      });
      return;
    }

    // ── EDIT PLAN DURATION FLOW (e.g. "30 day", "6 month", "0" = one-time) ─
    if (planDurationId !== undefined) {
      if (text === "/cancel") {
        editPlanDurationState.delete(userId);
        await ctx.send(t("adminEditPlanCancelled"), { parse_mode: "HTML" });
        return;
      }

      const norm = normalizeDigits(text).trim().toLowerCase();

      if (norm === "0") {
        editPlanDurationState.delete(userId);
        const plan = await ProductPlanRepository.update(planDurationId, {
          duration: null,
          durationUnit: null,
        });
        await ctx.send(t("adminPlanDurationUpdated", { duration: t("oneTime") }), {
          parse_mode: "HTML",
          reply_markup: adminPanelPlanKeyboard(t, plan),
        });
        return;
      }

      const m = norm.match(/^(\d+)\s*(day|month|year|روز|ماه|سال)?$/);
      const num = m ? Number.parseInt(m[1]!, 10) : NaN;
      if (!m || !Number.isFinite(num) || num <= 0) {
        await ctx.send(t("adminPlanDurationInvalid"), { parse_mode: "HTML" });
        return;
      }
      let unit = m[2] ?? "day";
      if (unit === "روز") unit = "day";
      else if (unit === "ماه") unit = "month";
      else if (unit === "سال") unit = "year";

      editPlanDurationState.delete(userId);
      const plan = await ProductPlanRepository.update(planDurationId, {
        duration: num,
        durationUnit: unit,
      });
      const unitLabel =
        unit === "month"
          ? t("duration_month")
          : unit === "year"
            ? t("duration_year")
            : t("duration_day");
      await ctx.send(
        t("adminPlanDurationUpdated", { duration: `${num} ${unitLabel}` }),
        {
          parse_mode: "HTML",
          reply_markup: adminPanelPlanKeyboard(t, plan),
        },
      );
      return;
    }

    // ── ADD PLAN INPUT FIELD FLOW (text in 3 languages) ───────────────────
    if (addFieldState) {
      if (text === "/cancel") {
        addPlanFieldState.delete(userId);
        await ctx.send(t("adminPlanAddFieldCancelled"), { parse_mode: "HTML" });
        return;
      }

      if (addFieldState.step === "nameFA") {
        addFieldState.textFA = text;
        addFieldState.step = "nameEN";
        await ctx.send(t("adminPlanAddFieldPromptEN"), { parse_mode: "HTML" });
        return;
      }

      if (addFieldState.step === "nameEN") {
        addFieldState.textEN = text;
        addFieldState.step = "nameRU";
        await ctx.send(t("adminPlanAddFieldPromptRU"), { parse_mode: "HTML" });
        return;
      }

      // step === "nameRU" — final step: append the field and confirm.
      addFieldState.textRU = text;
      addPlanFieldState.delete(userId);

      let plan = await ProductPlanRepository.findById(addFieldState.planId);
      if (!plan) {
        await ctx.send(t("planNotFound"), { parse_mode: "HTML" });
        return;
      }

      const fields = [...(plan.requiredInputs ?? [])];
      const existingKeys = new Set(fields.map((f) => f.key));
      const textFA = addFieldState.textFA ?? "";
      const textEN = addFieldState.textEN ?? "";
      const textRU = addFieldState.textRU ?? "";

      fields.push({
        key: uniqueFieldKey(textEN || textFA || "field", existingKeys),
        textFA,
        textEN,
        textRU,
        inputType: "text",
        required: true,
        sensitive: false,
      });

      plan = await ProductPlanRepository.update(addFieldState.planId, {
        requiredInputs: fields,
      });

      await ctx.send(
        `${t("adminPlanFieldAdded")}\n\n${t("adminPlanRequirementsTitle")}`,
        {
          parse_mode: "HTML",
          reply_markup: adminPlanRequirementsKeyboard(t, plan),
        },
      );
      return;
    }

    // ── EDIT PLAN DISPLAY ORDER FLOW ──────────────────────────────────────
    if (planOrderId !== undefined) {
      if (text === "/cancel") {
        editPlanOrderState.delete(userId);
        await ctx.send(t("adminEditPlanCancelled"), { parse_mode: "HTML" });
        return;
      }

      const order = Number.parseInt(normalizeDigits(text).trim(), 10);
      if (!Number.isInteger(order) || order < 0) {
        await ctx.send(t("adminPlanOrderInvalid"), { parse_mode: "HTML" });
        return;
      }

      editPlanOrderState.delete(userId);
      const plan = await ProductPlanRepository.update(planOrderId, { order });
      await ctx.send(t("adminPlanOrderUpdated", { order }), {
        parse_mode: "HTML",
        reply_markup: adminPanelPlanKeyboard(t, plan),
      });
      return;
    }

    // ── ADD PLAN INVENTORY FLOW (one item per line → available stock) ─────
    if (addStockState) {
      if (text === "/cancel") {
        addPlanStockState.delete(userId);
        await ctx.send(t("adminPlanAddStockCancelled"), { parse_mode: "HTML" });
        return;
      }

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        await ctx.send(t("adminPlanAddStockEmpty"), { parse_mode: "HTML" });
        return;
      }

      const { planId, productId } = addStockState;
      addPlanStockState.delete(userId);

      const added = await InventoryRepository.bulkCreate(
        lines.map((content) => ({ productId, content })),
      );

      const plan = await ProductPlanRepository.findById(planId);
      if (!plan) {
        await ctx.send(t("planNotFound"), { parse_mode: "HTML" });
        return;
      }

      const counts = await InventoryRepository.statusCounts(productId);
      await ctx.send(t("adminPlanStockAdded", { count: added }), {
        parse_mode: "HTML",
        reply_markup: adminPlanInventoryKeyboard(t, plan, counts),
      });
      return;
    }

    // ── CREATE CATEGORY FLOW ──────────────────────────────────────────────
    if (!state) return next?.();

    if (text === "/cancel") {
      createCategoryState.delete(userId);
      await ctx.send(t("adminCreateCategoryCancelled"), { parse_mode: "HTML" });
      return;
    }

    if (state.step === "nameFA") {
      state.nameFA = text;
      state.step = "nameEN";
      await ctx.send(t("adminCreateCategoryPromptEN"), { parse_mode: "HTML" });
      return;
    }

    if (state.step === "nameEN") {
      state.nameEN = text;
      state.step = "nameRU";
      await ctx.send(t("adminCreateCategoryPromptRU"), { parse_mode: "HTML" });
      return;
    }

    // state.step === "nameRU" — final step: persist and confirm.
    state.nameRU = text;
    createCategoryState.delete(userId);

    const slug = await uniqueCategorySlug(slugify(state.nameEN ?? state.nameFA ?? "category"));

    await PremiumCategoryRepository.create({
      nameFA: state.nameFA!,
      nameEN: state.nameEN!,
      nameRU: state.nameRU!,
      slug,
    });

    const categories = await PremiumCategoryRepository.findAll();
    await ctx.send(t("adminCategoryCreated", { name: state.nameFA! }), {
      parse_mode: "HTML",
      reply_markup: adminPanelCategoriesKeyboard(
        t,
        categories,
        ctx.from?.languageCode ?? "fa",
      ),
    });
  });
}
