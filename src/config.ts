import env from "env-var";

export const config = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "test", "development"]),
  BOT_TOKEN: env.get("BOT_TOKEN").required().asString(),

  DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  REDIS_HOST: env.get("REDIS_HOST").default("localhost").asString(),
  LOCK_STORE: env
    .get("LOCK_STORE")
    .default("memory")
    .asEnum(["memory", "redis"]),
};

console.log("📝 Config loaded:", {
  NODE_ENV: config.NODE_ENV,
  REDIS_HOST: config.REDIS_HOST,
  DATABASE_URL: config.DATABASE_URL.substring(0, 30) + "...",
});
