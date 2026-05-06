import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Product } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function productDetailsKeyboard(
  t: TFunction,
  product: Product,
  hasStock: boolean,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (hasStock) {
    keyboard.text(t("btnBuyProduct"), `buy_product_${product.id}`);
    keyboard.row();
  } else {
    keyboard
      .text(t("btnNotifyStock"), `notify_stock_${product.id}`)
      .row();
  }

  keyboard.text(t("btnBack"), `category_${product.categoryId}`);

  return keyboard;
}
