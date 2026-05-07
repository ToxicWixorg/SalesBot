import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function enterQuantityKeyboard(
  t: TFunction,
  productId: number,
): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), `cancel_order`);
}

export function inventoryOrderSummaryKeyboard(
  t: TFunction,
  planId: number,
  qty: number,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnPayWallet"), `confirm_inv_${planId}_${qty}`)
    .row()
    .text(t("btnChangeQuantity"), `change_qty_${planId}`)
    .row()
    .text(t("btnCancel"), `cancel_order`);
}
