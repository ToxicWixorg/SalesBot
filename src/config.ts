import env from "env-var";

export const config = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "test", "development"]),
  BOT_TOKEN: env.get("BOT_TOKEN").required().asString(),

  DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  REDIS_HOST: env.get("REDIS_HOST").default("localhost").asString(),
  REDIS_PORT: env.get("REDIS_PORT").default(6379).asInt(),
  LOCK_STORE: env
    .get("LOCK_STORE")
    .default("memory")
    .asEnum(["memory", "redis"]),

  // Support Forum Group (Telegram Forum)
  SUPPORT_GROUP_ID: env.get("SUPPORT_GROUP_ID").asString(), // e.g., "-1001234567890"
  
  // Forum Topics IDs
  SUPPORT_TOPIC_ID: env.get("SUPPORT_TOPIC_ID").default("2").asInt(), // General support tickets
  ORDERS_TOPIC_ID: env.get("ORDERS_TOPIC_ID").default("3").asInt(), // Order-related tickets
  REPORTS_TOPIC_ID: env.get("REPORTS_TOPIC_ID").default("4").asInt(), // Problem reports
};

// Ticket System Topics Configuration
export const TICKET_TOPICS = {
  support: config.SUPPORT_TOPIC_ID,
  order: config.ORDERS_TOPIC_ID,
  report: config.REPORTS_TOPIC_ID,
} as const;

export type TicketType = keyof typeof TICKET_TOPICS;

// console.log("📝 Config loaded:", {
//   NODE_ENV: config.NODE_ENV,
//   REDIS_HOST: config.REDIS_HOST,
//   REDIS_PORT: config.REDIS_PORT,
//   DATABASE_URL: config.DATABASE_URL.substring(0, 30) + "...",
// });
