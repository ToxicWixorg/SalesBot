import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

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
