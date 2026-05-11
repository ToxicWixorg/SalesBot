import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function orderConfirmationKeyboard(
  t: TFunction,
  planId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnConfirmOrder"), `confirm_order_${planId}`, {
      icon_custom_emoji_id: emojiIds.checkBold,
    })
    .row()
    .text(t("btnAddDiscountCode"), `add_discount_${planId}`, {
      icon_custom_emoji_id: emojiIds.ticket,
    })
    .row()
    .text(t("btnCancel"), `cancel_order`, {
      icon_custom_emoji_id: emojiIds.cross,
    });
}
