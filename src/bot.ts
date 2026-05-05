import { Bot } from "gramio";
import { config } from "./config.ts";
import { startComposer } from "./handlers/start.ts";
import { productsComposer } from "./handlers/products/index.ts";
import { inviteComposer } from "./handlers/invite/index.ts";
import { discountComposer } from "./handlers/discount/index.ts";
import { settingsComposer } from "./handlers/settings.ts";
import { ordersComposer } from "./handlers/orders/index.ts";
import { TopicComposer } from "./handlers/Topic.ts";
import { composer } from "./plugins/index.ts";
import { setupWalletHandlers } from "./handlers/wallet.ts";
import { setupWalletRechargeScene } from "./scenes/wallet-recharge.ts";
import { supportHandler } from "./handlers/support.ts";
import { setupTicketScenes } from "./scenes/support-tickets.ts";
import { setupManualOrderScene } from "./scenes/manual-order.ts";
import { setBotInstance } from "./botInstance.ts";

// Validate BOT_TOKEN
if (!config.BOT_TOKEN) {
  throw new Error(
    "BOT_TOKEN is required. Please set it in your .env file or environment variables.",
  );
}

export const bot = new Bot(config.BOT_TOKEN)
  .extend(composer)
  .extend(startComposer)
  .extend(productsComposer)
  .extend(inviteComposer)
  .extend(discountComposer)
  .extend(ordersComposer)
  .extend(settingsComposer)
  .extend(TopicComposer)
  .onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`))
  .onError(({ context, error }) => {
    console.error("[Error Handler] Error occurred:", error);
    console.error("[Error Handler] Context type:", context.constructor.name);
    console.error("[Error Handler] Stack:", error.stack);

    if (context.is("message") && context.chat) {
      context
        .send("⚠️ An internal error occurred. Please try again later.")
        .catch(() => {});
    }
  });

// Set bot singleton (must be before scenes that need getBotInstance)
setBotInstance(bot);

// Setup manual order scene (must run before ticket scenes)
setupManualOrderScene(bot);

// Setup support/ticket handlers FIRST (higher priority)
setupTicketScenes(bot);
supportHandler(bot);

// Setup wallet handlers after tickets
setupWalletHandlers(bot);
setupWalletRechargeScene(bot);
