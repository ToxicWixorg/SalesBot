import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Product } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../utils/customEmoji.ts";
import { getLocalizedName } from "../../utils/localizedFields.ts";

const PRODUCTS_PER_PAGE = 10;

export function premiumProductsListKeyboard(
  t: TFunction,
  products: Product[],
  categoryId: number,
  languageCode = "fa",
  page: number = 1,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (products.length === 0) {
    keyboard.text(t("btnBack"), `categories`, {
      icon_custom_emoji_id: emojiIds.back,
    });
    return keyboard;
  }

  // Calculate pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIdx = (page - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const pageProducts = products.slice(startIdx, endIdx);

  // Display products for current page
  pageProducts.forEach((product) => {
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
      `premium_product_${product.id}`,
      opts,
    );
    keyboard.row();
  });

  // Pagination controls
  if (totalPages > 1) {
    if (page > 1) {
      keyboard.text(
        t("previous"),
        `premium_category_page_${categoryId}_${page - 1}`,
      );
    }

    keyboard.text(`${page}/${totalPages}`, `noop`);

    if (page < totalPages) {
      keyboard.text(
        t("next"),
        `premium_category_page_${categoryId}_${page + 1}`,
      );
    }

    keyboard.row();
  }

  keyboard.text(t("btnBack"), `premiumProducts`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}
