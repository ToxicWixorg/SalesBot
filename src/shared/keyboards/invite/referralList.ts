import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function referralListKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "invite");
}
