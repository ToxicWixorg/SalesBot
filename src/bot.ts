import { Bot } from "gramio";
import { config } from "./config.ts";
import { startComposer } from "./handlers/start.ts";
import { composer } from "./plugins/index.ts";

export const bot = new Bot(config.BOT_TOKEN)
  .extend(startComposer)
  .extend(composer)
  .onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`))
  .onError(({ context, error }) => {
    console.error("[Error Handler] Error occurred:", error);
    console.error("[Error Handler] Context type:", context.constructor.name);
    console.error("[Error Handler] Stack:", error.stack);

    if (context.is("message") && context.chat) {
      context
        .send("⚠️ An internal error occurred. Please try again later.")
        .catch(() => {});
    }
  });
