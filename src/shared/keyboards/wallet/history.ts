import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { backKeyboard } from "../back.ts";

export function walletHistoryKeyboard(t: TFunction): InlineKeyboard {
  return backKeyboard(t, "wallet");
}
