import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function orderConfirmationKeyboard(
  t: TFunction,
  planId: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnConfirmOrder"), `confirm_order_${planId}`)
    .row()
    .text(t("btnAddDiscountCode"), `add_discount_${planId}`)
    .row()
    .text(t("btnCancel"), `cancel_order`);
}
