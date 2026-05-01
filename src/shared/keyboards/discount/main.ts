import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function discountMainKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnEnterDiscountCode"), "enter_discount_code")
    .row()
    .text(t("btnDiscountHistory"), "discount_history")
    .row()
    .text(t("btnBack"), "main_menu");
}
