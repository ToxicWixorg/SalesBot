import { autoAnswerCallbackQuery } from "@gramio/auto-answer-callback-query";
import { autoRetry } from "@gramio/auto-retry";
import { Composer } from "gramio";
import { redis } from "../services/redis.ts";
import { i18n } from "../shared/locales/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";

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
  .derive(async (context) => {
    // Get user's preferred language from database
    let userLanguage = "en"; // default

    const userId =
      (context as any).from?.id || (context as any).update?.from?.id;

    if (userId) {
      try {
        const user = await UserRepository.findById(userId);
        if (user?.languageCode) {
          userLanguage = user.languageCode;
        } else {
          // Fallback to Telegram language if not set in DB
          userLanguage =
            (context as any).from?.language_code ||
            (context as any).update?.from?.language_code ||
            "en";
        }
      } catch (error) {
        // If error, use Telegram language or default
        userLanguage =
          (context as any).from?.language_code ||
          (context as any).update?.from?.language_code ||
          "en";
      }
    }

    return {
      t: i18n.buildT(userLanguage),
    };
  })
  .as("scoped");
