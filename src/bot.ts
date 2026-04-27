import { Bot } from "gramio";
import { config } from "./config.ts";
import { startComposer } from "./handlers/start.ts";
import { composer } from "./plugins/index.ts";

export const bot = new Bot(config.BOT_TOKEN)
	.extend(composer)
	.extend(startComposer)
	.onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`));
