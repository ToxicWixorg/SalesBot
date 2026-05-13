import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  CategoryRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { productsListKeyboard } from "../../../shared/keyboards/index.ts";
import { normalizeCustomEmojiId } from "../../../shared/utils/customEmoji.ts";
import { getLocalizedName } from "../../../shared/utils/localizedFields.ts";

export async function CategoryCallback(context: Context<any>) {
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
  const categoryName = getLocalizedName(category, user.languageCode);

  const message =
    products.length === 0
      ? `${t("categoryProducts", categoryName, normalizeCustomEmojiId(category.customEmojiId) ?? null)}\n\n${t("noProducts")}`
      : t(
          "categoryProducts",
          categoryName,
          normalizeCustomEmojiId(category.customEmojiId) ?? null,
        );

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: productsListKeyboard(
      t,
      products,
      categoryId,
      user.languageCode,
    ),
  });
}
