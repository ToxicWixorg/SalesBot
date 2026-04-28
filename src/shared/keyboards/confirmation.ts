import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * Generate confirmation keyboard (Yes/No)
 */
export function confirmationKeyboard(
  t: TFunction,
  yesCallback = "confirm_yes",
  noCallback = "confirm_no",
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnYes"), yesCallback)
    .text(t("btnNo"), noCallback);
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
    .text(t("btnConfirm"), confirmCallback)
    .row()
    .text(t("btnCancel"), cancelCallback);
}
