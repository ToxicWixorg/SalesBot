import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Category } from "../../../db/schema.ts";

export function categoriesKeyboard(
  t: TFunction,
  categories: Category[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  categories.reverse().forEach((category, index) => {
    const icon = category.icon || "📦";
    keyboard.text(`${icon} ${category.name}`, `category_${category.id}`);

    // Add row after every 2 categories
    if (index % 2 === 1 && index !== categories.length - 1) {
      keyboard.row();
    }
  });

  keyboard.row();
  keyboard.text(t("btnMainMenu"), "main_menu");

  return keyboard;
}
