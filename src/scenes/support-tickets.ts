import { Bot, AnyBot, InlineKeyboard } from "gramio";
import { TicketService } from "../services/bot/ticket";
import { TicketRepository } from "../repositories/TicketRepository";
import { i18n } from "../shared/locales/index";
import { UserRepository } from "../repositories/UserRepository";
import { config } from "../config";
import { emojiIds } from "../shared/locales/emojies.ts";
import { mainMenuKeyboard } from "../shared/keyboards/main-menu.ts";

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
  bot.callbackQuery("new_support_ticket", async (context) => {
    const user = await UserRepository.findById(context.from.id);
    if (!user) {
      return;
    }
    const t = i18n.buildT(user.languageCode || "en");

    ticketState.set(context.from.id, {
      type: "support",
      step: "message",
    });

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
        parse_mode: "HTML",
        show_alert: true,
      });
      return;
    }

    if (ticket.status === "closed") {
      await context.answerCallbackQuery({
        text: t("ticketAlreadyClosed"),
        parse_mode: "HTML",
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

    const keyboard = new InlineKeyboard().text(
      t("btnBackToMain"),
      "main_menu",
      { icon_custom_emoji_id: emojiIds.home },
    );

    await context.editText(t("ticketCreationCancelled"), {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  });

  /**
   * Unified message handler - handles both private chats and forum group
   */
  bot.on("message", async (context, next) => {
    const userId = context.from?.id;
    if (!userId) {
      return;
    }
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "en");

    if (!context.text) {
      return next();
    }

    if (context.chat?.type === "supergroup") {
      const chatId = context.chat.id.toString();
      const supportGroupId = config.SUPPORT_GROUP_ID?.replace("-100", "");

      if (!config.SUPPORT_GROUP_ID || !chatId.includes(supportGroupId || "")) {
        return;
      }

      const message =
        (context as any).update?.message || (context as any).payload;

      const replyToMessageId = message?.reply_to_message?.message_id;
      const messageThreadId = message?.message_thread_id;

      if (!replyToMessageId && !messageThreadId) {
        return;
      }

      const supportUserId = context.from?.id;
      const messageText = context.text;

      if (!supportUserId || !messageText) {
        return;
      }

      try {
        // Find ticket by thread message ID
        const ticket = await TicketRepository.getTicketByThreadMessageId(
          replyToMessageId || messageThreadId!,
        );
        if (!ticket) {
          return;
        }

        const ticketService = new TicketService(bot.api);
        await ticketService.sendSupportMessageToUser(
          ticket.id,
          supportUserId,
          messageText,
        );
      } catch (error) {
        console.error("[FORUM] Error handling support reply:", error);
      }

      return;
    }

    if (context.chat?.type === "private") {
      const inScene = (context as any).scene?.current;
      if (inScene) {
        return next();
      }

      if (ticketReplyState.has(userId)) {
        await handleTicketReply(context, userId);
        return;
      }

      const state = ticketState.get(userId);

      if (!state || state.step !== "message") {
        return next?.();
      }

      await handleTicketCreation(context, userId, state);
      return;
    }
  });

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
      await context.reply(t("ticketMessageTooShort"), { parse_mode: "HTML" });
      return;
    }

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
        keyboard.text(t("btnViewOrder"), `order_details_${state.orderId}`, {
          icon_custom_emoji_id: emojiIds.box,
        });
        keyboard.row();
      }

      keyboard.text(t("btnViewMyTickets"), "my_tickets", {
        icon_custom_emoji_id: emojiIds.clipboard,
      });
      keyboard.row();
      keyboard.text(t("btnBackToMain"), "main_menu", {
        icon_custom_emoji_id: emojiIds.home,
      });

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
      await context.reply(t("ticketCreateError"), { parse_mode: "HTML" });
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
      await context.reply(t("ticketMessageEmpty"), { parse_mode: "HTML" });
      return;
    }

    try {
      const ticketService = new TicketService(bot.api);

      await ticketService.sendUserMessageToForum(ticketId, userId, message);

      const keyboard = new InlineKeyboard()
        .text(t("btnViewTicket"), `view_ticket_${ticketId}`, {
          icon_custom_emoji_id: emojiIds.eye,
        })
        .row()
        .text(t("btnBackToMain"), "main_menu", {
          icon_custom_emoji_id: emojiIds.home,
        });

      await context.reply(t("ticketReplySent"), {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });

      ticketReplyState.delete(userId);
    } catch (error) {
      console.error("[TICKET] Error sending reply:", error);
      await context.reply(t("ticketReplyError"), { parse_mode: "HTML" });
      ticketReplyState.delete(userId);
    }
  }
}
