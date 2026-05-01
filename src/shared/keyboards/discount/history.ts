import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function discountHistoryKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "discount");
}
