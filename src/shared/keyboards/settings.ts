import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * Generate settings keyboard
 */
export function settingsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnChangeLanguage"), "change_language")
    .row()
    .text(t("btnNotifications"), "notifications")
    .row()
    .text(t("btnMainMenu"), "main_menu");
}
