import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function privacySettingsKeyboard(t: TFunction): InlineKeyboard {
  return (
    new InlineKeyboard()
      .text(t("btnExportData"), "settings:privacy:export")
      // .row()
      // .text(t("btnClearHistory"), "settings:privacy:clear_history")
      // .row()
      // .text(t("btnDeleteAccount"), "settings:privacy:delete_account")
      .row()
      .text(t("btnBack"), "settings")
  );
}
