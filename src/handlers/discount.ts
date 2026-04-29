import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { DiscountCodeRepository } from "../repositories/DiscountCodeRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import {
  discountMainKeyboard,
  discountEnterKeyboard,
  discountHistoryKeyboard,
} from "../shared/keyboards/index.ts";

export const discountComposer = new Composer()
  .extend(composer)
  .callbackQuery("discount", async (context) => {
    // console.log("[DISCOUNT] Callback received from user:", context.from?.id);

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

    // دریافت تاریخچه استفاده از کدهای تخفیف
    const usageHistory =
      await DiscountCodeRepository.getUserUsageHistory(userId);

    const message = t("discountCodeInfo");
    const keyboard = discountMainKeyboard(t);

    await context.answerCallbackQuery();

    return context.editText(message, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  })
  .callbackQuery("enter_discount_code", async (context) => {
    // console.log("[DISCOUNT] Enter code callback");

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

    await context.answerCallbackQuery();

    // ذخیره state برای دریافت کد تخفیف
    if (context.scene) {
      const { enterDiscountCodeScene } =
        await import("../scenes/enter-discount-code.ts");
      await context.scene.enter(enterDiscountCodeScene);
    }

    const keyboard = discountEnterKeyboard(t);

    return context.editText(t("enterDiscountCodePrompt"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  })
  .callbackQuery("discount_history", async (context) => {
    // console.log("[DISCOUNT] History callback");

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

    const t = i18n.buildT(user.languageCode || "fa");

    // دریافت تاریخچه استفاده
    const usageHistory =
      await DiscountCodeRepository.getUserUsageHistory(userId);

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
      const amount = Number(usage.discountAmount).toLocaleString("fa-IR");

      message += `${i + 1}. ${date}\n`;
      message += `   💰 ${t("discountAmount")}: ${amount} ${t("currency")}\n`;
      message += `   📦 ${t("orderId")}: #${usage.orderId}\n\n`;
    }

    if (usageHistory.length > 10) {
      message += `\n${t("andMore", usageHistory.length - 10)}`;
    }

    const keyboard = discountHistoryKeyboard(t);

    await context.answerCallbackQuery();

    return context.editText(message, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  });
