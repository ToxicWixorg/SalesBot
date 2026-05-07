import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";

export const TopicComposer = new Composer()
  .extend(composer)
  .command("Topics", async (context) => {
    if (!context.chat) {
      return;
    }

    const threadId = context.update?.message?.message_thread_id;
    if (threadId) {

      await context.send(
        `📊 <b>Forum/Topic Info:</b>\n\n` +
          `🆔 Chat ID: <code>${context.chat.id}</code>\n` +
          `📌 Topic ID: <code>${threadId}</code>\n` +
          `📝 Chat Title: ${context.chat.title || "N/A"}\n` +
          `🔖 Chat Type: ${context.chat.type}`,
        { parse_mode: "HTML" },
      );
    } else {
      await context.send(
        `📊 <b>Chat Info:</b>\n\n` +
          `🆔 Chat ID: <code>${context.chat.id}</code>\n` +
          `📝 Chat Title: ${context.chat.title || "N/A"}\n` +
          `🔖 Chat Type: ${context.chat.type}\n\n` +
          `ℹ️ This message is not in a topic/thread.`,
        { parse_mode: "HTML" },
      );
    }
  });
