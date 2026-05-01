import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function settingsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnAccountInfo"), "settings:account_info")
    .row()
    .text(t("btnChangeLanguage"), "change_language")
    .row()
    .text(t("btnNotificationSettings"), "settings:notifications")
    .row()
    .text(t("btnPrivacy"), "settings:privacy")
    .row()
    .text(t("btnAbout"), "settings:about")
    .row()
    .text(t("btnMainMenu"), "main_menu");
}
