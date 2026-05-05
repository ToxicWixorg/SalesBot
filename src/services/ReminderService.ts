/**
 * ReminderService — runs every minute, finds sessions starting in ~15 minutes,
 * sends a reminder message to the user via Telegram, then marks reminder sent.
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

export function startReminderService(bot: AnyBot) {
  setInterval(async () => {
    try {
      await checkAndSendReminders(bot);
    } catch (err) {
      console.error("[ReminderService] Error:", err);
    }
  }, 60_000); // every minute
}

async function checkAndSendReminders(bot: AnyBot) {
  const now = new Date();

  // Target: sessions that start in 14–16 minutes (2-minute window to handle timing variance)
  const minTarget = new Date(now.getTime() + 14 * 60_000);
  const maxTarget = new Date(now.getTime() + 16 * 60_000);

  const minTime = `${String(minTarget.getHours()).padStart(2, "0")}:${String(minTarget.getMinutes()).padStart(2, "0")}`;
  const maxTime = `${String(maxTarget.getHours()).padStart(2, "0")}:${String(maxTarget.getMinutes()).padStart(2, "0")}`;
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Fetch unsent reminders for today that haven't been sent yet
  const schedules = await db
    .select({
      schedule: schedulesTable,
      user: {
        id: usersTable.id,
        languageCode: usersTable.languageCode,
      },
      order: {
        id: ordersTable.id,
      },
      product: {
        name: productsTable.name,
      },
    })
    .from(schedulesTable)
    .leftJoin(usersTable, eq(schedulesTable.userId, usersTable.id))
    .leftJoin(ordersTable, eq(schedulesTable.orderId, ordersTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(
      and(
        eq(schedulesTable.date, dateStr),
        eq(schedulesTable.reminderSent, false),
      ),
    );

  for (const row of schedules) {
    const { schedule, user, order, product } = row;

    // Check if timeSlot start falls within the 14-16 minute window
    const slotStart = schedule.timeSlot.split("-")[0]?.trim(); // "09:00-10:00" → "09:00"
    if (!slotStart || slotStart < minTime || slotStart > maxTime) continue;

    const userId = schedule.userId ?? user?.id;
    if (!userId) continue;

    const lang = user?.languageCode ?? "en";
    const t = i18n.buildT(lang);

    try {
      await bot.api.sendMessage({
        chat_id: userId,
        text: t("scheduleReminderNotification", {
          orderId: order?.id ?? 0,
          productName: product?.name ?? "Session",
          timeSlot: schedule.timeSlot,
        }),
        parse_mode: "HTML",
      });

      await db
        .update(schedulesTable)
        .set({ reminderSent: true, updatedAt: new Date() })
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
