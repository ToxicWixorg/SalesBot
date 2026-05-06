import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";
import { emojiIds } from "../locales/emojies.ts";

/**
 * Generate back button keyboard
 */
export function backKeyboard(
  t: TFunction,
  callbackData = "back",
): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), callbackData, {
    icon_custom_emoji_id: undefined, //emojiIds.back,
  });
}

/**
 * Generate cancel button keyboard
 */
export function cancelKeyboard(
  t: TFunction,
  callbackData = "cancel",
): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), callbackData, {
    icon_custom_emoji_id: undefined, //emojiIds.cross,
  });
}

/**
 * Generate back to main menu keyboard
 */
export function backToMainKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnMainMenu"), "main_menu", {
    icon_custom_emoji_id: undefined, //emojiIds.home,
  });
}
