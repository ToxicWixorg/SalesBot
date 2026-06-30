import { Bot } from "gramio";
import { config } from "./config.ts";
import { startComposer } from "./handlers/start.ts";
import { adminPanelComposer } from "./handlers/aminPanel/index.ts";
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
import { setupManualOrderScene } from "./scenes/manualOrders/index.ts";
import { setupEnterQuantityHandler } from "./handlers/products/callbacks/EnterQuantity.ts";
import { setupOrderForumHandlers } from "./handlers/orders/orderForum.ts";
import { setBotInstance } from "./botInstance.ts";
import { setupAdminSetupHandler } from "./handlers/adminSetup.ts";
import { setupAdminSettingsHandlers } from "./handlers/aminPanel/settings/index.ts";
import { setupAdminUsersHandlers } from "./handlers/aminPanel/users/index.ts";
import { setupAdminWalletHandlers } from "./handlers/aminPanel/wallet/index.ts";
import { setupAdminDiscountsHandlers } from "./handlers/aminPanel/discounts/index.ts";
import { setupAdminSchedulesHandlers } from "./handlers/aminPanel/schedules/index.ts";
import { setupAdminBroadcastHandlers } from "./handlers/aminPanel/broadcast/index.ts";
import { setupAdminPlanPriceHandler } from "./handlers/aminPanel/callbacks/products.ts";

// Validate BOT_TOKEN
if (!config.BOT_TOKEN) {
  throw new Error(
    "BOT_TOKEN is required. Please set it in your .env file or environment variables.",
  );
}

export const bot = new Bot(config.BOT_TOKEN)
  .extend(composer)
  .extend(startComposer)
  .extend(adminPanelComposer)
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

// Setup admin password setup handler (highest priority — before other message handlers)
setupAdminSetupHandler(bot);

// Setup owner-only admin panel settings (admins / bot / wallet / backup)
setupAdminSettingsHandlers(bot);

// Setup admin panel users section (search / profile / new / stats / bulk)
setupAdminUsersHandlers(bot);

// Setup admin panel wallet section (pending top-ups / stats / transactions)
setupAdminWalletHandlers(bot);

// Setup admin panel discounts section (create percentage/fixed codes, manage)
setupAdminDiscountsHandlers(bot);

// Setup admin panel schedules section (time-slot templates for bookings)
setupAdminSchedulesHandlers(bot);

// Setup admin panel broadcast section (filtered mass messaging)
setupAdminBroadcastHandlers(bot);

// Setup admin plan price editing (admin enters price in USD)
setupAdminPlanPriceHandler(bot);

// Setup manual order scene (must run before ticket scenes)
setupManualOrderScene(bot);

// Setup inventory order quantity-entry handler
setupEnterQuantityHandler(bot);

// Setup Orders-topic forum management (buttons + message-buyer relay)
setupOrderForumHandlers(bot);

// Setup support/ticket handlers FIRST (higher priority)
setupTicketScenes(bot);
supportHandler(bot);

// Setup wallet handlers after tickets
setupWalletHandlers(bot);
setupWalletRechargeScene(bot);
