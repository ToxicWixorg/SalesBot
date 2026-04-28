import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * Generate back button keyboard
 */
export function backKeyboard(
  t: TFunction,
  callbackData = "back",
): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), callbackData);
}

/**
 * Generate cancel button keyboard
 */
export function cancelKeyboard(
  t: TFunction,
  callbackData = "cancel",
): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), callbackData);
}

/**
 * Generate back to main menu keyboard
 */
export function backToMainKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnMainMenu"), "main_menu");
}
