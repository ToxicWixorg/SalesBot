import { Scene } from "@gramio/scenes";
import { InlineKeyboard } from "gramio";
import { baseComposer } from "../plugins/base.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { i18n } from "../shared/locales/index.ts";

export const languageSelectionScene = new Scene("language_selection")
  .extend(baseComposer)
  .step("message", async (context) => {
    if (context.scene.step.firstTime) {
      // نمایش انتخاب زبان
      const keyboard = new InlineKeyboard()
        .text("🇬🇧 English", "lang_en")
        .text("🇮🇷 فارسی", "lang_fa")
        .row()
        .text("🇷🇺 Русский", "lang_ru");

      return context.send(
        "🌍 Please select your language:\n🌍 لطفاً زبان خود را انتخاب کنید:\n🌍 Пожалуйста, выберите ваш язык:",
        {
          reply_markup: keyboard,
        },
      );
    }
  })
  .step("callback_query", async (context) => {
    const data = context.data;

    if (!data || !data.startsWith("lang_")) {
      return;
    }

    // استخراج کد زبان
    const langCode = data.replace("lang_", "");

    // بررسی اعتبار زبان
    if (!["en", "fa", "ru"].includes(langCode)) {
      return context.answer({
        text: "Invalid language selected",
        show_alert: true,
      });
    }

    // ذخیره زبان در دیتابیس
    if (context.from?.id) {
      await UserRepository.update(context.from.id, {
        languageCode: langCode,
      });
    }

    // ساخت تابع ترجمه با زبان انتخاب شده
    const t = i18n.buildT(langCode);

    // پاسخ به callback query
    await context.answer();

    // ارسال پیام خوش‌آمد
    const userName = context.from?.firstName || "User";
    await context.editText(t("welcome", userName));

    // نمایش منوی اصلی
    const mainMenuKeyboard = new InlineKeyboard()
      .text(t("btnProducts"), "products")
      .text(t("btnMyOrders"), "my_orders")
      .row()
      .text(t("btnWallet"), "wallet")
      .text(t("btnInviteFriends"), "invite")
      .row()
      .text(t("btnDiscountCode"), "discount")
      .text(t("btnSupport"), "support")
      .row()
      .text(t("btnSettings"), "settings");

    await context.send(t("mainMenu") + "\n\n" + t("chooseAction"), {
      reply_markup: mainMenuKeyboard,
    });

    // خروج از scene
    return context.scene.exit();
  });
