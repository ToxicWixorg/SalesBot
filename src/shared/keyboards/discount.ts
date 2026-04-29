import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

export function discountMainKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnEnterDiscountCode"), "enter_discount_code")
    .row()
    .text(t("btnDiscountHistory"), "discount_history")
    .row()
    .text(t("btnBack"), "main_menu");
}

export function discountEnterKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), "discount");
}

export function discountValidKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "discount");
}

export function discountInvalidKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnTryAgain"), "enter_discount_code")
    .row()
    .text(t("btnBack"), "discount");
}

export function discountHistoryKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "discount");
}
