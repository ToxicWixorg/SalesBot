import { Bot, AnyBot, InlineKeyboard } from "gramio";
import { TicketRepository } from "../repositories/TicketRepository";
import { TicketService } from "../services/bot/ticket";
import { config } from "../config";
import { i18n } from "../shared/locales/index";
import { UserRepository } from "../repositories/UserRepository";
import { supportKeyboard } from "../shared/keyboards";
import { emojiIds } from "../shared/locales/emojies.ts";

export const supportHandler = (bot: AnyBot) => {
  /**
   * Main support menu - from main menu
   */
  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery();

    const user = await UserRepository.findById(ctx.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    await ctx.editText(t("supportMenuText"), {
      reply_markup: supportKeyboard(t),
      parse_mode: "HTML",
    });
  });

  /**
   * View my tickets
   */
  bot.callbackQuery("my_tickets", async (ctx) => {
    await ctx.answerCallbackQuery();

    const user = await UserRepository.findById(ctx.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    try {
      const tickets = await TicketRepository.getUserTickets(ctx.from.id);

      if (tickets.length === 0) {
        await ctx.editText(t("ticketListEmpty"), {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: t("btnNewSupportTicket"),
                  callback_data: "new_support_ticket",
                  parse_mode: "HTML",
                },
              ],
              [
                {
                  text: t("btnBack"),
                  callback_data: "support",
                  parse_mode: "HTML",
                },
              ],
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
      supportKeyboard;
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

      await ctx.editText(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("[SUPPORT] Error loading tickets:", error);
      await ctx.editText(t("ticketListError"));
    }
  });

  /**
   * View specific ticket details
   */
  bot.callbackQuery(/^view_ticket_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();

    const user = await UserRepository.findById(ctx.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    const ticketId = parseInt(ctx.queryData[1]);

    try {
      const { ticket, messages } =
        await TicketRepository.getTicketWithMessages(ticketId);

      if (!ticket) {
        await ctx.editText(t("ticketNotFound"));
        return;
      }

      if (ticket.userId !== ctx.from.id) {
        await ctx.answerCallbackQuery({
          text: t("ticketNotYours"),
          show_alert: true,
          parse_mode: "HTML",
        });
        return;
      }

      // Format ticket details
      const statusEmoji = getStatusEmoji(ticket.status || "open");
      const typeEmoji = getTypeEmoji(ticket.type);

      let message = `${typeEmoji} <b>${ticket.ticketNumber}</b>\n\n`;
      message += `${statusEmoji} <b>${t("status")}:</b> ${ticket.status}\n`;
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
        keyboard
          .text(t("btnReplyToTicket"), `reply_ticket_${ticket.id}`, {
            icon_custom_emoji_id: null, //emojiIds.chat,
          })
          .row();
      }

      keyboard
        .text(t("btnViewMessages"), `ticket_messages_${ticket.id}`, {
          icon_custom_emoji_id: null, //emojiIds.chat,
        })
        .row()
        .text(t("btnBackToTickets"), "my_tickets", {
          icon_custom_emoji_id: null, //emojiIds.back,
        });

      await ctx.editText(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("[SUPPORT] Error viewing ticket:", error);
      await ctx.editText(t("ticketLoadError"));
    }
  });

  // Reply to ticket callback is handled in ticket-scenes.ts

  /**
   * View ticket messages
   */
  bot.callbackQuery(/^ticket_messages_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();

    const user = await UserRepository.findById(ctx.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    const ticketId = parseInt(ctx.queryData[1]);

    try {
      const messages = await TicketRepository.getTicketMessages(ticketId);
      const ticket = await TicketRepository.getTicketById(ticketId);

      if (!ticket || ticket.userId !== ctx.from.id) {
        await ctx.answerCallbackQuery({
          text: t("ticketNotYours"),
          show_alert: true,
          parse_mode: "HTML",
        });
        return;
      }

      if (messages.length === 0) {
        await ctx.answerCallbackQuery({
          text: t("ticketNoMessages"),
          show_alert: true,
          parse_mode: "HTML",
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

      await ctx.editText(message, {
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
      await ctx.answerCallbackQuery({
        text: t("ticketMessagesError"),
        show_alert: true,
        parse_mode: "HTML",
      });
    }
  });

  // Cancel ticket callback is handled in ticket-scenes.ts

  /**
   * Admin callbacks for managing tickets from forum
   */

  // Resolve ticket
  bot.callbackQuery(/^ticket_resolve_(\d+)$/, async (ctx) => {
    const ticketId = parseInt(ctx.queryData[1]);

    try {
      const ticketService = new TicketService(bot.api);
      await ticketService.resolveTicket(ticketId, ctx.from.id);

      await ctx.answerCallbackQuery({
        text: "✅ Ticket resolved",
        show_alert: true,
        parse_mode: "HTML",
      });
      await ctx.editReplyMarkup({ inline_keyboard: [] });
    } catch (error) {
      console.error("[SUPPORT] Error resolving ticket:", error);
      await ctx.answerCallbackQuery({
        text: "❌ Failed to resolve ticket",
        show_alert: true,
        parse_mode: "HTML",
      });
    }
  });

  // Close ticket
  bot.callbackQuery(/^ticket_close_(\d+)$/, async (ctx) => {
    const ticketId = parseInt(ctx.queryData[1]);

    try {
      const ticketService = new TicketService(bot.api);
      await ticketService.closeTicket(ticketId, ctx.from.id);

      await ctx.answerCallbackQuery({
        text: "🔒 Ticket closed",
        show_alert: true,
        parse_mode: "HTML",
      });
      await ctx.editReplyMarkup({ inline_keyboard: [] });
    } catch (error) {
      console.error("[SUPPORT] Error closing ticket:", error);
      await ctx.answerCallbackQuery({
        text: "❌ Failed to close ticket",
        show_alert: true,
        parse_mode: "HTML",
      });
    }
  });

  // Assign ticket to support agent
  bot.callbackQuery(/^ticket_assign_(\d+)$/, async (ctx) => {
    const ticketId = parseInt(ctx.queryData[1]);

    try {
      const ticketService = new TicketService(bot.api);
      await ticketService.assignTicket(ticketId, ctx.from.id);

      await ctx.answerCallbackQuery({
        text: "✅ Ticket assigned to you",
        show_alert: true,
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("[SUPPORT] Error assigning ticket:", error);
      await ctx.answerCallbackQuery({
        text: "❌ Failed to assign ticket",
        show_alert: true,
        parse_mode: "HTML",
      });
    }
  });

  // View user profile (for admins)
  bot.callbackQuery(/^ticket_profile_(\d+)$/, async (ctx) => {
    const userId = parseInt(ctx.queryData[1]);

    // This would show user details to admin
    await ctx.answerCallbackQuery({
      text: `User ID: ${userId}`,
      show_alert: true,
      parse_mode: "HTML",
    });
  });

  /**
   * Handle replies from support group (forum messages)
   * This listens to messages in the support group and forwards them to users
   */
  if (config.SUPPORT_GROUP_ID) {
    bot.on("message", async (ctx) => {
      // Only process text messages from support group
      if (!ctx.text) return;
      if (ctx.chat?.id.toString() !== config.SUPPORT_GROUP_ID) return;

      // Check if message is a reply in a thread
      if (ctx.update?.message?.reply_to_message) {
        const threadMessageId = ctx.update.message.reply_to_message.message_id;

        try {
          const ticketService = new TicketService(bot.api);
          await ticketService.handleForumMessage(
            threadMessageId,
            ctx.from.id,
            ctx.text,
          );
        } catch (error) {
          console.error("[SUPPORT] Error handling forum message:", error);
        }
      }
    });
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
