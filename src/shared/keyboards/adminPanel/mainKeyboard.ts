import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function mainKeyboard(
  t: TFunction, 
): InlineKeyboard {
  return (
    new InlineKeyboard()
      .text(t("panelProducts") , "panel_products" ,{icon_custom_emoji_id: emojiIds.trolley , style : 'primary'})
      .text(t("panelOrders") , "panel_orders" ,{icon_custom_emoji_id: emojiIds.bag , style : 'primary'})
      .row()
      .text(t("panelUsers") , "panel_users" ,{icon_custom_emoji_id: emojiIds.user , style : 'success'})
      .text(t("panelWallet") , "panel_wallet" ,{icon_custom_emoji_id: emojiIds.wallet , style : 'success'})
      .row()
      .text(t("panelDiscounts") , "panel_discounts" ,{ style : 'primary'})
      .text(t("panelSchedules") , "panel_schedules" ,{icon_custom_emoji_id: emojiIds.clock , style : 'primary'})
      .row()
        .text(t("panelBroadcast"), "panel_broadcast", {icon_custom_emoji_id: emojiIds.send, style: "danger"})
      .row()
      .text(t("panelSetting") , "panel_setting" ,{icon_custom_emoji_id: emojiIds.settings , style : 'danger'})
      .row()
      .text(t("btnBack"), "main_menu", { icon_custom_emoji_id: emojiIds.back })
  );
}
