import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

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
    .text(t("btnPayWallet"), `confirm_inv_${planId}_${qty}`, {
      icon_custom_emoji_id: emojiIds.wallet,
      style: "success",
    })
    .row()
    .text(t("btnChangeQuantity"), `change_qty_${planId}`, {
      icon_custom_emoji_id: emojiIds.pencil,
    })
    .row()
    .text(t("btnCancel"), `cancel_order`);
}
