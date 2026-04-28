import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * Generate pagination keyboard
 */
export function paginationKeyboard(
  t: TFunction,
  currentPage: number,
  totalPages: number,
  callbackPrefix = "page",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (currentPage > 1) {
    keyboard.text("◀️", `${callbackPrefix}_${currentPage - 1}`);
  }

  keyboard.text(`${currentPage}/${totalPages}`, `${callbackPrefix}_current`);

  if (currentPage < totalPages) {
    keyboard.text("▶️", `${callbackPrefix}_${currentPage + 1}`);
  }

  return keyboard;
}

/**
 * Generate list item keyboard
 */
export function listItemKeyboard(
  itemId: string | number,
  actionButtons: { text: string; callback: string }[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  actionButtons.forEach((btn, index) => {
    keyboard.text(btn.text, `${btn.callback}_${itemId}`);
    if (index < actionButtons.length - 1) {
      keyboard.row();
    }
  });

  return keyboard;
}
