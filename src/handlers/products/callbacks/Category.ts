import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  CategoryRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { productsListKeyboard } from "../../../shared/keyboards/index.ts";

export async function CategoryCallBack(context: Context) {
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
    parse_mode: "HTML",
  });
}
