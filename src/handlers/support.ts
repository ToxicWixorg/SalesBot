import { Bot, InlineKeyboard } from "gramio";
import { TicketRepository } from "../repositories/TicketRepository";
import { TicketService } from "../services/ticket";
import { config } from "../config";

export const supportHandler = (bot: Bot) => {
  /**
   * Main support menu - from main menu
   */
  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery();
    const t = ctx.t;

    const keyboard = new InlineKeyboard()
      .text(t("btnNewSupportTicket"), "new_support_ticket")
      .row()
      .text(t("btnNewReportTicket"), "new_report_ticket")
      .row()
      .text(t("btnMyTickets"), "my_tickets")
      .row()
      .text(t("btnBack"), "main_menu");

    await ctx.editMessageText(t("supportMenuText"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  });

  // Ticket creation callbacks are handled in ticket-scenes.ts

  /**
   * View my tickets
   */
  bot.callbackQuery("my_tickets", async (ctx) => {
    await ctx.answerCallbackQuery();
    const t = ctx.t;

    try {
      const tickets = await TicketRepository.getUserTickets(ctx.from.id);

      if (tickets.length === 0) {
        await ctx.editMessageText(t("ticketListEmpty"), {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: t("btnNewSupportTicket"),
                  callback_data: "new_support_ticket",
                },
              ],
              [{ text: t("btnBack"), callback_data: "support" }],
            ],
          },
        });
        return;
      }

      // Show ticket list
      let message = `${t("ticketListTitle")}\n\n`;

      for (const ticket of tickets.slice(0, 10)) {
        const statusEmoji = getStatusEmoji(ticket.status || "open");
        const typeEmoji = getTypeEmoji(ticket.type);

        message += `${statusEmoji} ${typeEmoji} <b>${ticket.ticketNumber}</b>\n`;
        message += `   ${ticket.title.substring(0, 50)}${ticket.title.length > 50 ? "..." : ""}\n`;
        message += `   ${new Date(ticket.createdAt).toLocaleDateString()}\n\n`;
      }

      if (tickets.length > 10) {
        message += `\n<i>${t("ticketListShowingFirst10")}</i>`;
      }

      const keyboard = new InlineKeyboard();

      // Add buttons for recent tickets
      for (const ticket of tickets.slice(0, 5)) {
        keyboard
          .text(
            `${ticket.ticketNumber} - ${ticket.status}`,
            `view_ticket_${ticket.id}`,
          )
          .row();
      }

      keyboard
        .text(t("btnNewSupportTicket"), "new_support_ticket")
        .row()
        .text(t("btnBack"), "support");

      await ctx.editMessageText(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("[SUPPORT] Error loading tickets:", error);
      await ctx.editMessageText(t("ticketListError"));
    }
  });

  /**
   * View specific ticket details
   */
  bot.callbackQuery(/^view_ticket_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const t = ctx.t;
    const ticketId = parseInt(ctx.match[1]);

    try {
      const { ticket, messages } =
        await TicketRepository.getTicketWithMessages(ticketId);

      if (!ticket) {
        await ctx.editMessageText(t("ticketNotFound"));
        return;
      }

      if (ticket.userId !== ctx.from.id) {
        await ctx.answerCallbackQuery(t("ticketNotYours"), {
          show_alert: true,
        });
        return;
      }

      // Format ticket details
      const statusEmoji = getStatusEmoji(ticket.status || "open");
      const typeEmoji = getTypeEmoji(ticket.type);

      let message = `${typeEmoji} <b>${ticket.ticketNumber}</b>\n\n`;
      message += `${statusEmoji} <b>${t("status")}:</b> ${t(`ticketStatus_${ticket.status}`)}\n`;
      message += `📅 <b>${t("created")}:</b> ${new Date(ticket.createdAt).toLocaleString()}\n`;
      if (ticket.orderId) {
        message += `📦 <b>${t("order")}:</b> #${ticket.orderId}\n`;
      }
      message += `\n━━━━━━━━━━━━━━━━\n`;
      message += `<b>${ticket.title}</b>\n\n`;

      if (ticket.description) {
        message += `${ticket.description}\n`;
      }

      message += `\n━━━━━━━━━━━━━━━━\n`;
      message += `💬 <b>${t("messages")}:</b> ${ticket.messageCount || 0}\n`;

      if (ticket.lastMessageAt) {
        message += `⏰ <b>${t("lastMessage")}:</b> ${new Date(ticket.lastMessageAt).toLocaleString()}\n`;
      }

      const keyboard = new InlineKeyboard();

      if (ticket.status !== "closed" && ticket.status !== "resolved") {
        keyboard.text(t("btnReplyToTicket"), `reply_ticket_${ticket.id}`).row();
      }

      keyboard
        .text(t("btnViewMessages"), `ticket_messages_${ticket.id}`)
        .row()
        .text(t("btnBackToTickets"), "my_tickets");

      await ctx.editMessageText(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("[SUPPORT] Error viewing ticket:", error);
      await ctx.editMessageText(t("ticketLoadError"));
    }
  });

  // Reply to ticket callback is handled in ticket-scenes.ts

  /**
   * View ticket messages
   */
  bot.callbackQuery(/^ticket_messages_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const t = ctx.t;
    const ticketId = parseInt(ctx.match[1]);

    try {
      const messages = await TicketRepository.getTicketMessages(ticketId);
      const ticket = await TicketRepository.getTicketById(ticketId);

      if (!ticket || ticket.userId !== ctx.from.id) {
        await ctx.answerCallbackQuery(t("ticketNotYours"), {
          show_alert: true,
        });
        return;
      }

      if (messages.length === 0) {
        await ctx.answerCallbackQuery(t("ticketNoMessages"), {
          show_alert: true,
        });
        return;
      }

      // Show recent messages
      let message = `💬 <b>${t("ticketMessages")} - ${ticket.ticketNumber}</b>\n\n`;

      for (const msg of messages.slice(-5)) {
        const emoji = msg.isFromUser ? "👤" : "👨‍💼";
        const sender = msg.isFromUser ? t("you") : t("support");
        const time = new Date(msg.createdAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        message += `${emoji} <b>${sender}</b> (${time})\n`;
        message += `${msg.message.substring(0, 200)}${msg.message.length > 200 ? "..." : ""}\n\n`;
      }

      if (messages.length > 5) {
        message += `<i>${t("ticketShowingLast5Messages")}</i>`;
      }

      await ctx.editMessageText(message, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: t("btnBack"),
                callback_data: `view_ticket_${ticketId}`,
              },
            ],
          ],
        },
      });
    } catch (error) {
      console.error("[SUPPORT] Error viewing messages:", error);
      await ctx.answerCallbackQuery(t("ticketMessagesError"), {
        show_alert: true,
      });
    }
  });

  // Cancel ticket callback is handled in ticket-scenes.ts

  /**
   * Admin callbacks for managing tickets from forum
   */

  // Resolve ticket
  bot.callbackQuery(/^ticket_resolve_(\d+)$/, async (ctx) => {
    const ticketId = parseInt(ctx.match[1]);

    try {
      const ticketService = new TicketService(ctx.api);
      await ticketService.resolveTicket(ticketId, ctx.from.id);

      await ctx.answerCallbackQuery("✅ Ticket resolved", { show_alert: true });
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch (error) {
      console.error("[SUPPORT] Error resolving ticket:", error);
      await ctx.answerCallbackQuery("❌ Failed to resolve ticket", {
        show_alert: true,
      });
    }
  });

  // Close ticket
  bot.callbackQuery(/^ticket_close_(\d+)$/, async (ctx) => {
    const ticketId = parseInt(ctx.match[1]);

    try {
      const ticketService = new TicketService(ctx.api);
      await ticketService.closeTicket(ticketId, ctx.from.id);

      await ctx.answerCallbackQuery("🔒 Ticket closed", { show_alert: true });
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch (error) {
      console.error("[SUPPORT] Error closing ticket:", error);
      await ctx.answerCallbackQuery("❌ Failed to close ticket", {
        show_alert: true,
      });
    }
  });

  // Assign ticket to support agent
  bot.callbackQuery(/^ticket_assign_(\d+)$/, async (ctx) => {
    const ticketId = parseInt(ctx.match[1]);

    try {
      const ticketService = new TicketService(ctx.api);
      await ticketService.assignTicket(ticketId, ctx.from.id);

      await ctx.answerCallbackQuery("✅ Ticket assigned to you", {
        show_alert: true,
      });
    } catch (error) {
      console.error("[SUPPORT] Error assigning ticket:", error);
      await ctx.answerCallbackQuery("❌ Failed to assign ticket", {
        show_alert: true,
      });
    }
  });

  // View user profile (for admins)
  bot.callbackQuery(/^ticket_profile_(\d+)$/, async (ctx) => {
    const userId = parseInt(ctx.match[1]);

    // This would show user details to admin
    await ctx.answerCallbackQuery(`User ID: ${userId}`, { show_alert: true });
  });

  /**
   * Handle replies from support group (forum messages)
   * This listens to messages in the support group and forwards them to users
   */
  if (config.SUPPORT_GROUP_ID) {
    bot.on("message:text").filter(
      (ctx) => ctx.chat.id.toString() === config.SUPPORT_GROUP_ID,
      async (ctx) => {
        // Check if message is a reply in a thread
        if (ctx.message.reply_to_message) {
          const threadMessageId = ctx.message.reply_to_message.message_id;

          try {
            const ticketService = new TicketService(ctx.api);
            await ticketService.handleForumMessage(
              threadMessageId,
              ctx.from.id,
              ctx.message.text,
            );
          } catch (error) {
            console.error("[SUPPORT] Error handling forum message:", error);
          }
        }
      },
    );
  }

  console.log("✅ Support handler registered");
};

// Helper functions
function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    open: "🟢",
    waiting_user: "🟡",
    waiting_support: "🟠",
    in_progress: "🔵",
    resolved: "✅",
    closed: "🔒",
    blocked: "⛔",
  };
  return emojis[status] || "⚪";
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    support: "🎫",
    order: "📦",
    report: "⚠️",
  };
  return emojis[type] || "🎫";
}
