import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { text } from "drizzle-orm/sqlite-core/columns/text";

export const startComposer = new Composer()
  .extend(composer)
  .command("start", (context) => {
    const text = `Welcome to the bot! Use /help to see available commands.\nid: ${context.from?.id}\nusername: @${context.from?.username}\nchatId: ${context.chat.id}`;
    context.send(text);
  });
