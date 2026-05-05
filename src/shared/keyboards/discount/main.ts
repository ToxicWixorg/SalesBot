import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function discountMainKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnEnterDiscountCode"), "enter_discount_code", {
      icon_custom_emoji_id: emojiIds.pencil,
    })
    .row()
    .text(t("btnDiscountHistory"), "discount_history", {
      icon_custom_emoji_id: emojiIds.chart,
    })
    .row()
    .text(t("btnBack"), "main_menu", { icon_custom_emoji_id: emojiIds.back });
}
