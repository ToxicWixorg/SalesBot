import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { DiscountCodeRepository } from "../repositories/DiscountCodeRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { InlineKeyboard } from "gramio";

export const discountComposer = new Composer()
  .extend(composer)
  .callbackQuery("discount", async (context) => {
    console.log("[DISCOUNT] Callback received from user:", context.from?.id);

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

    const usageHistory =
      await DiscountCodeRepository.getUserUsageHistory(userId);

    const message = t("discountCodeInfo");

    const keyboard = new InlineKeyboard()
      .text(t("btnEnterDiscountCode"), "enter_discount_code")
      .row()
      .text(t("btnDiscountHistory"), "discount_history")
      .row()
      .text(t("btnBack"), "main_menu");

    await context.answerCallbackQuery();

    return context.editText(message, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  })
  .callbackQuery("enter_discount_code", async (context) => {
    console.log("[DISCOUNT] Enter code callback");

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

    if (context.scene) {
      const { enterDiscountCodeScene } =
        await import("../scenes/enter-discount-code.ts");
      await context.scene.enter(enterDiscountCodeScene);
    }

    const keyboard = new InlineKeyboard().text(t("btnCancel"), "discount");

    return context.editText(t("enterDiscountCodePrompt"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  })
  .callbackQuery("discount_history", async (context) => {
    console.log("[DISCOUNT] History callback");

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

    const keyboard = new InlineKeyboard().text(t("btnBack"), "discount");

    await context.answerCallbackQuery();

    return context.editText(message, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  });
