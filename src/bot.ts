import { Bot } from "gramio";
import { config } from "./config.ts";
import { startComposer } from "./handlers/start.ts";
import { composer } from "./plugins/index.ts";

export const bot = new Bot(config.BOT_TOKEN)
  .extend(composer)
  .extend(startComposer)
  .onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`))
  .onError(({ context, error }) => {
    console.error("[Error Handler]", error);
    if (context.is("message") && context.chat) {
      context
        .send("⚠️ An internal error occurred. Please try again later.")
        .catch(() => {});
    }
  });
