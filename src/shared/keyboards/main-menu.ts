import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";
import { emojiIds } from "../locales/emojies.ts";

export function mainMenuKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnProducts"), "products", { icon_custom_emoji_id: emojiIds.bag })
    .text(t("btnMyOrders"), "my_orders", { icon_custom_emoji_id: emojiIds.box })
    .row()
    .text(t("btnWallet"), "wallet", { icon_custom_emoji_id: emojiIds.wallet })
    .text(t("btnInviteFriends"), "invite", {
      icon_custom_emoji_id: emojiIds.users,
    })
    .row()
    .text(t("btnDiscountCode"), "discount", {
      icon_custom_emoji_id: emojiIds.gift,
    })
    .text(t("btnSupport"), "support", { icon_custom_emoji_id: emojiIds.chat })
    .row()
    .text(t("btnSettings"), "settings", {
      icon_custom_emoji_id: emojiIds.settings,
    });
}
