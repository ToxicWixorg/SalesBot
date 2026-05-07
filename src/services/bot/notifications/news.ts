import { config } from "../../../config.ts";

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
  if (!config.SUPPORT_GROUP_ID || !config.NEWS_TOPIC_ID) {
    console.warn("[FORUM] SUPPORT_GROUP_ID or NEWS_TOPIC_ID not configured");
    return;
  }

  try {
    const result = await botApi.sendMessage({
      chat_id: config.SUPPORT_GROUP_ID,
      text,
      message_thread_id: config.NEWS_TOPIC_ID,
      parse_mode: options?.parse_mode ?? "HTML",
      disable_web_page_preview: options?.disable_web_page_preview ?? false,
    });
    return result;
  } catch (error) {
    throw error;
  }
}
