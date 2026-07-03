import { getForumConfig } from "../../forumConfig.ts";
import type { User } from "../../../db/schema.ts";

type BotApi = any;

export async function sendNewRefNotification(
  botApi: BotApi,
  user: User,
  inviter: User,
  totalReferrals: number,
) {
  const forum = await getForumConfig();
  if (!forum.notificationsEnabled) return; // group notifications turned off
  if (!forum.groupId || !forum.topics.new_referral) {
    console.warn(
      "[FORUM] SUPPORT_GROUP_ID or NEWREFERRAL_TOPIC_ID not configured",
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
      chat_id: forum.groupId,
      text: message,
      message_thread_id: forum.topics.new_referral,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("[FORUM] Failed to send new referral notification:", error);
  }
}
