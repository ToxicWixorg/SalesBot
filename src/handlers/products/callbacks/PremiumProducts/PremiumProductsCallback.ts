import { Context } from "gramio";
import { UserRepository } from "../../../../repositories/UserRepository.ts";
import { i18n } from "../../../../shared/locales/index.ts";
import { getBotSettings } from "../../../../plugins/base.ts";
import { PremiumCategoryRepository } from "../../../../repositories/ProductRepository.ts";
import {
  backToMainKeyboard,
  premiumCategoriesKeyboard,
} from "../../../../shared/keyboards/index.ts";

export async function PremiumProductsCallback(context: Context) {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const settings = await getBotSettings();
  if (!settings.shopEnabled) {
    await context.send(t("shopDisabled"), { parse_mode: "HTML" });
    await context.message?.delete();
    return;
  }

  const categories = await PremiumCategoryRepository.findAll();
  if (categories.length === 0) {
    await context.send(t("noProducts"), {
      reply_markup: backToMainKeyboard(t),
      parse_mode: "HTML",
    });
    await context.message?.delete();
    return;
  }

  await context.send(t("selectCategory"), {
    parse_mode: "HTML",
    reply_markup: premiumCategoriesKeyboard(t, categories, user.languageCode),
  });
  await context.message?.delete();
}
