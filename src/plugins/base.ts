import { autoAnswerCallbackQuery } from "@gramio/auto-answer-callback-query";
import { autoRetry } from "@gramio/auto-retry";
import { redisStorage } from "@gramio/storage-redis";
import { Composer } from "gramio";
import { redis } from "../services/redis.ts";
import { i18n } from "../shared/locales/index.ts";

export const storage = redisStorage(redis);

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
