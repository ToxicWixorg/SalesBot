import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function discountEnterKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnCancel"), "discount");
}
