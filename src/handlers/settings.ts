import { Composer } from "gramio";
import {
  settingsKeyboard,
  notificationSettingsKeyboard,
  privacySettingsKeyboard,
  confirmationKeyboard,
} from "../shared/keyboards/index.ts";
import { UserRepository } from "../repositories/index.ts";
import { composer } from "../plugins/index.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";

export const settingsComposer = new Composer().extend(composer);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 Main Settings Menu
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings", async (context) => {
  const t = context.t;

  await context.editText(
    `${t("settingsTitle")}\n\n${t("settingsDescription")}`,
    {
      reply_markup: settingsKeyboard(t),
      parse_mode: "HTML",
    },
  );
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 Change Language
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("change_language", async (context) => {
  // Enter the language selection scene
  await context.scene.enter(languageSelectionScene);
});

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

  await context.editText(accountData, {
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

  await context.editText(
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
      orders: t("btnToggleOrderNotifications", true).substring(2),
      wallet: t("btnToggleWalletNotifications", true).substring(2),
      promotions: t("btnTogglePromotionNotifications", true).substring(2),
      referrals: t("btnToggleReferralNotifications", true).substring(2),
      stock: t("btnToggleStockNotifications", true).substring(2),
    };

    const notificationTypeText = typeNames[type];
    const toggledMessage = newValue
      ? `✅ فعال شد: ${notificationTypeText}`
      : `❌ غیرفعال شد: ${notificationTypeText}`;

    await context.answerCallbackQuery({
      text: toggledMessage,
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

      await context.editReplyMarkup(
        notificationSettingsKeyboard(t, notificationSettings),
      );
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 Privacy Settings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:privacy", async (context) => {
  const t = context.t;

  await context.editText(`${t("privacyTitle")}\n\n${t("privacyDescription")}`, {
    reply_markup: privacySettingsKeyboard(t),
    parse_mode: "HTML",
  });
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

  // Send as document using Buffer
  const fileBuffer = Buffer.from(dataJson, "utf-8");

  await context.sendDocument(
    new File([fileBuffer], fileName, { type: "application/json" }),
    {
      caption: t("exportDataReady"),
    },
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗑️ Clear History
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery(
  "settings:privacy:clear_history",
  async (context) => {
    const t = context.t;

    await context.editText(t("clearHistoryConfirm"), {
      reply_markup: confirmationKeyboard(t, "clear_history"),
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

    await context.editText(t("clearHistorySuccess"), {
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

    await context.editText(t("deleteAccountConfirm"), {
      reply_markup: confirmationKeyboard(t, "delete_account"),
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

    await context.editText(t("deleteAccountSuccess"), {
      parse_mode: "HTML",
    });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ℹ️ About
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

settingsComposer.callbackQuery("settings:about", async (context) => {
  const t = context.t;

  await context.editText(`${t("aboutTitle")}\n\n${t("aboutDescription")}`, {
    reply_markup: settingsKeyboard(t),
    parse_mode: "HTML",
  });
});
