import env from "env-var";

export const config = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "test", "development"]),
  BOT_TOKEN: env.get("BOT_TOKEN").required().asString(),

  DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  REDIS_HOST: env.get("REDIS_HOST").default("localhost").asString(),
  REDIS_PORT: env.get("REDIS_PORT").default("6379").asPortNumber(),
  LOCK_STORE: env
    .get("LOCK_STORE")
    .default("memory")
    .asEnum(["memory", "redis"]),
};
