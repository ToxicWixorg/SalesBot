import { config } from "../../../config.ts";
import type { User } from "../../../db/schema.ts";

type BotApi = any;

export async function sendNewRefNotification(
  botApi: BotApi,
  user: User,
  inviter: User,
  totalReferrals: number,
) {
  if (!config.SUPPORT_GROUP_ID || !config.NEWUSERS_TOPIC_ID) {
    console.warn(
      "[FORUM] SUPPORT_GROUP_ID or NEWUSERS_TOPIC_ID not configured",
    );
    return;
  }

  const inviterName =
    [inviter.firstName, inviter.lastName].filter(Boolean).join(" ") || "—";
  const inviterUsername = inviter.username ? `@${inviter.username}` : "—";

  const newUserName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const newUserUsername = user.username ? `@${user.username}` : "—";

  const message =
    `🔗 <b>New Referral</b>\n\n` +
    `👤 <b>Inviter:</b>\n` +
    `▫️ <b>Name:</b> ${inviterName}\n` +
    `⚡️ <b>Username:</b> ${inviterUsername}\n` +
    `🆔 <b>ID:</b> <code>${inviter.id}</code>\n` +
    `👥 <b>Total Referrals:</b> ${totalReferrals}\n\n` +
    `🆕 <b>New User (Referral):</b>\n` +
    `▫️ <b>Name:</b> ${newUserName}\n` +
    `⚡️ <b>Username:</b> ${newUserUsername}\n` +
    `🆔 <b>ID:</b> <code>${user.id}</code>`;

  try {
    await botApi.sendMessage({
      chat_id: config.SUPPORT_GROUP_ID,
      text: message,
      message_thread_id: config.NEWUSERS_TOPIC_ID,
      parse_mode: "HTML",
    });
    console.log(`[FORUM] New user notification sent for user ${user.id}`);
  } catch (error) {
    console.error("[FORUM] Failed to send new user notification:", error);
  }
}
