import { bot } from "./bot.ts";
import { config } from "./config.ts";
import { seedOwnerOnStartup } from "./scripts/seed-owner.ts";
import { seedCategoriesOnStartup } from "./scripts/seed-categories.ts";
import { startReminderService } from "./services/ReminderService.ts";

async function setBotCommandsOnStartup() {
  try {
    await (bot.api as any).setMyCommands({
      commands: [
        { command: "start", description: "شروع / start " },
        { command: "products", description: "محصولات / products" },
      ],
    });
    console.log("✅ Bot commands set successfully");
  } catch (error) {
    console.error("❌ Failed to set bot commands:", error);
  }
}

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

await seedOwnerOnStartup();

await bot.start();
await setBotCommandsOnStartup();
startReminderService(bot);
