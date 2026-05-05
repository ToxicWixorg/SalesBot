import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function discountHistoryKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "discount", {
    icon_custom_emoji_id: emojiIds.back,
  });
}
