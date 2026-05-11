import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function backToOrdersKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnBackToOrders"), "back_to_orders", {
      icon_custom_emoji_id: emojiIds.back,
    })
    .row()
    .text(t("btnMainMenu"), "main_menu", {
      icon_custom_emoji_id: emojiIds.home,
    });
}
