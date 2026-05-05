import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function discountInvalidKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnTryAgain"), "enter_discount_code", {
      icon_custom_emoji_id: emojiIds.refresh,
    })
    .row()
    .text(t("btnBack"), "discount", { icon_custom_emoji_id: emojiIds.back });
}
