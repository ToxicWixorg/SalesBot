import { InlineKeyboard } from "gramio";
import { TFunction } from "../../locales";

export function supportKeyboard(t: TFunction) {
  return new InlineKeyboard()
    .text(t("btnNewSupportTicket"), "new_support_ticket")
    .row()
    .text(t("btnNewReportTicket"), "new_report_ticket")
    .row()
    .text(t("btnMyTickets"), "my_tickets")
    .row()
    .text(t("btnBack"), "main_menu");
}
