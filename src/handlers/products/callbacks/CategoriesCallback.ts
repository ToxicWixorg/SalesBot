import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { getBotSettings } from "../../../plugins/base.ts";
import { CategoryRepository } from "../../../repositories/index.ts";
import { categoriesKeyboard } from "../../../shared/keyboards/index.ts";

export async function CategoriesCallback(context: Context) {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const settings = await getBotSettings();
  if (!settings.shopEnabled) {
    await context.editText(t("shopDisabled"), { parse_mode: "HTML" });
    return;
  }

  const categories = await CategoryRepository.findAll();
  if (categories.length === 0) {
    await context.editText(t("noProducts"), { parse_mode: "HTML" });
    return;
  }

  await context.editText(t("selectCategory"), {
    parse_mode: "HTML",
    reply_markup: categoriesKeyboard(t, categories, user.languageCode),
  });
}
