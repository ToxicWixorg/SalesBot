import { Bot, InlineKeyboard } from "gramio";
import { TicketService } from "../services/ticket";
import { TicketRepository } from "../repositories/TicketRepository";
import { i18n } from "../shared/locales/index";
import { UserRepository } from "../repositories/UserRepository";

/**
 * State management for ticket creation
 */
const ticketState = new Map<
  number,
  {
    type: "support" | "order" | "report";
    orderId?: number;
    step: "message";
  }
>();

// Separate state for ticket replies
const ticketReplyState = new Map<number, number>(); // userId -> ticketId

export function setupTicketScenes(bot: Bot) {
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
    });

    await context.answerCallbackQuery();
  });

  /**
   * Handle incoming messages for ticket creation
   */
  bot.on("message", async (context) => {
    console.log("[DEBUG] Message handler in support-tickets.ts triggered!");
    console.log("[DEBUG] Context type:", context.constructor.name);
    console.log("[DEBUG] Chat type:", context.chat?.type);
    
    const userId = context.from?.id;
    if (!userId || !context.text) {
      console.log("[DEBUG] No userId or text, returning");
      return;
    }
    
    // Only handle private chats
    if (context.chat?.type !== "private") {
      console.log("[DEBUG] Not a private chat, returning");
      return;
    }
    
    // Check if user is in a scene
    const inScene = (context as any).scene?.current;
    if (inScene) {
      console.log("[DEBUG] User is in scene:", inScene, "- skipping");
      userId,
      "- State:",
      ticketState.has(userId),
      "- Reply state:",
      ticketReplyState.has(userId),
    );

    // Check if replying to existing ticket
    if (ticketReplyState.has(userId)) {
      await handleTicketReply(context, userId);
      return;
    }

    // Check if creating new ticket
    const state = ticketState.get(userId);
    if (!state || state.step !== "message") return;

    await handleTicketCreation(context, userId, state);
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
