import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function ordersListKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnOrdersFilterActive"), "orders_filter_active")
    .text(t("btnOrdersFilterCompleted"), "orders_filter_completed")
    .row()
    .text(t("btnOrdersFilterAll"), "orders_filter_all")
    .row()
    .text(t("btnBack"), "main_menu");
}
