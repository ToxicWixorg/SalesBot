import { scenes } from "@gramio/scenes";
import { Composer } from "gramio";
import { greetingScene } from "../scenes/greeting.ts";
import { baseComposer, storage } from "./base.ts";

export const composer = new Composer({ name: "main" })
	.extend(baseComposer)
	.extend(scenes([greetingScene], { storage }))
	.as("scoped");

export type BotType = typeof composer;
