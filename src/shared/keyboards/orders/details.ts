import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Order, Product } from "../../../db/schema.ts";
import { emojiIds, emojiIds } from "../../locales/emojies.ts";

export function orderDetailsKeyboard(
  t: TFunction,
  order: Order,
  product?: Product | null,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  keyboard.text(t("btnOrderOpenTicket"), `order_open_ticket_${order.id}`, {
    icon_custom_emoji_id: emojiIds.chat,
  });

  if (
    product?.isRenewable &&
    ["completed", "active", "expiring_soon"].includes(order.status)
  ) {
    keyboard.text(t("btnOrderRenew"), `order_renew_${order.id}`, {
      icon_custom_emoji_id: "5264727218734524899",
    });
  }

  keyboard.row();

  if (["waiting_schedule", "scheduled"].includes(order.status)) {
    keyboard.text(t("btnOrderReschedule"), `order_reschedule_${order.id}`, {
      icon_custom_emoji_id: emojiIds.date,
    });
  }

  keyboard
    .text(t("btnBackToOrders"), "back_to_orders", {
      icon_custom_emoji_id: emojiIds.back,
    })
    .row();
  keyboard.text(t("btnMainMenu"), "main_menu", {
    icon_custom_emoji_id: emojiIds.home,
  });

  return keyboard;
}
