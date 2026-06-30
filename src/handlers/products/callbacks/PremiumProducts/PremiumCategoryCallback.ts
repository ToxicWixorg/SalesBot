import { Context } from "gramio";
import { UserRepository } from "../../../../repositories/UserRepository.ts";
import { i18n } from "../../../../shared/locales/index.ts";
import {
  PremiumCategoryRepository,
  ProductRepository,
} from "../../../../repositories/ProductRepository.ts";
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
    ),
  });
}
