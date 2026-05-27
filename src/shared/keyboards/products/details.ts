import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Product } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function productDetailsKeyboard(
  t: TFunction,
  product: Product,
  hasStock: boolean,
): InlineKeyboard {
  if (hasStock) {
    return 
  }
  const keyboard = new InlineKeyboard();

  if (hasStock) {
    keyboard.text(t("btnBuyProduct"), `buy_product_${product.id}`, {
      icon_custom_emoji_id: emojiIds.trolley,
      style: "success",
    });
    keyboard.row();
  }

  keyboard.text(t("btnBack"), `category_${product.categoryId}`);

  return keyboard;
}
