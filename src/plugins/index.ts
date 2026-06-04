import { scenes, scenesDerives } from "@gramio/scenes";
import { Composer } from "gramio";
import { languageSelectionScene } from "../scenes/language-selection.ts";
import { enterCustomEmojiIdsScene } from "../scenes/enter-custom-emoji-ids.ts";
import { enterDiscountCodeScene } from "../scenes/enter-discount-code.ts";
import { enterDiscountCodeOrderScene } from "../scenes/enter-discount-code-order.ts";
import { baseComposer, storage } from "./base.ts";

const scenesList = [
  languageSelectionScene,
  enterCustomEmojiIdsScene,
  enterDiscountCodeScene,
  enterDiscountCodeOrderScene,
];

export const composer = new Composer({ name: "main" })
  .extend(baseComposer)
  .extend(scenesDerives(scenesList, { withCurrentScene: true, storage }))
  .extend(scenes(scenesList, { storage }))
  .as("scoped");

export type BotType = typeof composer;
