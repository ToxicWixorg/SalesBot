import { bot } from "./bot.ts";
import { config } from "./config.ts";
import { seedOwnerOnStartup } from "./scripts/seed-owner.ts";

const signals = ["SIGINT", "SIGTERM"];

for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`Received ${signal}. Initiating graceful shutdown...`);
    await bot.stop();
    process.exit(0);
  });
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

// ثبت مالک ربات در دیتابیس (در صورت نبود)
await seedOwnerOnStartup();

await bot.start();
