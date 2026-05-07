import env from "env-var";

export const config = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "test", "development"]),
  BOT_TOKEN: env.get("BOT_TOKEN").required().asString(),

  // Owner (مالک ربات) — دارای بالاترین سطح دسترسی
  OWNER_ID: env.get("OWNER_ID").required().asInt(),

  DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  REDIS_HOST: env.get("REDIS_HOST").default("localhost").asString(),
  REDIS_PORT: env.get("REDIS_PORT").default(6379).asInt(),
  LOCK_STORE: env
    .get("LOCK_STORE")
    .default("memory")
    .asEnum(["memory", "redis"]),

  // Force Join Channels/Groups (comma-separated)
  // FORCE_JOIN_CHANNEL_IDS: e.g. "@MyChannel,-1001234567890"
  // FORCE_JOIN_CHANNEL_URLS: e.g. "https://t.me/MyChannel,https://t.me/+inviteHash"
  // FORCE_JOIN_CHANNEL_NAMES: e.g. "My Channel,My Group"
  FORCE_JOIN_CHANNEL_IDS: env
    .get("FORCE_JOIN_CHANNEL_IDS")
    .default("")
    .asString(),
  FORCE_JOIN_CHANNEL_URLS: env
    .get("FORCE_JOIN_CHANNEL_URLS")
    .default("")
    .asString(),
  FORCE_JOIN_CHANNEL_NAMES: env
    .get("FORCE_JOIN_CHANNEL_NAMES")
    .default("")
    .asString(),

  // Support Forum Group (Telegram Forum)
  SUPPORT_GROUP_ID: env.get("SUPPORT_GROUP_ID").asString(), // e.g., "-1001234567890"

  // Forum Topics IDs
  SUPPORT_TOPIC_ID: env.get("SUPPORT_TOPIC_ID").required().asInt(), // General support tickets
  ORDERS_TOPIC_ID: env.get("ORDERS_TOPIC_ID").required().asInt(), // Order-related tickets
  REPORTS_TOPIC_ID: env.get("REPORTS_TOPIC_ID").required().asInt(), // Problem reports
  NEWUSERS_TOPIC_ID: env.get("NEWUSERS_TOPIC_ID").required().asInt(), // New users
  NEWS_TOPIC_ID: env.get("NEWS_TOPIC_ID").required().asInt(), // Announcements
  NEWREFERRAL_TOPIC_ID: env.get("NEWREFERRAL_TOPIC_ID").required().asInt(), // New referrals

  // پرداخت‌ها و شارژ کیف پول (اگه Topic مجزا داری)
  PAYMENTS_TOPIC_ID: env.get("PAYMENTS_TOPIC_ID").asInt(), // optional — if not set, falls back to ORDERS_TOPIC_ID

  // اضافه کردن Topics جدید (در صورت نیاز این خطوط را uncomment کنید)
  // FEEDBACK_TOPIC_ID: env.get("FEEDBACK_TOPIC_ID").default("6").asInt(), // User feedback
  // TECHNICAL_TOPIC_ID: env.get("TECHNICAL_TOPIC_ID").default("7").asInt(), // Technical issues
};

// Ticket System Topics Configuration
export const TICKET_TOPICS = {
  support: config.SUPPORT_TOPIC_ID,
  order: config.ORDERS_TOPIC_ID,
  report: config.REPORTS_TOPIC_ID,

  // برای اضافه کردن Topic جدید:
  // 1. در .env مقدار Topic ID را اضافه کنید: NEW_TOPIC_ID=123
  // 2. در بالا config را تعریف کنید: NEW_TOPIC_ID: env.get("NEW_TOPIC_ID").asInt()
  // 3. اینجا آن را اضافه کنید: new_topic: config.NEW_TOPIC_ID,
  // 4. در schema.ts به ticketTypeEnum اضافه کنید: "new_topic"

  // مثال (uncomment کنید در صورت نیاز):
  // payment: config.PAYMENTS_TOPIC_ID,
  // feedback: config.FEEDBACK_TOPIC_ID,
  // technical: config.TECHNICAL_TOPIC_ID,
} as const;

export type TicketType = keyof typeof TICKET_TOPICS;


export const Bot_Topics = {
  new_users: config.NEWUSERS_TOPIC_ID,
  news: config.NEWS_TOPIC_ID,
  new_referral: config.NEWREFERRAL_TOPIC_ID,
};

export interface RequiredChannel {
  id: string;
  url: string;
  name: string;
}

export function getRequiredChannels(): RequiredChannel[] {
  const ids = config.FORCE_JOIN_CHANNEL_IDS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length) return [];

  const urls = config.FORCE_JOIN_CHANNEL_URLS.split(",").map((s) => s.trim());
  const names = config.FORCE_JOIN_CHANNEL_NAMES.split(",").map((s) => s.trim());

  return ids.map((id, i) => ({
    id,
    url: urls[i] || `https://t.me/${id.replace("@", "")}`,
    name: names[i] || id,
  }));
}

/** آیا این کاربر مالک ربات است؟ */
export function isOwner(userId: number): boolean {
  return userId === config.OWNER_ID;
}
