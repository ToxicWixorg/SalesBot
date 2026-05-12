import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";
import { emojiIds } from "../locales/emojies.ts";

/**
 * Generate confirmation keyboard (Yes/No)
 */
export function confirmationKeyboard(
  t: TFunction,
  yesCallback = "confirm_yes",
  noCallback = "confirm_no",
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnYes"), yesCallback, {
      icon_custom_emoji_id: emojiIds.checkBold,
    })
    .text(t("btnNo"), noCallback, { icon_custom_emoji_id: emojiIds.reject });
}

/**
 * Generate confirmation with cancel keyboard
 */
export function confirmWithCancelKeyboard(
  t: TFunction,
  confirmCallback = "confirm",
  cancelCallback = "cancel",
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnConfirm"), confirmCallback, {
      icon_custom_emoji_id: emojiIds.checkBold,
    })
    .row()
    .text(t("btnCancel"), cancelCallback, {
      icon_custom_emoji_id: emojiIds.cross,
    });
}
