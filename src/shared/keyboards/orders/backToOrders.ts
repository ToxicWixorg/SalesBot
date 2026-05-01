import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function backToOrdersKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnBackToOrders"), "back_to_orders")
    .row()
    .text(t("btnMainMenu"), "main_menu");
}
