import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

/** Keyboard shown while asking the user to enter a quantity */
export function enterQuantityKeyboard(
  t: TFunction,
  productId: number,
): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), `cancel_order`);
}

/**
 * Keyboard shown on the order summary screen (after quantity entered).
 * confirm_inv_{planId}_{qty}
 */
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
