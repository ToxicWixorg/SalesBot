import { scenes, scenesDerives } from "@gramio/scenes";
import { Composer } from "gramio";
import { greetingScene } from "../scenes/greeting.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";
import { enterDiscountCodeScene } from "../scenes/enter-discount-code.ts";
import { enterDiscountCodeOrderScene } from "../scenes/enter-discount-code-order.ts";
import { baseComposer, storage } from "./base.ts";

const scenesList = [
  greetingScene,
  languageSelectionScene,
  enterDiscountCodeScene,
  enterDiscountCodeOrderScene,
];

export const composer = new Composer({ name: "main" })
  .extend(baseComposer)
  .extend(scenesDerives(scenesList, { withCurrentScene: true, storage }))
  .extend(scenes(scenesList, { storage }))
  .as("scoped");

export type BotType = typeof composer;
