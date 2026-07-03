import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { forumSettingsTable } from "../db/schema.ts";
import { config, type TicketType } from "../config.ts";
import { redis } from "./redis.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Forum config resolver
//
// The admin panel can override the Telegram forum group id and topic ids in the
// `forum_settings` table (single row, id=1). Any field left null falls back to
// the corresponding environment variable defined in config.ts.
//
// Values are cached in Redis for a short TTL. The admin panel deletes the cache
// key (`bot:forum-settings`) on save so changes take effect immediately.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_KEY = "bot:forum-settings";
const CACHE_TTL_SECONDS = 30;

export interface EffectiveForumConfig {
  /** Telegram forum group id (e.g. "-1001234567890"), or null if unset */
  groupId: string | null;
  /** Master switch for sending notifications to the group. Default OFF. */
  notificationsEnabled: boolean;
  topics: {
    support: number;
    order: number;
    report: number;
    new_users: number;
    news: number;
    new_referral: number;
    /** optional — falls back to `order` topic when unset */
    payments: number | null;
  };
}

function buildFromEnv(): EffectiveForumConfig {
  return {
    groupId: config.SUPPORT_GROUP_ID ?? null,
    // Notifications default to OFF; only the DB row can turn them on.
    notificationsEnabled: false,
    topics: {
      support: config.SUPPORT_TOPIC_ID,
      order: config.ORDERS_TOPIC_ID,
      report: config.REPORTS_TOPIC_ID,
      new_users: config.NEWUSERS_TOPIC_ID,
      news: config.NEWS_TOPIC_ID,
      new_referral: config.NEWREFERRAL_TOPIC_ID,
      payments: config.PAYMENTS_TOPIC_ID ?? null,
    },
  };
}

async function loadFromDb(): Promise<EffectiveForumConfig> {
  const env = buildFromEnv();

  const [row] = await db
    .select()
    .from(forumSettingsTable)
    .where(eq(forumSettingsTable.id, 1));

  if (!row) return env;

  // DB value wins when set (non-null); otherwise fall back to env.
  return {
    groupId: row.supportGroupId ?? env.groupId,
    notificationsEnabled: row.notificationsEnabled ?? false,
    topics: {
      support: row.supportTopicId ?? env.topics.support,
      order: row.ordersTopicId ?? env.topics.order,
      report: row.reportsTopicId ?? env.topics.report,
      new_users: row.newUsersTopicId ?? env.topics.new_users,
      news: row.newsTopicId ?? env.topics.news,
      new_referral: row.newReferralTopicId ?? env.topics.new_referral,
      payments: row.paymentsTopicId ?? env.topics.payments,
    },
  };
}

/**
 * Resolve the effective forum configuration (DB overrides with env fallback).
 * Cached in Redis for a short TTL; safe to call frequently.
 */
export async function getForumConfig(): Promise<EffectiveForumConfig> {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached) as EffectiveForumConfig;
  } catch {
    // Redis unavailable — fall through to DB read.
  }

  let cfg: EffectiveForumConfig;
  try {
    cfg = await loadFromDb();
  } catch (err) {
    console.error("[forumConfig] Failed to load from DB, using env:", err);
    return buildFromEnv();
  }

  try {
    await redis.set(CACHE_KEY, JSON.stringify(cfg), "EX", CACHE_TTL_SECONDS);
  } catch {
    // Non-fatal — value will just be re-read next time.
  }

  return cfg;
}

/**
 * Whether the bot is allowed to send notifications to the forum group.
 * Defaults to false (off) until an admin enables it in the panel.
 */
export async function areGroupNotificationsEnabled(): Promise<boolean> {
  const cfg = await getForumConfig();
  return cfg.notificationsEnabled;
}

/** Resolve the topic id for a given ticket type (support/order/report). */
export async function getTicketTopic(type: TicketType): Promise<number> {
  const cfg = await getForumConfig();
  return cfg.topics[type];
}

/** Clear the cached forum config (call after a direct DB update). */
export async function invalidateForumConfigCache(): Promise<void> {
  try {
    await redis.del(CACHE_KEY);
  } catch {
    // Non-fatal.
  }
}
