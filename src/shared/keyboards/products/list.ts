import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Product } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../utils/customEmoji.ts";
import { getLocalizedName } from "../../utils/localizedFields.ts";

export function productsListKeyboard(
  t: TFunction,
  products: Product[],
  categoryId: number,
  languageCode = "fa",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (products.length === 0) {
    keyboard.text(t("btnBack"), `categories`, {
      icon_custom_emoji_id: emojiIds.back,
    });
    return keyboard;
  }

  products.forEach((product) => {
    console.log("product : ", product);
    const inStock = (product.stock || 0) > 0;
    const safeEmojiId = normalizeCustomEmojiId(product.customEmojiId);
    const opts: { style: "success" | "danger"; icon_custom_emoji_id?: string } =
      {
        style: inStock ? "success" : "danger",
        icon_custom_emoji_id: safeEmojiId,
      };
    keyboard.text(
      getLocalizedName(product, languageCode),
      `product_${product.id}`,
      opts,
    );
    keyboard.row();
  });

  keyboard.text(t("btnBack"), `categories`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}
