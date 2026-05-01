import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { CategoryRepository } from "../../../repositories/ProductRepository.ts";
import { categoriesKeyboard } from "../../../shared/keyboards/index.ts";

export async function CategoriesCallback(context: Context) {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");
  const categories = await CategoryRepository.findAll();

  await context.editText(t("selectCategory"), {
    reply_markup: categoriesKeyboard(t, categories),
  });
}
