import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { DiscountCodeRepository } from "../../../repositories/DiscountCodeRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { discountMainKeyboard } from "../../../shared/keyboards/index.ts";

export async function DiscountCallback(context: Context) {
  if (!context.from) {
    return context.answerCallbackQuery({
      text: "❌ Unable to identify user.",
      show_alert: true,
    });
  }

  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) {
    return context.answerCallbackQuery({
      text: "❌ User not found.",
      show_alert: true,
    });
  }

  const t = i18n.buildT(user.languageCode || "en");

  const usageHistory = await DiscountCodeRepository.getUserUsageHistory(userId);

  const message = t("discountCodeInfo");

  await context.answerCallbackQuery();

  return context.editText(message, {
    reply_markup: discountMainKeyboard(t),
    parse_mode: "HTML",
  });
}
