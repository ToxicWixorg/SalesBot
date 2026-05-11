import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function referralListKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "invite", {
    icon_custom_emoji_id: emojiIds.back,
  });
}
