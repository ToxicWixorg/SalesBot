import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

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
