import { Redis } from "ioredis";
import { config } from "../config.ts";

console.log(
  `🔧 Connecting to Redis at ${config.REDIS_HOST}:${config.REDIS_PORT}`,
);

export const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  // for bullmq
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.error(
      `⚠️ Redis connection attempt ${times} failed, retrying in ${delay}ms...`,
    );
    if (times > 10) {
      console.error(`❌ Redis connection failed after ${times} attempts`);
      return null; // Stop retrying
    }
    return delay;
  },
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});
