import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function SectionsKeyboard(t: TFunction): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  keyboard.text(t("SectionTelegramProducts"), "telegramProducts");
  keyboard.row();
  keyboard.text(t("SectionInstagramProducts"), "instagramProducts");
  keyboard.row();
  keyboard.text(t("SectionPremiumProducts"), "premiumProducts");
  keyboard.row();
  keyboard.text(t("btnMainMenu"), "main_menu", {
    icon_custom_emoji_id: emojiIds.home,
  });

  return keyboard;
}
