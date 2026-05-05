import { InlineKeyboard } from "gramio";
import { TFunction } from "../../locales";
import { emojiIds } from "../../locales/emojies.ts";

export function supportKeyboard(t: TFunction) {
  return new InlineKeyboard()
    .text(t("btnNewSupportTicket"), "new_support_ticket", {
      icon_custom_emoji_id: emojiIds.ticket,
    })
    .row()
    .text(t("btnNewReportTicket"), "new_report_ticket", {
      icon_custom_emoji_id: emojiIds.warn,
    })
    .row()
    .text(t("btnMyTickets"), "my_tickets", {
      icon_custom_emoji_id: emojiIds.clipboard,
    })
    .row()
    .text(t("btnBack"), "main_menu", { icon_custom_emoji_id: emojiIds.back });
}
