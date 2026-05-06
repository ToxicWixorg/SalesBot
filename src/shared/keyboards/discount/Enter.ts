import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function discountEnterKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), "discount", {
    icon_custom_emoji_id: null, //emojiIds.cross,
  });
}
