import { Scene } from "@gramio/scenes";
import { InlineKeyboard } from "gramio";
import { baseComposer } from "../plugins/base.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { e, emojiIds } from "../shared/locales/emojies.ts";

export const languageSelectionScene = new Scene("language_selection")
  .extend(baseComposer)
  .step(["message", "callback_query"], async (context) => {
    if (
      !context.scene.step.firstTime &&
      context.is("message") &&
      context.text?.startsWith("/")
    ) {
      await context.scene.exit();
      return;
    }

    if (context.scene.step.firstTime) {
      const keyboard = new InlineKeyboard()
        .text("English", "lang_en", {
          icon_custom_emoji_id: emojiIds.flag_en,
        })
        .text("فارسی", "lang_fa", {
          icon_custom_emoji_id: emojiIds.flag_ir,
        })
        .row()
        .text("Русский", "lang_ru", {
          icon_custom_emoji_id: emojiIds.flag_ru,
        });

      return context.send(
        `${e.earth} Please select your language :\n` +
          `${e.earth} لطفاً زبان خود را انتخاب کنید :\n` +
          `${e.earth} Пожалуйста, выберите ваш язык :\n`,
        {
          reply_markup: keyboard,
          parse_mode: "HTML",
        },
      );
    }

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
    await context.editText(t("welcome", userName), { parse_mode: "HTML" });

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

    await context.send(t("main_menu", userName), {
      reply_markup: mainMenuKeyboard,
      parse_mode: "HTML",
    });

    return context.scene.exit();
  });
