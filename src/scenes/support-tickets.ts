import { Scene } from "grammy-scenes";
import type { BotContext } from "../bot";
import { TicketService } from "../services/ticket";
import { TicketRepository } from "../repositories/TicketRepository";
import { InlineKeyboard } from "grammy";

/**
 * Scene for creating a general support ticket
 */
export const createSupportTicketScene = new Scene<BotContext>(
  "create-support-ticket",
);

createSupportTicketScene.do(async (ctx) => {
  const t = ctx.t;

  await ctx.reply(t("ticketSupportPrompt"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: t("btnCancel"), callback_data: "cancel_ticket" }],
      ],
    },
  });
});

createSupportTicketScene.wait().on("message:text", async (ctx) => {
  const t = ctx.t;
  const message = ctx.message.text;

  if (!message || message.length < 10) {
    await ctx.reply(t("ticketMessageTooShort"));
    return;
  }

  try {
    const ticketService = new TicketService(ctx.api);

    // Create support ticket
    const ticket = await ticketService.createTicket({
      userId: ctx.from.id,
      type: "support",
      title: message.substring(0, 100), // First 100 chars as title
      description: message,
      priority: "normal",
    });

    await ctx.reply(
      t("ticketCreatedSuccess", {
        ticketNumber: ticket.ticketNumber,
      }),
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: t("btnViewMyTickets"),
                callback_data: "my_tickets",
              },
            ],
            [
              {
                text: t("btnBackToMain"),
                callback_data: "main_menu",
              },
            ],
          ],
        },
      },
    );

    await ctx.scene.exit();
  } catch (error) {
    console.error("[SCENE] Error creating support ticket:", error);
    await ctx.reply(t("ticketCreateError"));
    await ctx.scene.exit();
  }
});

/**
 * Scene for creating a ticket for an order
 */
export const createOrderTicketScene = new Scene<BotContext>(
  "create-order-ticket",
);

createOrderTicketScene.do(async (ctx) => {
  const t = ctx.t;
  const orderId = ctx.scene.opts.arg as number;

  if (!orderId) {
    await ctx.reply(t("ticketOrderNotFound"));
    await ctx.scene.exit();
    return;
  }

  ctx.scene.session.orderId = orderId;

  await ctx.reply(t("ticketOrderPrompt"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: t("btnCancel"), callback_data: "cancel_ticket" }],
      ],
    },
  });
});

createOrderTicketScene.wait().on("message:text", async (ctx) => {
  const t = ctx.t;
  const message = ctx.message.text;
  const orderId = ctx.scene.session.orderId;

  if (!message || message.length < 10) {
    await ctx.reply(t("ticketMessageTooShort"));
    return;
  }

  try {
    const ticketService = new TicketService(ctx.api);

    // Create order ticket
    const ticket = await ticketService.createTicket({
      userId: ctx.from.id,
      type: "order",
      title: `Order #${orderId} - ${message.substring(0, 80)}`,
      description: message,
      orderId: orderId,
      priority: "high", // Order issues are higher priority
    });

    await ctx.reply(
      t("ticketCreatedSuccess", {
        ticketNumber: ticket.ticketNumber,
      }),
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: t("btnViewOrder"),
                callback_data: `order_details_${orderId}`,
              },
            ],
            [
              {
                text: t("btnViewMyTickets"),
                callback_data: "my_tickets",
              },
            ],
          ],
        },
      },
    );

    await ctx.scene.exit();
  } catch (error) {
    console.error("[SCENE] Error creating order ticket:", error);
    await ctx.reply(t("ticketCreateError"));
    await ctx.scene.exit();
  }
});

/**
 * Scene for creating a problem report ticket
 */
export const createReportTicketScene = new Scene<BotContext>(
  "create-report-ticket",
);

createReportTicketScene.do(async (ctx) => {
  const t = ctx.t;

  await ctx.reply(t("ticketReportPrompt"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: t("btnCancel"), callback_data: "cancel_ticket" }],
      ],
    },
  });
});

createReportTicketScene.wait().on("message:text", async (ctx) => {
  const t = ctx.t;
  const message = ctx.message.text;

  if (!message || message.length < 10) {
    await ctx.reply(t("ticketMessageTooShort"));
    return;
  }

  try {
    const ticketService = new TicketService(ctx.api);

    // Create report ticket
    const ticket = await ticketService.createTicket({
      userId: ctx.from.id,
      type: "report",
      title: message.substring(0, 100),
      description: message,
      priority: "high", // Reports are important
    });

    await ctx.reply(
      t("ticketCreatedSuccess", {
        ticketNumber: ticket.ticketNumber,
      }),
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: t("btnViewMyTickets"),
                callback_data: "my_tickets",
              },
            ],
            [
              {
                text: t("btnBackToMain"),
                callback_data: "main_menu",
              },
            ],
          ],
        },
      },
    );

    await ctx.scene.exit();
  } catch (error) {
    console.error("[SCENE] Error creating report ticket:", error);
    await ctx.reply(t("ticketCreateError"));
    await ctx.scene.exit();
  }
});

/**
 * Scene for replying to a ticket
 */
export const replyToTicketScene = new Scene<BotContext>("reply-to-ticket");

replyToTicketScene.do(async (ctx) => {
  const t = ctx.t;
  const ticketId = ctx.scene.opts.arg as number;

  if (!ticketId) {
    await ctx.reply(t("ticketNotFound"));
    await ctx.scene.exit();
    return;
  }

  const ticket = await TicketRepository.getTicketById(ticketId);

  if (!ticket) {
    await ctx.reply(t("ticketNotFound"));
    await ctx.scene.exit();
    return;
  }

  if (ticket.userId !== ctx.from.id) {
    await ctx.reply(t("ticketNotYours"));
    await ctx.scene.exit();
    return;
  }

  if (ticket.status === "closed") {
    await ctx.reply(t("ticketAlreadyClosed"));
    await ctx.scene.exit();
    return;
  }

  ctx.scene.session.ticketId = ticketId;

  await ctx.reply(
    t("ticketReplyPrompt", {
      ticketNumber: ticket.ticketNumber,
    }),
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: t("btnCancel"), callback_data: "cancel_ticket_reply" }],
        ],
      },
    },
  );
});

replyToTicketScene.wait().on("message:text", async (ctx) => {
  const t = ctx.t;
  const message = ctx.message.text;
  const ticketId = ctx.scene.session.ticketId;

  if (!message) {
    await ctx.reply(t("ticketMessageEmpty"));
    return;
  }

  try {
    const ticketService = new TicketService(ctx.api);

    // Send message to forum
    await ticketService.sendUserMessageToForum(ticketId, ctx.from.id, message);

    await ctx.reply(t("ticketReplySent"), {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: t("btnViewTicket"),
              callback_data: `view_ticket_${ticketId}`,
            },
          ],
          [
            {
              text: t("btnBackToMain"),
              callback_data: "main_menu",
            },
          ],
        ],
      },
    });

    await ctx.scene.exit();
  } catch (error) {
    console.error("[SCENE] Error sending ticket reply:", error);
    await ctx.reply(t("ticketReplyError"));
    await ctx.scene.exit();
  }
});
