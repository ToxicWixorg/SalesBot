import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function settingsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnAccountInfo"), "settings:account_info", {
      icon_custom_emoji_id: undefined, //emojiIds.person,
    })
    .row()
    .text(t("btnChangeLanguage"), "change_language", {
      icon_custom_emoji_id: undefined, //emojiIds.earth,
    })
    .row()
    .text(t("btnNotificationSettings"), "settings:notifications", {
      icon_custom_emoji_id: undefined, //emojiIds.bell,
    })
    .row()
    .text(t("btnPrivacy"), "settings:privacy", {
      icon_custom_emoji_id: undefined, //emojiIds.lock,
    })
    .row()
    .text(t("btnAbout"), "settings:about", {
      icon_custom_emoji_id: undefined, //emojiIds.info,
    })
    .row()
    .text(t("btnMainMenu"), "main_menu", {
      icon_custom_emoji_id: undefined, //emojiIds.home,
    });
}
