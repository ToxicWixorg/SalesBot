/**
 * ReminderService — runs every minute:
 *  1. Finds sessions starting in ~15 min → notifies user AND admin forum
 *  2. Finds sessions starting NOW (T=0)  → creates ticket, sets in_progress,
 *     notifies user + admin forum so delivery chat can begin
 */

import type { AnyBot } from "gramio";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  schedulesTable,
  usersTable,
  ordersTable,
  productsTable,
} from "../db/schema.ts";
import { i18n } from "../shared/locales/index.ts";
import { config } from "../config.ts";
import { ScheduleRepository } from "../repositories/ScheduleRepository.ts";
import { OrderRepository } from "../repositories/OrderRepository.ts";
import { TicketService } from "./bot/ticket.ts";

// ─── helpers ─────────────────────────────────────────────────────────────────

function todayStr(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function timeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── public entry point ───────────────────────────────────────────────────────

export function startReminderService(bot: AnyBot) {
  setInterval(async () => {
    try {
      await checkAndSendReminders(bot);
      await checkAndStartSessions(bot);
    } catch (err) {
      console.error("[ReminderService] Error:", err);
    }
  }, 60_000); // every minute
}

// ─── 15-minute reminder (user + admin) ───────────────────────────────────────

async function checkAndSendReminders(bot: AnyBot) {
  const now = new Date();

  // 2-minute window: 14–16 minutes ahead
  const minTarget = new Date(now.getTime() + 14 * 60_000);
  const maxTarget = new Date(now.getTime() + 16 * 60_000);
  const minTime = timeStr(minTarget);
  const maxTime = timeStr(maxTarget);
  const date = todayStr(now);

  const rows = await db
    .select({
      schedule: schedulesTable,
      user: {
        id: usersTable.id,
        username: usersTable.username,
        firstName: usersTable.firstName,
        languageCode: usersTable.languageCode,
      },
      order: { id: ordersTable.id },
      product: { name: productsTable.name },
    })
    .from(schedulesTable)
    .leftJoin(usersTable, eq(schedulesTable.userId, usersTable.id))
    .leftJoin(ordersTable, eq(schedulesTable.orderId, ordersTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(
      and(
        eq(schedulesTable.date, date),
        eq(schedulesTable.reminderSent, false),
      ),
    );

  for (const row of rows) {
    const { schedule, user, order, product } = row;

    const slotStart = schedule.timeSlot.split("-")[0]?.trim();
    if (!slotStart || slotStart < minTime || slotStart > maxTime) continue;

    const userId = schedule.userId ?? user?.id;
    if (!userId) continue;

    const lang = user?.languageCode ?? "en";
    const t = i18n.buildT(lang);

    try {
      // ── Notify user ──────────────────────────────────────────────────────
      await bot.api.sendMessage({
        chat_id: userId,
        text: t("scheduleReminderNotification", {
          orderId: order?.id ?? 0,
          productName: product?.name ?? "Session",
          timeSlot: schedule.timeSlot,
        }),
        parse_mode: "HTML",
      });

      // ── Notify admin forum (ORDERS topic) ────────────────────────────────
      if (config.SUPPORT_GROUP_ID && config.ORDERS_TOPIC_ID) {
        const displayName = user?.username
          ? `@${user.username}`
          : (user?.firstName ?? String(userId));
        const adminMsg =
          `⚠️ <b>Session in 15 minutes</b>\n\n` +
          `👤 User: ${displayName} (<code>${userId}</code>)\n` +
          `📦 Product: <b>${product?.name ?? "—"}</b>\n` +
          `⏰ Time slot: <b>${schedule.timeSlot}</b>\n` +
          `🆔 Order: #${order?.id ?? "—"}\n\n` +
          `Please be ready to deliver login credentials.`;

        await bot.api.sendMessage({
          chat_id: Number(config.SUPPORT_GROUP_ID),
          message_thread_id: config.ORDERS_TOPIC_ID,
          text: adminMsg,
          parse_mode: "HTML",
        });
      }

      // ── Mark sent ────────────────────────────────────────────────────────
      await db
        .update(schedulesTable)
        .set({
          reminderSent: true,
          reminderTime: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schedulesTable.id, schedule.id));

      console.log(
        `[ReminderService] Reminder sent to user ${userId} for schedule ${schedule.id}`,
      );
    } catch (err) {
      console.error(
        `[ReminderService] Failed to send reminder to user ${userId}:`,
        err,
      );
    }
  }
}

// ─── T=0: session start notifications ────────────────────────────────────────

async function checkAndStartSessions(bot: AnyBot) {
  const now = new Date();
  const date = todayStr(now);
  const currentTime = timeStr(now);

  const sessions = await ScheduleRepository.findSessionsStartingNow(
    date,
    currentTime,
  );

  if (sessions.length === 0) return;

  const ticketService = new TicketService(bot.api);

  for (const row of sessions) {
    const { schedule, user, order, product } = row;

    const userId = schedule.userId ?? user?.id;
    if (!userId || !order?.id) continue;

    try {
      // 1. Auto-create an order ticket so admin can chat with the user
      const ticket = await ticketService.createTicket({
        userId: Number(userId),
        type: "order",
        orderId: order.id,
        title: `Session: ${product?.name ?? "Product"} — ${schedule.timeSlot}`,
        description:
          `🚀 Session started automatically.\n` +
          `Time slot: ${schedule.timeSlot}\n` +
          `Please send login credentials in this thread.`,
        priority: "high",
      });

      // 2. Update order status → in_progress
      await OrderRepository.updateStatus(order.id, "in_progress");

      // 3. Mark schedule as started & link ticket
      await ScheduleRepository.markSessionStartNotified(schedule.id, ticket.id);

      // 4. Notify user
      const lang = user?.languageCode ?? "en";
      const t = i18n.buildT(lang);
      await bot.api.sendMessage({
        chat_id: userId,
        text: t("sessionStartedUser", {
          orderId: order.id,
          productName: product?.name ?? "Session",
          timeSlot: schedule.timeSlot,
        }),
        parse_mode: "HTML",
      });

      // 5. Notify admin forum
      if (config.SUPPORT_GROUP_ID && config.ORDERS_TOPIC_ID) {
        const displayName = user?.username
          ? `@${user.username}`
          : (user?.firstName ?? String(userId));
        const forumMsg =
          `🚀 <b>Session Started</b>\n\n` +
          `👤 User: ${displayName} (<code>${userId}</code>)\n` +
          `📦 Product: <b>${product?.name ?? "—"}</b>\n` +
          `⏰ Time slot: <b>${schedule.timeSlot}</b>\n` +
          `🆔 Order: #${order.id}\n` +
          `🎫 Ticket: <code>${ticket.ticketNumber}</code>\n\n` +
          `Send login credentials to the user now.`;

        await bot.api.sendMessage({
          chat_id: Number(config.SUPPORT_GROUP_ID),
          message_thread_id: config.ORDERS_TOPIC_ID,
          text: forumMsg,
          parse_mode: "HTML",
        });
      }

      console.log(
        `[ReminderService] Session started for user ${userId}, order ${order.id}, ticket ${ticket.id}`,
      );
    } catch (err) {
      console.error(
        `[ReminderService] Failed to start session for schedule ${schedule.id}:`,
        err,
      );
    }
  }
}
