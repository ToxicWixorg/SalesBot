import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Product } from "../../../db/schema.ts";

export function productsListKeyboard(
  t: TFunction,
  products: Product[],
  categoryId: number,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (products.length === 0) {
    keyboard.text(t("btnBack"), `categories`);
    return keyboard;
  }

  products.forEach((product) => {
    const stockIcon = (product.stock || 0) > 0 ? "✅" : "❌";
    keyboard.text(`${stockIcon} ${product.name}`, `product_${product.id}`);
    keyboard.row();
  });

  keyboard.text(t("btnBack"), `categories`);

  return keyboard;
}
