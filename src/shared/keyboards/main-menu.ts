import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

export function mainMenuKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnProducts"), "products")
    .text(t("btnMyOrders"), "my_orders")
    .row()
    .text(t("btnWallet"), "wallet")
    .text(t("btnInviteFriends"), "invite")
    .row()
    .text(t("btnDiscountCode"), "discount")
    .text(t("btnSupport"), "support")
    .row()
    .text(t("btnSettings"), "settings");
}
