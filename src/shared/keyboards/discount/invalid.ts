import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function discountInvalidKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnTryAgain"), "enter_discount_code")
    .row()
    .text(t("btnBack"), "discount");
}
