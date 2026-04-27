import "./setup.ts";
import { expect, test } from "bun:test";
import { TelegramTestEnvironment } from "@gramio/test";
import { bot } from "../src/bot.ts";

test("/start command", async () => {
	const env = new TelegramTestEnvironment(bot);
	const user = env.createUser();

	await user.sendMessage("/start");

	expect(env.lastApiCall("sendMessage")?.params.text).toBe("Hi!");
});
