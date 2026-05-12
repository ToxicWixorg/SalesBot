import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Category } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function categoriesKeyboard(
  t: TFunction,
  categories: Category[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  categories.reverse().forEach((category, index) => {
    if (category.isActive === false) return;
    const icon = category.icon || "";
    const opts = category.customEmojiId
      ? { icon_custom_emoji_id: category.customEmojiId }
      : undefined;
    keyboard.text(`${icon} ${category.name}`, `category_${category.id}`, opts);

    // Add row after every 2 categories
    if (index % 2 === 1 && index !== categories.length - 1) {
      keyboard.row();
    }
  });

  keyboard.row();
  keyboard.text(t("btnMainMenu"), "main_menu", {
    icon_custom_emoji_id: emojiIds.home,
  });

  return keyboard;
}
