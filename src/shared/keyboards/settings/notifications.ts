import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

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
    .text(t("btnBack"), "settings", { icon_custom_emoji_id: emojiIds.back });
}
