import { Scene } from "@gramio/scenes";
import { InlineKeyboard } from "gramio";
import { baseComposer } from "../plugins/base.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { i18n } from "../shared/locales/index.ts";

export const languageSelectionScene = new Scene("language_selection")
  .extend(baseComposer)
  .step(["message", "callback_query"], async (context) => {
    console.log(
      "[LANGUAGE_SCENE] Step triggered, firstTime:",
      context.scene.step.firstTime,
    );

    // If user sends a command while in scene (but not on first entry), exit and let command handlers process it
    if (
      !context.scene.step.firstTime &&
      context.is("message") &&
      context.text?.startsWith("/")
    ) {
      console.log("[LANGUAGE_SCENE] Command detected while in scene, exiting");
      await context.scene.exit();
      return;
    }

    if (context.scene.step.firstTime) {
      const keyboard = new InlineKeyboard()
        .text("🇬🇧 English", "lang_en")
        .text("🇮🇷 فارسی", "lang_fa")
        .row()
        .text("🇷🇺 Русский", "lang_ru");

      console.log("[LANGUAGE_SCENE] Sending language selection keyboard");
      return context.send(
        "🌍 Please select your language:\n🌍 لطفاً زبان خود را انتخاب کنید:\n🌍 Пожалуйста, выберите ваш язык:",
        {
          reply_markup: keyboard,
        },
      );
    }

    // اگر callback_query نیست، بازگشت
    if (!context.is("callback_query")) {
      return;
    }
    const data = context.data;

    if (!data || !data.startsWith("lang_")) {
      return;
    }

    const langCode = data.replace("lang_", "");

    if (!["en", "fa", "ru"].includes(langCode)) {
      return context.answer({
        text: "Invalid language selected",
        show_alert: true,
      });
    }

    if (context.from?.id) {
      await UserRepository.update(context.from.id, {
        languageCode: langCode,
      });
    }

    const t = i18n.buildT(langCode);

    await context.answer();

    const userName = context.from?.firstName || "User";
    await context.editText(t("welcome", userName));

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

    return context.scene.exit();
  });
