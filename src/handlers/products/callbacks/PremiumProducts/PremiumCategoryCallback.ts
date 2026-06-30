import { Context } from "gramio";
import { UserRepository } from "../../../../repositories/UserRepository.ts";
import { i18n } from "../../../../shared/locales/index.ts";
import {
  PremiumCategoryRepository,
  ProductRepository,
  ProductPlanRepository,
} from "../../../../repositories/ProductRepository.ts";
import { InventoryRepository } from "../../../../repositories/InventoryRepository.ts";
import { normalizeCustomEmojiId } from "../../../../shared/utils/customEmoji.ts";
import {
  getLocalizedDescription,
  getLocalizedName,
} from "../../../../shared/utils/localizedFields.ts";
import { premiumProductsListKeyboard } from "../../../../shared/keyboards/products/list.ts";

export async function PremiumCategoryCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const categoryId = Number.parseInt(context.queryData[1]!);
  const page = context.queryData[2]
    ? Number.parseInt(context.queryData[2]!)
    : 1;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const category = await PremiumCategoryRepository.findById(categoryId);
  if (!category) {
    await context.answerCallbackQuery({
      text: t("categoryNotFound"),
      show_alert: true,
    });
    return;
  }

  const products = await ProductRepository.findByCategory(categoryId);

  // A product is "available" if it has at least one active plan that is either
  // non-automatic (manual/scheduled — no inventory needed) or automatic with
  // available inventory. Computed with two batched queries.
  const productIds = products.map((p) => p.id);
  const [plans, inventoryCounts] = await Promise.all([
    ProductPlanRepository.findActiveByProductIds(productIds),
    InventoryRepository.countAvailableByProductIds(productIds),
  ]);
  const availableIds = new Set<number>();
  for (const plan of plans) {
    if (availableIds.has(plan.productId)) continue;
    const purchasable =
      plan.deliveryType !== "automatic" ||
      (inventoryCounts.get(plan.productId) ?? 0) > 0;
    if (purchasable) availableIds.add(plan.productId);
  }

  const categoryName = getLocalizedName(category, user.languageCode);
  const categoryDescription = getLocalizedDescription(
    category,
    user.languageCode,
  );

  const message =
    `${t("categoryProducts", categoryName, normalizeCustomEmojiId(category.customEmojiId) ?? null)}\n\n` +
    `${categoryDescription}\n\n` +
    (products.length === 0 ? t("noProducts") : t("selectProduct"));

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: premiumProductsListKeyboard(
      t,
      products,
      categoryId,
      user.languageCode,
      page,
      availableIds,
    ),
  });
}
