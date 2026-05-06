import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function settingsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnAccountInfo"), "settings:account_info", {
      icon_custom_emoji_id: null, //emojiIds.person,
    })
    .row()
    .text(t("btnChangeLanguage"), "change_language", {
      icon_custom_emoji_id: null, //emojiIds.earth,
    })
    .row()
    .text(t("btnNotificationSettings"), "settings:notifications", {
      icon_custom_emoji_id: null, //emojiIds.bell,
    })
    .row()
    .text(t("btnPrivacy"), "settings:privacy", {
      icon_custom_emoji_id: null, //emojiIds.lock,
    })
    .row()
    .text(t("btnAbout"), "settings:about", {
      icon_custom_emoji_id: null, //emojiIds.info,
    })
    .row()
    .text(t("btnMainMenu"), "main_menu", {
      icon_custom_emoji_id: null, //emojiIds.home,
    });
}
