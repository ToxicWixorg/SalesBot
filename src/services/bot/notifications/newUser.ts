import { getForumConfig } from "../../forumConfig.ts";
import type { User } from "../../../db/schema.ts";

type BotApi = any;

export async function sendNewUserNotification(botApi: BotApi, user: User) {
  const forum = await getForumConfig();
  if (!forum.groupId || !forum.topics.new_users) {
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
    await botApi.sendMessage({
      chat_id: forum.groupId,
      text: message,
      message_thread_id: forum.topics.new_users,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("[FORUM] Failed to send new user notification:", error);
  }
}
