import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function ordersListKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnOrdersFilterActive"), "orders_filter_active", {
      icon_custom_emoji_id: emojiIds.activeOrder,
    })
    .text(t("btnOrdersFilterCompleted"), "orders_filter_completed", {
      icon_custom_emoji_id: emojiIds.completeOrder,
    })
    .row()
    .text(t("btnOrdersFilterAll"), "orders_filter_all", {
      icon_custom_emoji_id: emojiIds.clipboard,
    })
    .row()
    .text(t("btnBack"), "main_menu", { icon_custom_emoji_id: emojiIds.back });
}
