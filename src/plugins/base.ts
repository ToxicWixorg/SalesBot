import { autoAnswerCallbackQuery } from "@gramio/auto-answer-callback-query";
import { autoRetry } from "@gramio/auto-retry";
import { Composer } from "gramio";
import { eq } from "drizzle-orm";
import { redis } from "../services/redis.ts";
import { db } from "../db/index.ts";
import { botSettingsTable } from "../db/schema.ts";
import { i18n } from "../shared/locales/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { config } from "../config.ts";

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

// ── Helper: read bot settings with 30-second Redis cache ─────────────────────
const BOT_SETTINGS_KEY = "bot:settings";

export async function getBotSettings() {
  try {
    const cached = await redis.get(BOT_SETTINGS_KEY);
    if (cached !== null) {
      return JSON.parse(cached) as {
        maintenanceMode: boolean;
        maintenanceMessage: string | null;
        referralEnabled: boolean;
        shopEnabled: boolean;
      };
    }
    const [row] = await db
      .select()
      .from(botSettingsTable)
      .where(eq(botSettingsTable.id, 1));
    const result = {
      maintenanceMode: row?.maintenanceMode ?? false,
      maintenanceMessage: row?.maintenanceMessage ?? null,
      referralEnabled: row?.referralEnabled ?? true,
      shopEnabled: row?.shopEnabled ?? true,
    };
    await redis.set(BOT_SETTINGS_KEY, JSON.stringify(result), "EX", 30);
    return result;
  } catch {
    // fail open
    return {
      maintenanceMode: false,
      maintenanceMessage: null,
      referralEnabled: true,
      shopEnabled: true,
    };
  }
}

export const baseComposer = new Composer({ name: "base" })
  .extend(autoAnswerCallbackQuery())
  .extend(autoRetry())
  // ── Maintenance mode — checked first, skipped for owner ───────────────────
  .use(async (context, next) => {
    const userId =
      (context as any).from?.id ?? (context as any).update?.from?.id;

    // Owner always bypasses maintenance
    if (userId && userId === config.OWNER_ID) return next();

    try {
      const settings = await getBotSettings();

      if (settings.maintenanceMode) {
        const lang =
          (context as any).from?.language_code ||
          (context as any).update?.from?.language_code ||
          "fa";
        const t = i18n.buildT(lang);
        const text = settings.maintenanceMessage
          ? t("botMaintenanceCustom", settings.maintenanceMessage)
          : t("botMaintenance");

        if ("send" in context && typeof (context as any).send === "function") {
          await (context as any).send(text, { parse_mode: "HTML" });
        }
        return; // stop chain
      }
    } catch {
      // fail open — let request through if DB/Redis is unavailable
    }

    return next();
  })
  // ── Block check — must run before any handler ──────────────────────────────
  .use(async (context, next) => {
    const userId =
      (context as any).from?.id ?? (context as any).update?.from?.id;

    if (!userId) return next();

    try {
      const user = await UserRepository.findById(userId);
      if (user?.isBlocked) {
        const t = i18n.buildT(user.languageCode ?? "fa");
        const text = user.blockedReason
          ? t("userBlockedWithReason", user.blockedReason)
          : t("userBlocked");

        if ("send" in context && typeof (context as any).send === "function") {
          await (context as any).send(text, { parse_mode: "HTML" });
        }
        // Do NOT call next() — stop the chain entirely
        return;
      }
    } catch {
      // If DB is unreachable, fail open (let the request through)
    }

    return next();
  })
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
