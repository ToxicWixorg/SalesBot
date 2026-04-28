import { Bot, InlineKeyboard } from "gramio";
import { UserRepository } from "../repositories/UserRepository.ts";
import { WalletRepository } from "../repositories/WalletRepository.ts";
import { i18n } from "../shared/locales/index.ts";

export function setupWalletHandlers(bot: Bot) {
  /**
   * 💰 کیف پول - نمایش موجودی و گزینه‌ها
   */
  bot.callbackQuery("wallet", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "❌ User not found",
        show_alert: true,
      });
      return;
    }

    const t = i18n.buildT(user.languageCode || "en");
    const balance = user.walletBalance || "0";

    const keyboard = new InlineKeyboard()
      .text(t("btnRechargeWallet"), "wallet_recharge")
      .row()
      .text(t("btnTransactionHistory"), "wallet_history")
      .row()
      .text(t("btnBack"), "main_menu");

    await context.editText(
      `${t("walletTitle")}\n\n${t("walletBalance", balance)}\n\n${balance === "0" ? t("walletEmpty") : ""}`,
      {
        reply_markup: keyboard,
      },
    );

    await context.answerCallbackQuery();
  });

  /**
   * 💳 شارژ کیف پول - انتخاب روش
   */
  bot.callbackQuery("wallet_recharge", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "❌ User not found",
        show_alert: true,
      });
      return;
    }

    const t = i18n.buildT(user.languageCode || "en");

    const keyboard = new InlineKeyboard()
      .text(t("btnRechargeCrypto"), "recharge_crypto")
      .row()
      .text(t("btnRechargeCard"), "recharge_card")
      .row()
      .text(t("btnRechargeZarinpal"), "recharge_zarinpal")
      .row()
      .text(t("btnBack"), "wallet");

    await context.editText(
      `${t("rechargeWalletTitle")}\n\n${t("rechargeSelectMethod")}`,
      {
        reply_markup: keyboard,
      },
    );

    await context.answerCallbackQuery();
  });

  /**
   * 📊 تاریخچه تراکنش‌ها
   */
  bot.callbackQuery("wallet_history", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "❌ User not found",
        show_alert: true,
      });
      return;
    }

    const t = i18n.buildT(user.languageCode || "en");
    const transactions = await WalletRepository.findByUserId(userId);

    if (!transactions || transactions.length === 0) {
      const keyboard = new InlineKeyboard().text(t("btnBack"), "wallet");

      await context.editText(
        `${t("transactionHistoryTitle")}\n\n${t("transactionHistoryEmpty")}`,
        {
          reply_markup: keyboard,
        },
      );

      await context.answerCallbackQuery();
      return;
    }

    // نمایش آخرین 10 تراکنش
    const recentTransactions = transactions.slice(0, 10);
    let message = `${t("transactionHistoryTitle")}\n\n`;

    for (const tx of recentTransactions) {
      const type = tx.type === "credit" ? t("txTypeCredit") : t("txTypeDebit");
      const sign = tx.type === "credit" ? "+" : "-";

      // منبع تراکنش
      let sourceText = "";
      switch (tx.source) {
        case "purchase":
          sourceText = t("txSourcePurchase");
          break;
        case "recharge":
          sourceText = t("txSourceRecharge");
          break;
        case "refund":
          sourceText = t("txSourceRefund");
          break;
        case "referral":
          sourceText = t("txSourceReferral");
          break;
        case "reward":
          sourceText = t("txSourceReward");
          break;
        case "perk":
          sourceText = t("txSourcePerk");
          break;
        default:
          sourceText = t("txSourceAdminAdjustment");
      }

      message += `━━━━━━━━━━━━━━━\n`;
      message += `${type} ${sourceText}\n`;
      message += `${t("transactionAmount")} ${sign}${tx.amount} ${t("currency")}\n`;
      message += `${t("transactionDate")} ${new Date(tx.createdAt || "").toLocaleDateString()}\n`;

      if (tx.description) {
        message += `${t("transactionDescription")} ${tx.description}\n`;
      }
    }

    message += `━━━━━━━━━━━━━━━\n`;

    const keyboard = new InlineKeyboard().text(t("btnBack"), "wallet");

    await context.editText(message, {
      reply_markup: keyboard,
    });

    await context.answerCallbackQuery();
  });

  /**
   * 🪙 شارژ با کریپتو - مرحله 1: ورود مبلغ
   */
  bot.callbackQuery("recharge_crypto", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "❌ User not found",
        show_alert: true,
      });
      return;
    }

    const t = i18n.buildT(user.languageCode || "en");

    const keyboard = new InlineKeyboard().text(
      t("btnCancel"),
      "wallet_recharge",
    );

    await context.editText(
      `${t("rechargeCryptoTitle")}\n\n${t("rechargeEnterAmountUsdt")}\n\n${t("rechargeMinAmountUsdt", "10")}\n${t("rechargeMaxAmountUsdt", "10000")}`,
      {
        reply_markup: keyboard,
      },
    );

    await context.answerCallbackQuery();
  });

  /**
   * 💳 شارژ با کارت
   */
  bot.callbackQuery("recharge_card", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "❌ User not found",
        show_alert: true,
      });
      return;
    }

    const t = i18n.buildT(user.languageCode || "en");

    const keyboard = new InlineKeyboard().text(
      t("btnCancel"),
      "wallet_recharge",
    );

    await context.editText(
      `${t("rechargeCardTitle")}\n\n${t("rechargeEnterAmount")}\n\n${t("rechargeMinAmount", "10000")}\n${t("rechargeMaxAmount", "1000000")}`,
      {
        reply_markup: keyboard,
      },
    );

    await context.answerCallbackQuery();
  });

  /**
   * 💰 شارژ با زرین پال
   */
  bot.callbackQuery("recharge_zarinpal", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "❌ User not found",
        show_alert: true,
      });
      return;
    }

    const t = i18n.buildT(user.languageCode || "en");

    const keyboard = new InlineKeyboard().text(
      t("btnCancel"),
      "wallet_recharge",
    );

    await context.editText(
      `${t("rechargeZarinpalTitle")}\n\n${t("rechargeEnterAmount")}\n\n${t("rechargeMinAmount", "10000")}\n${t("rechargeMaxAmount", "1000000")}`,
      {
        reply_markup: keyboard,
      },
    );

    await context.answerCallbackQuery();
  });
}
