import { autoAnswerCallbackQuery } from "@gramio/auto-answer-callback-query";
import { autoRetry } from "@gramio/auto-retry";
import { Composer } from "gramio";
import { redis } from "../services/redis.ts";
import { i18n } from "../shared/locales/index.ts";

export const storage = {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : undefined;
  },
  async has(key: string) {
    return (await redis.exists(key)) === 1;
  },
  async set(key: string, value: unknown) {
    await redis.set(key, JSON.stringify(value));
  },
  async delete(key: string) {
    return (await redis.del(key)) === 1;
  },
};

export const baseComposer = new Composer({ name: "base" })
  .extend(autoAnswerCallbackQuery())
  .extend(autoRetry())
  .derive((context) => ({
    t: i18n.buildT(
      ((context as any).from || (context as any).update?.from)?.language_code ??
        "en",
    ),
  }))
  .as("scoped");
