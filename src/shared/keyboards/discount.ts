import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * کیبورد اصلی بخش کد تخفیف
 */
export function discountMainKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnEnterDiscountCode"), "enter_discount_code")
    .row()
    .text(t("btnDiscountHistory"), "discount_history")
    .row()
    .text(t("btnBack"), "main_menu");
}

/**
 * کیبورد برای صفحه ورود کد تخفیف
 */
export function enterDiscountCodeKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), "discount");
}

/**
 * کیبورد تاریخچه استفاده از کدهای تخفیف
 */
export function discountHistoryBackKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "discount");
}

/**
 * کیبورد تلاش مجدد برای ورود کد نامعتبر
 */
export function discountRetryKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnTryAgain"), "enter_discount_code")
    .row()
    .text(t("btnBack"), "discount");
}

/**
 * کیبورد بازگشت از کد معتبر
 */
export function discountValidBackKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "discount");
}
