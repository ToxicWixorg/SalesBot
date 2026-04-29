import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * Generate main settings keyboard
 */
export function settingsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnAccountInfo"), "settings:account_info")
    .row()
    .text(t("btnChangeLanguage"), "change_language")
    .row()
    .text(t("btnNotificationSettings"), "settings:notifications")
    .row()
    .text(t("btnPrivacy"), "settings:privacy")
    .row()
    .text(t("btnAbout"), "settings:about")
    .row()
    .text(t("btnMainMenu"), "main_menu");
}

/**
 * Generate notification settings keyboard
 */
export function notificationSettingsKeyboard(
  t: TFunction,
  settings: {
    notifyOrders: boolean;
    notifyWallet: boolean;
    notifyPromotions: boolean;
    notifyReferrals: boolean;
    notifyStock: boolean;
  },
): InlineKeyboard {
  return new InlineKeyboard()
    .text(
      t("btnToggleOrderNotifications", settings.notifyOrders),
      "settings:toggle:orders",
    )
    .row()
    .text(
      t("btnToggleWalletNotifications", settings.notifyWallet),
      "settings:toggle:wallet",
    )
    .row()
    .text(
      t("btnTogglePromotionNotifications", settings.notifyPromotions),
      "settings:toggle:promotions",
    )
    .row()
    .text(
      t("btnToggleReferralNotifications", settings.notifyReferrals),
      "settings:toggle:referrals",
    )
    .row()
    .text(
      t("btnToggleStockNotifications", settings.notifyStock),
      "settings:toggle:stock",
    )
    .row()
    .text(t("btnBack"), "settings");
}

/**
 * Generate privacy settings keyboard
 */
export function privacySettingsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnExportData"), "settings:privacy:export")
    .row()
    .text(t("btnClearHistory"), "settings:privacy:clear_history")
    .row()
    .text(t("btnDeleteAccount"), "settings:privacy:delete_account")
    .row()
    .text(t("btnBack"), "settings");
}

/**
 * Generate settings confirmation keyboard
 */
export function settingsConfirmationKeyboard(
  t: TFunction,
  action: string,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnYes"), `settings:confirm:${action}`)
    .text(t("btnNo"), "settings");
}
