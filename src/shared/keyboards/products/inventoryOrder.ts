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
  allowChangeQuantity = true,
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text(t("btnPayWallet"), `confirm_inv_${planId}_${qty}`, {
      icon_custom_emoji_id: emojiIds.wallet,
      style: "success",
    })
    .row();

  // Ready/automatic products are sold one at a time — no quantity to change.
  if (allowChangeQuantity) {
    keyboard
      .text(t("btnChangeQuantity"), `change_qty_${planId}`, {
        icon_custom_emoji_id: emojiIds.pencil,
      })
      .row();
  }

  keyboard.text(t("btnCancel"), `cancel_order`);
  return keyboard;
}
