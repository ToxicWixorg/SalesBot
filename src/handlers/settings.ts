import { Composer } from "gramio";
import type { Context } from "../bot.ts";
import {
  settingsKeyboard,
  notificationSettingsKeyboard,
  privacySettingsKeyboard,
  settingsConfirmationKeyboard,
} from "../shared/keyboards/index.ts";
import { UserRepository } from "../repositories/index.ts";

export const settingsComposer = new Composer<Context>();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 Main Settings Menu
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings", async (context) => {
  const t = context.t;

  await context.editMessageText(
    `${t("settingsTitle")}\n\n${t("settingsDescription")}`,
    {
      reply_markup: settingsKeyboard(t),
      parse_mode: "HTML",
    },
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 Account Information
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:account_info", async (context) => {
  const t = context.t;
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);

  if (!user) {
    await context.answerCallbackQuery({
      text: "User not found",
      show_alert: true,
    });
    return;
  }

  // TODO: Get actual statistics from database
  const totalOrders = 0; // await orderRepo.countUserOrders(userId);
  const totalSpent = "0"; // await orderRepo.getTotalSpent(userId);
  const totalReferrals = 0; // await referralRepo.countReferrals(userId);

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fa-IR")
    : "N/A";

  const accountData = t("accountInfoData", {
    userId: userId.toString(),
    username: user.username || "",
    firstName: user.firstName || "Unknown",
    joinDate,
    totalOrders,
    totalSpent,
    totalReferrals,
  });

  await context.editMessageText(accountData, {
    reply_markup: settingsKeyboard(t),
    parse_mode: "HTML",
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔔 Notification Settings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:notifications", async (context) => {
  const t = context.t;
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);

  if (!user) {
    await context.answerCallbackQuery({
      text: "User not found",
      show_alert: true,
    });
    return;
  }

  const notificationSettings = {
    notifyOrders: user.notifyOrders ?? true,
    notifyWallet: user.notifyWallet ?? true,
    notifyPromotions: user.notifyPromotions ?? true,
    notifyReferrals: user.notifyReferrals ?? true,
    notifyStock: user.notifyStock ?? true,
  };

  await context.editMessageText(
    `${t("notificationSettingsTitle")}\n\n${t("notificationSettingsDescription")}`,
    {
      reply_markup: notificationSettingsKeyboard(t, notificationSettings),
      parse_mode: "HTML",
    },
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 Toggle Notification Settings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const notificationTypes = [
  "orders",
  "wallet",
  "promotions",
  "referrals",
  "stock",
] as const;

for (const type of notificationTypes) {
  settingsComposer.callbackQuery(`settings:toggle:${type}`, async (context) => {
    const t = context.t;
    const userId = context.from.id;

    const user = await UserRepository.findById(userId);

    if (!user) {
      await context.answerCallbackQuery({
        text: "User not found",
        show_alert: true,
      });
      return;
    }

    // Map type to database column
    const fieldMap = {
      orders: "notifyOrders",
      wallet: "notifyWallet",
      promotions: "notifyPromotions",
      referrals: "notifyReferrals",
      stock: "notifyStock",
    } as const;

    const field = fieldMap[type];
    const currentValue = user[field] ?? true;
    const newValue = !currentValue;

    // Update in database
    await UserRepository.update(userId, {
      [field]: newValue,
    });

    // Get type name in current language
    const typeNames = {
      orders: t("btnToggleOrderNotifications", { enabled: true }).substring(2),
      wallet: t("btnToggleWalletNotifications", { enabled: true }).substring(2),
      promotions: t("btnTogglePromotionNotifications", {
        enabled: true,
      }).substring(2),
      referrals: t("btnToggleReferralNotifications", {
        enabled: true,
      }).substring(2),
      stock: t("btnToggleStockNotifications", { enabled: true }).substring(2),
    };

    await context.answerCallbackQuery({
      text: t("notificationToggled", {
        type: typeNames[type],
        enabled: newValue,
      }),
    });

    // Refresh the keyboard
    const updatedUser = await UserRepository.findById(userId);
    if (updatedUser) {
      const notificationSettings = {
        notifyOrders: updatedUser.notifyOrders ?? true,
        notifyWallet: updatedUser.notifyWallet ?? true,
        notifyPromotions: updatedUser.notifyPromotions ?? true,
        notifyReferrals: updatedUser.notifyReferrals ?? true,
        notifyStock: updatedUser.notifyStock ?? true,
      };

      await context.editMessageReplyMarkup({
        reply_markup: notificationSettingsKeyboard(t, notificationSettings),
      });
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 Privacy Settings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:privacy", async (context) => {
  const t = context.t;

  await context.editMessageText(
    `${t("privacyTitle")}\n\n${t("privacyDescription")}`,
    {
      reply_markup: privacySettingsKeyboard(t),
      parse_mode: "HTML",
    },
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 Export Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:privacy:export", async (context) => {
  const t = context.t;
  const userId = context.from.id;

  await context.answerCallbackQuery({
    text: t("exportDataProcessing"),
  });

  const user = await UserRepository.findById(userId);

  if (!user) {
    await context.send("User not found", {
      reply_markup: settingsKeyboard(t),
    });
    return;
  }

  // TODO: Collect all user data from all tables
  const userData = {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    walletBalance: user.walletBalance,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
    // Add more data as needed
  };

  const dataJson = JSON.stringify(userData, null, 2);
  const fileName = `user_data_${userId}_${Date.now()}.json`;

  // Send as document
  await context.sendDocument({
    filename: fileName,
    data: Buffer.from(dataJson),
  });

  await context.send(t("exportDataReady"), {
    reply_markup: settingsKeyboard(t),
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗑️ Clear History
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery(
  "settings:privacy:clear_history",
  async (context) => {
    const t = context.t;

    await context.editMessageText(t("clearHistoryConfirm"), {
      reply_markup: settingsConfirmationKeyboard(t, "clear_history"),
      parse_mode: "HTML",
    });
  },
);

settingsComposer.callbackQuery(
  "settings:confirm:clear_history",
  async (context) => {
    const t = context.t;
    const userId = context.from.id;

    // TODO: Clear user history (transactions, etc.)
    // await transactionRepo.clearUserHistory(userId);

    await context.editMessageText(t("clearHistorySuccess"), {
      reply_markup: settingsKeyboard(t),
    });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❌ Delete Account
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery(
  "settings:privacy:delete_account",
  async (context) => {
    const t = context.t;

    await context.editMessageText(t("deleteAccountConfirm"), {
      reply_markup: settingsConfirmationKeyboard(t, "delete_account"),
      parse_mode: "HTML",
    });
  },
);

settingsComposer.callbackQuery(
  "settings:confirm:delete_account",
  async (context) => {
    const t = context.t;
    const userId = context.from.id;

    // TODO: Delete all user data from all tables
    // await orderRepo.deleteUserOrders(userId);
    // await transactionRepo.deleteUserTransactions(userId);
    // await referralRepo.deleteUserReferrals(userId);

    // Delete user - Note: You'll need to add a delete method to UserRepository
    // await UserRepository.delete(userId);

    await context.editMessageText(t("deleteAccountSuccess"), {
      parse_mode: "HTML",
    });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ℹ️ About
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:about", async (context) => {
  const t = context.t;

  await context.editMessageText(
    `${t("aboutTitle")}\n\n${t("aboutDescription")}`,
    {
      reply_markup: settingsKeyboard(t),
      parse_mode: "HTML",
    },
  );
});
