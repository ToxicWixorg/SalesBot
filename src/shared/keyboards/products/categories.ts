import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Category } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../utils/customEmoji.ts";
import { getLocalizedName } from "../../utils/localizedFields.ts";

export function premiumCategoriesKeyboard(
  t: TFunction,
  categories: Category[],
  languageCode = "fa",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  categories.reverse().forEach((category, index) => {
    if (category.isActive === false) return;
    const icon = category.icon || "";
    const safeEmojiId = normalizeCustomEmojiId(category.customEmojiId);
    const opts = safeEmojiId
      ? { icon_custom_emoji_id: safeEmojiId }
      : undefined;
    keyboard.text(
      `${icon} ${getLocalizedName(category, languageCode)}`,
      `premium_category_${category.id}`,
      opts,
    );

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
