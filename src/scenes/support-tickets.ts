import { Bot, AnyBot, InlineKeyboard } from "gramio";
import { TicketService } from "../services/bot/ticket";
import { TicketRepository } from "../repositories/TicketRepository";
import { i18n } from "../shared/locales/index";
import { UserRepository } from "../repositories/UserRepository";
import { config } from "../config";

/**
 * State management for ticket creation
 */
export const ticketState = new Map<
  number,
  {
    type: "support" | "order" | "report";
    orderId?: number;
    step: "message";
  }
>();

// Separate state for ticket replies
export const ticketReplyState = new Map<number, number>(); // userId -> ticketId

export function setupTicketScenes(bot: AnyBot) {
  console.log("🎫 Setting up ticket scenes...");

  bot.callbackQuery("new_support_ticket", async (context) => {
    console.log(
      "[DEBUG] new_support_ticket callback triggered for user:",
      context.from.id,
    );
    const user = await UserRepository.findById(context.from.id);
    if (!user) {
      console.log("[DEBUG] User not found in database:", context.from.id);
      return;
    }
    const t = i18n.buildT(user.languageCode || "en");

    ticketState.set(context.from.id, {
      type: "support",
      step: "message",
    });
    console.log(
      "[DEBUG] Ticket state set for user:",
      context.from.id,
      ticketState.get(context.from.id),
    );

    const keyboard = new InlineKeyboard().text(t("btnCancel"), "cancel_ticket");

    await context.editText(t("ticketSupportPrompt"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  });

  /**
   * Start creating a report ticket
   */
  bot.callbackQuery("new_report_ticket", async (context) => {
    const user = await UserRepository.findById(context.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    ticketState.set(context.from.id, {
      type: "report",
      step: "message",
    });

    const keyboard = new InlineKeyboard().text(t("btnCancel"), "cancel_ticket");

    await context.editText(t("ticketReportPrompt"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  });

  /**
   * Start creating an order ticket
   */
  bot.callbackQuery(/^order_open_ticket_(\d+)$/, async (context) => {
    const user = await UserRepository.findById(context.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    const orderId = parseInt(context.queryData[1]);

    ticketState.set(context.from.id, {
      type: "order",
      orderId: orderId,
      step: "message",
    });

    const keyboard = new InlineKeyboard().text(t("btnCancel"), "cancel_ticket");

    await context.send(t("ticketOrderPrompt"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  });

  /**
   * Reply to existing ticket
   */
  bot.callbackQuery(/^reply_ticket_(\d+)$/, async (context) => {
    const user = await UserRepository.findById(context.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    const ticketId = parseInt(context.queryData[1]);

    // Check ticket ownership
    const ticket = await TicketRepository.getTicketById(ticketId);
    if (!ticket || ticket.userId !== context.from.id) {
      await context.answerCallbackQuery({
        text: t("ticketNotYours"),
        show_alert: true,
      });
      return;
    }

    if (ticket.status === "closed") {
      await context.answerCallbackQuery({
        text: t("ticketAlreadyClosed"),
        show_alert: true,
      });
      return;
    }

    // Store ticket ID for replies
    ticketReplyState.set(context.from.id, ticketId);

    const keyboard = new InlineKeyboard().text(
      t("btnCancel"),
      "cancel_ticket_reply",
    );

    await context.send(
      t("ticketReplyPrompt", {
        ticketNumber: ticket.ticketNumber,
      }),
      {
        reply_markup: keyboard,
        parse_mode: "HTML",
      },
    );

    await context.answerCallbackQuery();
  });

  /**
   * Cancel ticket creation
   */
  bot.callbackQuery(/^cancel_ticket/, async (context) => {
    const user = await UserRepository.findById(context.from.id);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    ticketState.delete(context.from.id);
    ticketReplyState.delete(context.from.id);

    const keyboard = new InlineKeyboard().text(t("btnBackToMain"), "main_menu");

    await context.editText(t("ticketCreationCancelled"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  });

  /**
   * Unified message handler - handles both private chats and forum group
   */
  bot.on("message", async (context) => {
    console.log("[DEBUG-MSG] ========== MESSAGE HANDLER START ==========");
    console.log("[DEBUG-MSG] Chat type:", context.chat?.type);

    const userId = context.from?.id;
    if (!userId || !context.text) {
      console.log("[DEBUG-MSG] No userId or text, returning");
      return;
    }

    // ========== HANDLE FORUM GROUP (SUPERGROUP) ==========
    if (context.chat?.type === "supergroup") {
      console.log("[DEBUG-FORUM] Processing supergroup message");

      // Check if this is the support group
      const chatId = context.chat.id.toString();
      const supportGroupId = config.SUPPORT_GROUP_ID?.replace("-100", "");
      console.log(
        "[DEBUG-FORUM] Chat ID:",
        chatId,
        "Support Group ID:",
        supportGroupId,
      );

      if (!config.SUPPORT_GROUP_ID || !chatId.includes(supportGroupId || "")) {
        console.log("[DEBUG-FORUM] Not the support group, skipping");
        return;
      }

      // Check if this is a reply to a thread
      console.log("[DEBUG-FORUM] Full context keys:", Object.keys(context));
      console.log("[DEBUG-FORUM] context.update:", (context as any).update);
      console.log("[DEBUG-FORUM] context.payload:", (context as any).payload);
      console.log(
        "[DEBUG-FORUM] context.update?.message:",
        (context as any).update?.message,
      );

      // Try different paths to find reply_to_message and message_thread_id
      const message =
        (context as any).update?.message || (context as any).payload;
      console.log("[DEBUG-FORUM] Extracted message:", message);
      console.log(
        "[DEBUG-FORUM] message.reply_to_message:",
        message?.reply_to_message,
      );
      console.log(
        "[DEBUG-FORUM] message.message_thread_id:",
        message?.message_thread_id,
      );

      const replyToMessageId = message?.reply_to_message?.message_id;
      const messageThreadId = message?.message_thread_id;

      console.log(
        "[DEBUG-FORUM] Reply to:",
        replyToMessageId,
        "Thread ID:",
        messageThreadId,
      );

      if (!replyToMessageId && !messageThreadId) {
        console.log("[DEBUG-FORUM] Not a thread message, skipping");
        return;
      }

      const supportUserId = context.from?.id;
      const messageText = context.text;

      if (!supportUserId || !messageText) {
        console.log("[DEBUG-FORUM] No user ID or message text, skipping");
        return;
      }

      console.log(
        "[DEBUG-FORUM] Support reply from:",
        supportUserId,
        "Message:",
        messageText.substring(0, 50),
      );

      try {
        // Find ticket by thread message ID
        const ticket = await TicketRepository.getTicketByThreadMessageId(
          replyToMessageId || messageThreadId!,
        );
        if (!ticket) {
          console.log(
            "[DEBUG-FORUM] Ticket not found for thread message ID:",
            replyToMessageId || messageThreadId,
          );
          return;
        }

        console.log(
          "[DEBUG-FORUM] Found ticket:",
          ticket.ticketNumber,
          "ID:",
          ticket.id,
        );

        const ticketService = new TicketService(bot.api);
        await ticketService.sendSupportMessageToUser(
          ticket.id,
          supportUserId,
          messageText,
        );
        console.log("[DEBUG-FORUM] Message sent to user successfully");
      } catch (error) {
        console.error("[FORUM] Error handling support reply:", error);
      }

      console.log("[DEBUG-FORUM] ========== FORUM HANDLER END ==========");
      return;
    }

    // ========== HANDLE PRIVATE CHAT (TICKET CREATION) ==========
    if (context.chat?.type === "private") {
      console.log("[DEBUG-TICKET] Processing private chat message");
      console.log("[DEBUG-TICKET] UserId:", userId);

      // Check if user is in a scene
      const inScene = (context as any).scene?.current;
      if (inScene) {
        console.log(
          "[DEBUG-TICKET] User is in scene:",
          inScene,
          "- skipping - userId:",
          userId,
          "- State:",
          ticketState.has(userId),
          "- Reply state:",
          ticketReplyState.has(userId),
        );
        return;
      }
      console.log("[DEBUG-TICKET] Not in scene ✓");

      // Check if replying to existing ticket
      console.log(
        "[DEBUG-TICKET] Checking ticketReplyState:",
        ticketReplyState.has(userId),
      );
      if (ticketReplyState.has(userId)) {
        console.log(
          "[DEBUG-TICKET] User is replying to ticket, calling handleTicketReply",
        );
        await handleTicketReply(context, userId);
        return;
      }

      // Check if creating new ticket
      console.log(
        "[DEBUG-TICKET] Checking ticketState:",
        ticketState.has(userId),
      );
      const state = ticketState.get(userId);
      console.log("[DEBUG-TICKET] State:", state);
      if (!state || state.step !== "message") {
        console.log("[DEBUG-TICKET] No valid state, returning");
        return;
      }

      console.log("[DEBUG-TICKET] Calling handleTicketCreation");
      await handleTicketCreation(context, userId, state);
      console.log("[DEBUG-TICKET] ========== TICKET HANDLER END ==========");
      return;
    }

    console.log("[DEBUG-MSG] Unknown chat type, skipping");
  });

  /**
   * Handle ticket creation
   */
  async function handleTicketCreation(
    context: any,
    userId: number,
    state: { type: "support" | "order" | "report"; orderId?: number },
  ) {
    const user = await UserRepository.findById(userId);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    const message = context.text;

    if (!message || message.length < 10) {
      await context.reply(t("ticketMessageTooShort"));
      return;
    }

    console.log(
      "[DEBUG] Creating ticket for user:",
      userId,
      "Type:",
      state.type,
    );

    try {
      const ticketService = new TicketService(bot.api);

      const ticket = await ticketService.createTicket({
        userId: userId,
        type: state.type,
        title:
          state.type === "order"
            ? `Order #${state.orderId} - ${message.substring(0, 80)}`
            : message.substring(0, 100),
        description: message,
        orderId: state.orderId,
        priority: state.type === "support" ? "normal" : "high",
      });

      const keyboard = new InlineKeyboard();

      if (state.orderId) {
        keyboard.text(t("btnViewOrder"), `order_details_${state.orderId}`);
        keyboard.row();
      }

      keyboard.text(t("btnViewMyTickets"), "my_tickets");
      keyboard.row();
      keyboard.text(t("btnBackToMain"), "main_menu");

      await context.reply(
        t("ticketCreatedSuccess", {
          ticketNumber: ticket.ticketNumber,
        }),
        {
          reply_markup: keyboard,
          parse_mode: "HTML",
        },
      );

      ticketState.delete(userId);
    } catch (error) {
      console.error("[TICKET] Error creating ticket:", error);
      await context.reply(t("ticketCreateError"));
      ticketState.delete(userId);
    }
  }

  /**
   * Handle ticket reply
   */
  async function handleTicketReply(context: any, userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) return;
    const t = i18n.buildT(user.languageCode || "en");

    const ticketId = ticketReplyState.get(userId);
    if (!ticketId) return;

    const message = context.text;

    if (!message) {
      await context.reply(t("ticketMessageEmpty"));
      return;
    }

    try {
      const ticketService = new TicketService(bot.api);

      await ticketService.sendUserMessageToForum(ticketId, userId, message);

      const keyboard = new InlineKeyboard()
        .text(t("btnViewTicket"), `view_ticket_${ticketId}`)
        .row()
        .text(t("btnBackToMain"), "main_menu");

      await context.reply(t("ticketReplySent"), {
        reply_markup: keyboard,
      });

      ticketReplyState.delete(userId);
    } catch (error) {
      console.error("[TICKET] Error sending reply:", error);
      await context.reply(t("ticketReplyError"));
      ticketReplyState.delete(userId);
    }
  }
}
