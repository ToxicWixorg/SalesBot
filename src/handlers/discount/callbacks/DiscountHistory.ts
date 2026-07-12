import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { DiscountCodeRepository } from "../../../repositories/DiscountCodeRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { discountHistoryKeyboard } from "../../../shared/keyboards/index.ts";
import { formatUsd } from "../../../shared/utils/currency.ts";

export async function DiscountHistoryCallback(context: Context) {
  if (!context.from) {
    return context.answerCallbackQuery({
      text: i18n.buildT("en")("userIdentificationError"),
      show_alert: true,
    });
  }

  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode || "fa");

  if (!user) {
    return context.answerCallbackQuery({
      text: t("userNotFound"),
      show_alert: true,
    });
  }

  // دریافت تاریخچه استفاده
  const usageHistory = await DiscountCodeRepository.getUserUsageHistory(userId);

  if (usageHistory.length === 0) {
    await context.answerCallbackQuery({
      text: t("noDiscountHistory"),
      show_alert: true,
    });
    return;
  }

  let message = t("discountHistoryTitle") + "\n\n";

  for (let i = 0; i < usageHistory.length && i < 10; i++) {
    const usage = usageHistory[i];
    const date = new Date(usage.usedAt!).toLocaleDateString("fa-IR");
    const amount = formatUsd(usage.discountAmount);

    message += `${i + 1}. ${date}\n`;
    message += `   💰 ${t("discountAmount")}: ${amount}\n`;
    message += `   📦 ${t("orderId")}: #${usage.orderId}\n\n`;
  }

  if (usageHistory.length > 10) {
    message += `\n${t("andMore", usageHistory.length - 10)}`;
  }

  await context.answerCallbackQuery();

  return context.editText(message, {
    reply_markup: discountHistoryKeyboard(t),
    parse_mode: "HTML",
  });
}
