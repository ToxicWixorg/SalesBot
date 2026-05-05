import type { AnyBot } from "gramio";

let _bot: AnyBot | null = null;

export const setBotInstance = (b: AnyBot) => {
  _bot = b;
};

export const getBotInstance = (): AnyBot => {
  if (!_bot) throw new Error("Bot instance not initialized yet");
  return _bot;
};
