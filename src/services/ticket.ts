import { InlineKeyboard } from "gramio";
import { TicketRepository } from "../repositories/TicketRepository";
import { UserRepository } from "../repositories/UserRepository";
import { config, TICKET_TOPICS, type TicketType } from "../config";
import type { Ticket } from "../db/schema";

/**
 * Ticket Service - Handles Forum-based ticket system
 */
export class TicketService {
  private botApi: any;

  constructor(botApi: any) {
    this.botApi = botApi;
  }

  /**
   * Create a new ticket and send to forum group
   */
  async createTicket(data: {
    userId: number;
    type: TicketType;
    title: string;
    description?: string;
    orderId?: number;
    priority?: "low" | "normal" | "high" | "urgent";
  }): Promise<Ticket> {
    console.log("[DEBUG] TicketService.createTicket called:", data);
    // Get user info
    const user = await UserRepository.findById(data.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create ticket in database
    const ticket = await TicketRepository.createTicket({
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      orderId: data.orderId,
      priority: data.priority || "normal",
    });

    // Send to forum group if configured
    console.log("[DEBUG] config.SUPPORT_GROUP_ID:", config.SUPPORT_GROUP_ID);
    if (config.SUPPORT_GROUP_ID) {
      console.log("[DEBUG] Sending ticket to forum...");
      await this.sendTicketToForum(ticket, user);
    } else {
      console.warn(
        "[DEBUG] SUPPORT_GROUP_ID not configured, skipping forum sync",
      );
    }

    return ticket;
  }

  /**
   * Send ticket to Telegram Forum Group
   */
  private async sendTicketToForum(
    ticket: Ticket,
    user: { id: number; username?: string | null; firstName?: string | null },
  ) {
    if (!config.SUPPORT_GROUP_ID) {
      console.warn("[TICKET] Support group not configured");
      return;
    }

    const topicId = TICKET_TOPICS[ticket.type as TicketType];
    console.log(
      "[DEBUG] sendTicketToForum - Type:",
      ticket.type,
      "- TopicID:",
      topicId,
      "- GroupID:",
      config.SUPPORT_GROUP_ID,
    );
    const username = user.username
      ? `@${user.username}`
      : user.firstName || "User";
    const priorityEmoji = this.getPriorityEmoji(ticket.priority || "normal");

    // Format ticket message for forum
    let message = `${this.getTypeEmoji(ticket.type)} <b>New ${this.getTypeLabel(ticket.type)}</b>\n\n`;
    message += `🎫 <b>Ticket:</b> <code>${ticket.ticketNumber}</code>\n`;
    message += `👤 <b>User:</b> ${username} (<code>${user.id}</code>)\n`;
    message += `${priorityEmoji} <b>Priority:</b> ${ticket.priority}\n`;
    message += `⏰ <b>Time:</b> ${new Date(ticket.createdAt).toLocaleString("en-GB")}\n\n`;

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `<b>${ticket.title}</b>\n\n`;

    if (ticket.description) {
      message += `${ticket.description}\n\n`;
    }

    if (ticket.orderId) {
      message += `📦 <b>Order ID:</b> #${ticket.orderId}\n\n`;
    }

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `<i>Reply to this thread to communicate with the user</i>`;

    // Create inline keyboard
    const keyboard = new InlineKeyboard()
      .text("👤 View Profile", `ticket_profile_${user.id}`)
      .row()
      .text("✅ Resolve", `ticket_resolve_${ticket.id}`)
      .text("🔒 Close", `ticket_close_${ticket.id}`)
      .row()
      .text("🔁 Assign to Me", `ticket_assign_${ticket.id}`)
      .text("⚠️ Priority", `ticket_priority_${ticket.id}`);

    try {
      // Send message to specific topic in forum
      const sentMessage = await this.botApi.sendMessage({
        chat_id: Number(config.SUPPORT_GROUP_ID),
        text: message,
        message_thread_id: topicId,
        parse_mode: "HTML",
        reply_markup: keyboard,
      });

      // Update ticket with forum info
      await TicketRepository.updateTicketForumInfo(ticket.id, {
        forumGroupId: Number(config.SUPPORT_GROUP_ID),
        topicId: topicId,
        threadMessageId: sentMessage.message_id,
      });

      console.log(
        `[TICKET] Sent ticket ${ticket.ticketNumber} to forum (topic: ${topicId}, thread: ${sentMessage.message_id})`,
      );
    } catch (error) {
      console.error("[TICKET] Failed to send to forum:", error);
      // Don't throw - ticket is created, just not synced to forum yet
    }
  }

  /**
   * Send message from user to ticket thread in forum
   */
  async sendUserMessageToForum(
    ticketId: number,
    userId: number,
    message: string,
  ) {
    const ticket = await TicketRepository.getTicketById(ticketId);
    if (!ticket || !ticket.threadMessageId) {
      console.warn("[TICKET] Ticket not found or not synced to forum");
      return;
    }

    const user = await UserRepository.findById(userId);
    if (!user) return;

    const username = user.username
      ? `@${user.username}`
      : user.firstName || "User";

    try {
      // Send to forum thread (reply to thread message)
      await this.botApi.sendMessage({
        chat_id: Number(config.SUPPORT_GROUP_ID!),
        text: `👤 <b>${username}:</b>\n${message}`,
        message_thread_id: ticket.topicId!,
        reply_to_message_id: ticket.threadMessageId,
        parse_mode: "HTML",
      });

      // Save message to database
      await TicketRepository.addMessage({
        ticketId: ticket.id,
        userId: userId,
        message: message,
        isFromUser: true,
      });

      console.log(
        `[TICKET] User message sent to forum thread ${ticket.ticketNumber}`,
      );
    } catch (error) {
      console.error("[TICKET] Failed to send user message to forum:", error);
    }
  }

  /**
   * Send message from support to user (called from forum)
   */
  async sendSupportMessageToUser(
    ticketId: number,
    supportUserId: number,
    message: string,
  ) {
    const ticket = await TicketRepository.getTicketById(ticketId);
    if (!ticket) {
      console.warn("[TICKET] Ticket not found");
      return;
    }

    // Save message to database
    await TicketRepository.addMessage({
      ticketId: ticket.id,
      userId: supportUserId,
      message: message,
      isFromUser: false,
    });

    // Send to user in bot
    try {
      await this.botApi.sendMessage({
        chat_id: ticket.userId,
        text: `🎫 <b>Support Reply (${ticket.ticketNumber}):</b>\n\n${message}`,
        parse_mode: "HTML",
      });

      console.log(
        `[TICKET] Support message sent to user ${ticket.userId} for ticket ${ticket.ticketNumber}`,
      );
    } catch (error) {
      console.error("[TICKET] Failed to send message to user:", error);
    }
  }

  /**
   * Handle forum message (when support replies)
   */
  async handleForumMessage(
    messageThreadId: number,
    supportUserId: number,
    messageText: string,
  ) {
    // Find ticket by thread message ID
    const ticket =
      await TicketRepository.getTicketByThreadMessageId(messageThreadId);

    if (!ticket) {
      console.log("[TICKET] No ticket found for thread:", messageThreadId);
      return;
    }

    // Send support message to user
    await this.sendSupportMessageToUser(ticket.id, supportUserId, messageText);
  }

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId: number, resolvedBy: number) {
    const ticket = await TicketRepository.updateTicketStatus(
      ticketId,
      "resolved",
    );

    // Notify user
    try {
      await this.botApi.sendMessage({
        chat_id: ticket.userId,
        text: `✅ Your ticket <b>${ticket.ticketNumber}</b> has been resolved.\n\nIf you have any other questions, feel free to open a new ticket.`,
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("[TICKET] Failed to notify user:", error);
    }

    // Update forum thread
    if (ticket.threadMessageId && config.SUPPORT_GROUP_ID) {
      try {
        await this.botApi.sendMessage({
          chat_id: Number(config.SUPPORT_GROUP_ID),
          text: `✅ <b>Ticket Resolved</b>\n\nThis ticket has been marked as resolved.`,
          message_thread_id: ticket.topicId!,
          reply_to_message_id: ticket.threadMessageId,
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error("[TICKET] Failed to update forum:", error);
      }
    }

    return ticket;
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId: number, closedBy: number) {
    const ticket = await TicketRepository.updateTicketStatus(
      ticketId,
      "closed",
    );

    // Notify user
    try {
      await this.botApi.sendMessage({
        chat_id: ticket.userId,
        text: `🔒 Your ticket <b>${ticket.ticketNumber}</b> has been closed.\n\nThank you for contacting support!`,
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("[TICKET] Failed to notify user:", error);
    }

    return ticket;
  }

  /**
   * Assign ticket to support agent
   */
  async assignTicket(ticketId: number, agentId: number) {
    const ticket = await TicketRepository.assignTicket(ticketId, agentId);
    const agent = await UserRepository.findById(agentId);

    // Update forum thread
    if (ticket.threadMessageId && config.SUPPORT_GROUP_ID) {
      try {
        const agentName = agent?.username
          ? `@${agent.username}`
          : agent?.firstName || "Agent";

        await this.botApi.sendMessage({
          chat_id: Number(config.SUPPORT_GROUP_ID),
          text: `👨‍💼 <b>Ticket Assigned</b>\n\nAssigned to: ${agentName}`,
          message_thread_id: ticket.topicId!,
          reply_to_message_id: ticket.threadMessageId,
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error("[TICKET] Failed to update forum:", error);
      }
    }

    return ticket;
  }

  // Helper methods
  private getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      support: "🎫",
      order: "📦",
      report: "⚠️",
    };
    return emojis[type] || "🎫";
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      support: "Support Ticket",
      order: "Order Issue",
      report: "Problem Report",
    };
    return labels[type] || "Ticket";
  }

  private getPriorityEmoji(priority: string): string {
    const emojis: Record<string, string> = {
      low: "🟢",
      normal: "🟡",
      high: "🟠",
      urgent: "🔴",
    };
    return emojis[priority] || "🟡";
  }
}
