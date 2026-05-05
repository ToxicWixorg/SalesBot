import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function privacySettingsKeyboard(t: TFunction): InlineKeyboard {
  return (
    new InlineKeyboard()
      .text(t("btnExportData"), "settings:privacy:export", {
        icon_custom_emoji_id: emojiIds.send,
      })
      // .row()
      // .text(t("btnClearHistory"), "settings:privacy:clear_history")
      // .row()
      // .text(t("btnDeleteAccount"), "settings:privacy:delete_account")
      .row()
      .text(t("btnBack"), "settings", { icon_custom_emoji_id: emojiIds.back })
  );
}
