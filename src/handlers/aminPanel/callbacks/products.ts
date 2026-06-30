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
import {
  adminPanelCategoriesKeyboard,
  adminPanelCategoryKeyboard,
  adminPanelProductsListKeyboard,
  adminPanelProductDetailsKeyboard,
  adminPanelProductPlansKeyboard,
  adminPanelPlanKeyboard,
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
    reply_markup: adminPanelPlanKeyboard(t, planId, plan.productId),
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
  const t = await getT(context);
  if (!t) return;
  await replyNotImplemented(context, t);
}

export async function adminCreatePlanCallback(context: any) {
  const t = await getT(context);
  if (!t) return;
  await replyNotImplemented(context, t);
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
  const t = await getT(context);
  if (!t) return;
  await replyNotImplemented(context, t);
}

export async function adminEditPlanCallback(context: any) {
  const t = await getT(context);
  if (!t) return;
  await replyNotImplemented(context, t);
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

  await ProductRepository.update(productId, { isActive: false });

  await context.editText(
    `${t("adminProductDeleted")}\n\n` +
      `<b>${getLocalizedName(product, context.from.languageCode)}</b>`,
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

  await ProductPlanRepository.update(planId, { isActive: false });

  await context.editText(
    `${t("adminPlanDeleted")}\n\n` +
      `<b>${getLocalizedName(plan, context.from.languageCode)}</b>`,
    {
      parse_mode: "HTML",
      reply_markup: adminPanelPlanKeyboard(t, planId, plan.productId),
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
    reply_markup: adminPanelPlanKeyboard(t, planId, plan.productId),
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
        reply_markup: adminPanelPlanKeyboard(t, planId, plan.productId),
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
    if (!state && !editState) return next?.();

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

    // ── CREATE FLOW ───────────────────────────────────────────────────────
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
