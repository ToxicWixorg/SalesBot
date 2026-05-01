import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function settingsConfirmationKeyboard(
  t: TFunction,
  action: string,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnYes"), `settings:confirm:${action}`)
    .text(t("btnNo"), "settings");
}
