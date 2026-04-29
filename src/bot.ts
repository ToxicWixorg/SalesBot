import { Bot } from "gramio";
import { config } from "./config.ts";
import { startComposer } from "./handlers/start.ts";
import { productsComposer } from "./handlers/products.ts";
import { inviteComposer } from "./handlers/invite.ts";
import { discountComposer } from "./handlers/discount.ts";
import { composer } from "./plugins/index.ts";
import { setupWalletHandlers } from "./handlers/wallet.ts";
import { setupWalletRechargeScene } from "./scenes/wallet-recharge.ts";
import { enterDiscountCodeScene } from "./scenes/enter-discount-code.ts";

export const bot = new Bot(config.BOT_TOKEN)
  .extend(composer)
  .extend(startComposer)
  .extend(productsComposer)
  .extend(inviteComposer)
  .extend(discountComposer)
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

// Setup wallet handlers
setupWalletHandlers(bot);
setupWalletRechargeScene(bot);

// Register discount code scene
if (bot.scene) {
  bot.scene.register(enterDiscountCodeScene);
}
