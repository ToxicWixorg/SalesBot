import { InlineKeyboard } from "gramio";
import type { Ticket } from "../../../db/schema";

export function ticketKeyboard(
  user: { id: number; username?: string | null; firstName?: string | null },
  ticket: Ticket,
) {
  return new InlineKeyboard()
    .text("👤 View Profile", `ticket_profile_${user.id}`)
    .row()
    .text("✅ Resolve", `ticket_resolve_${ticket.id}`)
    .text("🔒 Close", `ticket_close_${ticket.id}`)
    .row()
    .text("🔁 Assign to Me", `ticket_assign_${ticket.id}`)
    .text("⚠️ Priority", `ticket_priority_${ticket.id}`);
}
