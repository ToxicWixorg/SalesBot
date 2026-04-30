import { config } from "../config.ts";
import type { User } from "../db/schema.ts";

type BotApi = {
  sendMessage: (
    chatId: string | number,
    text: string,
    options?: Record<string, unknown>,
  ) => Promise<any>;
};

export async function sendNewUserNotification(botApi: BotApi, user: User) {
  if (!config.SUPPORT_GROUP_ID || !config.NEWUSERS_TOPIC_ID) {
    console.warn(
      "[FORUM] SUPPORT_GROUP_ID or NEWUSERS_TOPIC_ID not configured",
    );
    return;
  }

  const username = user.username ? `@${user.username}` : "—";
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const referredBy = user.referredBy
    ? `\n👥 <b>Referred by:</b> <code>${user.referredBy}</code>`
    : "";
  const joinedAt = new Date().toLocaleString("en-GB", { timeZone: "UTC" });

  const message =
    `🆕 <b>New User Registered</b>\n\n` +
    `👤 <b>Name:</b> ${fullName}\n` +
    `🔖 <b>Username:</b> ${username}\n` +
    `🆔 <b>User ID:</b> <code>${user.id}</code>` +
    referredBy +
    `\n🌐 <b>Language:</b> ${user.languageCode || "not set"}\n` +
    `⏰ <b>Time (UTC):</b> ${joinedAt}`;

  try {
    await botApi.sendMessage(config.SUPPORT_GROUP_ID, message, {
      message_thread_id: config.NEWUSERS_TOPIC_ID,
      parse_mode: "HTML",
    });
    console.log(`[FORUM] New user notification sent for user ${user.id}`);
  } catch (error) {
    console.error("[FORUM] Failed to send new user notification:", error);
  }
}

/**
 * Send a news/announcement message to the News topic in the support group
 * Use this to broadcast announcements to the news topic
 *
 * @example
 * await sendNewsMessage(bot.api, "🎉 New feature released!");
 */
export async function sendNewsMessage(
  botApi: BotApi,
  text: string,
  options?: {
    parse_mode?: "HTML" | "Markdown";
    disable_web_page_preview?: boolean;
  },
) {
  if (!config.SUPPORT_GROUP_ID || !config.NEWS_TOPIC_ID) {
    console.warn("[FORUM] SUPPORT_GROUP_ID or NEWS_TOPIC_ID not configured");
    return;
  }

  try {
    const result = await botApi.sendMessage(config.SUPPORT_GROUP_ID, text, {
      message_thread_id: config.NEWS_TOPIC_ID,
      parse_mode: options?.parse_mode ?? "HTML",
      disable_web_page_preview: options?.disable_web_page_preview ?? false,
    });
    console.log(`[FORUM] News message sent to topic ${config.NEWS_TOPIC_ID}`);
    return result;
  } catch (error) {
    console.error("[FORUM] Failed to send news message:", error);
    throw error;
  }
}
