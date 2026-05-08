import type { AnyBot } from "gramio";
import { UserRepository } from "../repositories/UserRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { mainMenuKeyboard } from "../shared/keyboards/index.ts";
import { ticketState, ticketReplyState } from "../scenes/support-tickets.ts";
import { hasRechargeState } from "../scenes/wallet-recharge.ts";

export function setupFallbackHandler(bot: AnyBot) {
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next?.();

    // Only handle private chats
    if (ctx.chat?.type !== "private") return next?.();

    // Skip commands — let command handlers deal with them
    if (ctx.text?.startsWith("/")) return next?.();

    // Skip if user is inside a scene (language selection, discount code, etc.)
    if ((ctx as any).scene?.current) return next?.();

    // Skip if user is in a ticket workflow
    if (ticketState.has(userId) || ticketReplyState.has(userId))
      return next?.();

    // Skip if user is in a wallet recharge workflow — pass to that handler
    if (hasRechargeState(userId)) return next?.();

    // User sent a random message with no active workflow → send main menu
    const user = await UserRepository.findById(userId);
    if (!user) return;

    const userLang =
      user.languageCode && user.languageCode !== "null"
        ? user.languageCode
        : "en";
    const t = i18n.buildT(userLang);
    const userName = ctx.from.firstName || ctx.from.username || "User";

    await ctx.send(t("main_menu", userName), {
      reply_markup: mainMenuKeyboard(t),
      parse_mode: "HTML",
    });
  });
}
