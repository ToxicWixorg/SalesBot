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
      {
        icon_custom_emoji_id: emojiIds.bag,
        style: settings.notifyOrders ? "success" : "danger",
      },
    )
    .row()
    .text(
      t("btnToggleWalletNotifications", settings.notifyWallet),
      "settings:toggle:wallet",
      {
        icon_custom_emoji_id: emojiIds.wallet,
        style: settings.notifyWallet ? "success" : "danger",
      },
    )
    .row()
    .text(
      t("btnTogglePromotionNotifications", settings.notifyPromotions),
      "settings:toggle:promotions",
      {
        icon_custom_emoji_id: emojiIds.shield,
        style: settings.notifyPromotions ? "success" : "danger",
      },
    )
    .row()
    .text(
      t("btnToggleReferralNotifications", settings.notifyReferrals),
      "settings:toggle:referrals",
      {
        icon_custom_emoji_id: emojiIds.user,
        style: settings.notifyReferrals ? "success" : "danger",
      },
    )
    .row()
    .text(
      t("btnToggleStockNotifications", settings.notifyStock),
      "settings:toggle:stock",
      {
        icon_custom_emoji_id: emojiIds.tag,
        style: settings.notifyStock ? "success" : "danger",
      },
    )
    .row()
    .text(t("btnBack"), "settings", { icon_custom_emoji_id: emojiIds.back });
}
