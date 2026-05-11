import { type AnyBot, InlineKeyboard } from "gramio";
import { UserRepository } from "../repositories/UserRepository.ts";
import { WalletRepository } from "../repositories/WalletRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { walletKeyboard, walletHistoryKeyboard } from "../shared/keyboards";
import { e } from "../shared/locales/emojies.ts";

export function setupWalletHandlers(bot: AnyBot) {
  // ── نمایش کیف پول ────────────────────────────────────
  bot.callbackQuery("wallet", async (ctx) => {
    const userId = ctx.from.id;
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (!user) {
      await ctx.answerCallbackQuery({
        text: t("userNotFound"),
        show_alert: true,
      });
      return;
    }

    const balance = user.walletBalance || "0";

    await ctx.editText(
      `${t("walletTitle")}\n\n${t("walletBalance", balance)}` +
        (balance === "0" ? `\n\n${t("walletEmpty")}` : ""),
      { reply_markup: walletKeyboard(t), parse_mode: "HTML" },
    );
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("wallet_history", async (ctx) => {
    const userId = ctx.from.id;
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "fa");

    if (!user) {
      await ctx.answerCallbackQuery({
        text: t("userNotFound"),
        show_alert: true,
      });
      return;
    }

    const transactions = await WalletRepository.findByUserId(userId);

    if (!transactions || transactions.length === 0) {
      await ctx.editText(
        `${t("transactionHistoryTitle")}\n\n${t("transactionHistoryEmpty")}`,
        { reply_markup: walletHistoryKeyboard(t), parse_mode: "HTML" },
      );
      await ctx.answerCallbackQuery();
      return;
    }

    const recent = transactions.slice(0, 10);
    let msg = `${t("transactionHistoryTitle")}\n\n`;

    for (const tx of recent) {
      const isCredit = tx.type === "credit";
      const typeLabel = isCredit ? t("txTypeCredit") : t("txTypeDebit");
      const sign = isCredit ? "+" : "-";

      let sourceLabel = "";
      switch (tx.source) {
        case "purchase":
          sourceLabel = t("txSourcePurchase");
          break;
        case "recharge":
          sourceLabel = t("txSourceRecharge");
          break;
        case "refund":
          sourceLabel = t("txSourceRefund");
          break;
        case "referral":
          sourceLabel = t("txSourceReferral");
          break;
        case "reward":
          sourceLabel = t("txSourceReward");
          break;
        case "perk":
          sourceLabel = t("txSourcePerk");
          break;
        default:
          sourceLabel = t("txSourceAdminAdjustment");
          break;
      }

      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `${typeLabel} ${sourceLabel}\n`;
      msg += `${t("transactionAmount")} ${sign}${tx.amount} ${t("Toman")} ${e.Toman}\n`;
      msg += `${t("transactionDate")} ${new Date(tx.createdAt || "").toLocaleDateString("fa-IR")}\n`;
      if (tx.description) {
        msg += `${t("transactionDescription")} ${tx.description}\n`;
      }
    }
    msg += `━━━━━━━━━━━━━━━\n`;

    await ctx.editText(msg, {
      reply_markup: walletHistoryKeyboard(t),
      parse_mode: "HTML",
    });
    await ctx.answerCallbackQuery();
  });
}
