import { getForumConfig } from "../../forumConfig.ts";

type BotApi = any;

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
  const forum = await getForumConfig();
  if (!forum.groupId || !forum.topics.news) {
    console.warn("[FORUM] SUPPORT_GROUP_ID or NEWS_TOPIC_ID not configured");
    return;
  }

  try {
    const result = await botApi.sendMessage({
      chat_id: forum.groupId,
      text,
      message_thread_id: forum.topics.news,
      parse_mode: options?.parse_mode ?? "HTML",
      disable_web_page_preview: options?.disable_web_page_preview ?? false,
    });
    return result;
  } catch (error) {
    throw error;
  }
}
