import { Redis } from "ioredis";
import { config } from "../config.ts";

console.log(
  `🔧 Connecting to Redis at ${config.REDIS_HOST}:${config.REDIS_PORT}`,
);

export const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null, // queue commands indefinitely during reconnect
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // send keepalive after 10s idle
  connectTimeout: 10000,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 5000);
    console.error(
      `⚠️ Redis connection attempt ${times} failed, retrying in ${delay}ms...`,
    );
    return delay; // Always retry
  },
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

// Keep connection alive by pinging every 30 seconds
// Prevents firewall/NAT from dropping idle TCP connections
setInterval(() => {
  redis.ping().catch((err) => {
    console.error("❌ Redis ping failed:", err.message);
  });
}, 30_000);
