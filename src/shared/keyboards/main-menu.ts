import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";
import { emojiIds } from "../locales/emojies.ts";

export function mainMenuKeyboard(
  t: TFunction,
  userRole: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text(t("btnProducts"), "products", {
      icon_custom_emoji_id: emojiIds.trolley,
      style: "primary",
    })
    .text(t("btnMyOrders"), "my_orders", { icon_custom_emoji_id: emojiIds.bag })
    .row()
    .text(t("btnWallet"), "wallet", { icon_custom_emoji_id: emojiIds.wallet })
    .text(t("btnInviteFriends"), "invite", {
      icon_custom_emoji_id: emojiIds.user,
    })
    .row()
    .text(t("btnMyTickets"), "my_tickets", {
      icon_custom_emoji_id: emojiIds.chat,
    })
    .row()
    .text(t("btnSettings"), "settings", {
      icon_custom_emoji_id: emojiIds.settings,
    });

  if (userRole !== "customer") {
    keyboard.row().text(t("btnAdminPanel"), "admin_panel", {
      icon_custom_emoji_id: emojiIds.admin,
      style: "success",
    });
  }

  return keyboard;
}
