import type { LanguageMap } from "@gramio/i18n";
import { bold, format } from "gramio";

export const en = {
  // Language Selection
  selectLanguage: "🌍 Please select your language:",
  languageSelected: (lang: string) => format`✅ Language set to ${bold(lang)}`,

  // Greeting & Welcome
  greeting: (name: string) => format`Hello, ${bold(name)}!`,
  welcome: (name: string) =>
    format`Welcome to our Digital Store, ${bold(name)}! 🎉\n\nWe offer various digital subscriptions and services.`,

  // Main Menu
  mainMenu: "🏠 Main Menu",
  chooseAction: "Please choose an action:",

  // Buttons
  btnProducts: "🛒 Products",
  btnMyOrders: "📦 My Orders",
  btnWallet: "💰 Wallet",
  btnInviteFriends: "👥 Invite Friends",
  btnDiscountCode: "🎁 Discount Code",
  btnSupport: "💬 Support",
  btnSettings: "⚙️ Settings",
  btnBack: "🔙 Back",
  btnCancel: "❌ Cancel",
  btnMainMenu: "🏠 Main Menu",
  btnChangeLanguage: "🌐 Change Language",
  btnNotifications: "🔔 Notifications",
  btnYes: "✅ Yes",
  btnNo: "❌ No",
  btnConfirm: "✅ Confirm",

  // Products
  btnBuyProduct: "🛍️ Buy Now",
  btnNotifyStock: "🔔 Notify When Available",
  btnConfirmOrder: "✅ Confirm Order",
  btnAddDiscountCode: "🎫 Add Discount Code",
  productsTitle: "🛍️ Products",
  selectCategory: "🏷️ Select a category:",
  categoryProducts: (category: string) =>
    format`Products in ${bold(category)}:`,
  noProducts: "❌ No products available in this category.",
  productDetails: "📦 Product Details",
  price: "💵 Price:",
  stock: "📦 Stock:",
  available: "✅ Available",
  outOfStock: "❌ Out of Stock",
  deliveryTime: "⏰ Delivery Time:",
  deliveryType: "🚚 Delivery Type:",
  deliveryAutomatic: "⚡ Instant (Automatic)",
  deliveryManual: "👤 Manual (1-24 hours)",
  deliveryCoordination: "📝 Requires Coordination",
  selectPlan: "📋 Select a plan:",
  orderSummary: "📝 Order Summary:",
  total: "💰 Total:",
  currency: "USD",
  oneTime: "One-time",
  duration_day: "day(s)",
  duration_month: "month(s)",
  duration_year: "year(s)",

  // Wallet
  walletTitle: "💰 Wallet",
  walletBalance: (balance: string) => format`Balance: ${bold(balance)} USD`,
  walletEmpty: "Your wallet is empty 📭",
  btnRechargeWallet: "💳 Recharge Wallet",
  btnTransactionHistory: "📊 Transaction History",

  // Wallet Recharge
  rechargeWalletTitle: "💳 Recharge Wallet",
  rechargeSelectMethod: "Please select a recharge method:",
  btnRechargeCrypto: "🪙 Crypto Payment (USDT)",
  btnRechargeCard: "💳 Card Payment",
  btnRechargeZarinpal: "💰 Zarinpal Gateway",

  rechargeEnterAmount: "💵 Please enter the recharge amount in USD:",
  rechargeEnterAmountUsdt: "💵 Please enter the USDT amount:",
  rechargeMinAmount: (amount: string) =>
    format`Minimum recharge: ${bold(amount)} USD`,
  rechargeMaxAmount: (amount: string) =>
    format`Maximum recharge: ${bold(amount)} USD`,
  rechargeMinAmountUsdt: (amount: string) =>
    format`Minimum amount: ${bold(amount)} USDT`,
  rechargeMaxAmountUsdt: (amount: string) =>
    format`Maximum amount: ${bold(amount)} USDT`,
  rechargeInvalidAmount: "❌ Invalid amount entered",
  rechargeTooLow: (min: string) =>
    format`❌ Recharge amount must be at least ${bold(min)} USD`,
  rechargeTooHigh: (max: string) =>
    format`❌ Recharge amount cannot exceed ${bold(max)} USD`,

  // Crypto Payment
  rechargeCryptoTitle: "🪙 Crypto Payment",
  rechargeCryptoAddress: (address: string) =>
    format`Wallet Address:\n\n${bold(address)}`,
  rechargeCryptoAmount: (amount: string) =>
    format`USDT Amount: ${bold(amount)}`,
  rechargeCryptoNetwork: (network: string) => format`Network: ${bold(network)}`,
  rechargeCryptoInstructions:
    "📝 Instructions:\n\n1. Send the USDT amount to the address above\n2. Send the TxID (transaction ID)\n3. Wait up to 30 minutes for confirmation",
  rechargeCryptoSendTxId: "Please send the TxID (transaction ID):",
  rechargeCryptoTxIdReceived:
    "✅ Transaction ID received\n\nVerifying payment...\nThis process may take up to 30 minutes.",
  rechargeCryptoVerified: (amount: string) =>
    format`✅ Payment verified!\n\n${bold(amount)} USD has been added to your wallet.`,
  rechargeCryptoFailed:
    "❌ Payment verification failed. Please contact support.",

  // Card/Zarinpal Payment
  rechargeCardTitle: "💳 Card Payment",
  rechargeZarinpalTitle: "💰 Zarinpal Gateway",
  rechargePaymentLink: (amount: string) =>
    format`Amount: ${bold(amount)} Toman\n\nClick the button below to proceed to the payment gateway:`,
  btnPayNow: "💳 Pay Now",
  rechargePaymentPending:
    "⏳ Waiting for payment...\n\nPlease complete the payment in your browser.",
  rechargePaymentSuccess: (amount: string) =>
    format`✅ Payment successful!\n\n${bold(amount)} Toman has been added to your wallet.`,
  rechargePaymentFailed: "❌ Payment failed. Please try again.",
  rechargePaymentCancelled: "⚠️ Payment was cancelled.",

  // Transaction History
  transactionHistoryTitle: "📊 Transaction History",
  transactionHistoryEmpty: "Your transaction history is empty 📭",
  transactionType: "Type:",
  transactionAmount: "Amount:",
  transactionDate: "Date:",
  transactionDescription: "Description:",

  // Transaction Types
  txTypeCredit: "➕ Credit",
  txTypeDebit: "➖ Debit",

  // Transaction Sources
  txSourcePurchase: "🛒 Purchase",
  txSourceRecharge: "💳 Recharge",
  txSourceRefund: "↩️ Refund",
  txSourceReferral: "👥 Referral Reward",
  txSourceReward: "🎁 Reward",
  txSourcePerk: "🎯 Perk Reward",
  txSourceAdminAdjustment: "⚙️ Admin Adjustment",

  // Language Names
  langEnglish: "🇬🇧 English",
  langPersian: "🇮🇷 فارسی",
  langRussian: "🇷🇺 Русский",

  // Invite Friends (Referral)
  inviteBanner: (data: {
    totalReferrals: number;
    totalRewards: string;
    referralLink: string;
  }) =>
    `🎁 <b>Invite Friends & Earn!</b>\n\n` +
    `👥 Your Referrals: <b>${data.totalReferrals}</b>\n` +
    `💰 Total Rewards: <b>${data.totalRewards}</b> Toman\n\n` +
    `🔗 <b>Your Referral Link:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `📝 <b>How it works:</b>\n` +
    `1. Share the link above with your friends\n` +
    `2. When they join, you get rewarded\n` +
    `3. Rewards are added directly to your wallet\n\n` +
    `💎 Reward per referral: <b>10,000 Toman</b>`,
  btnShareInviteLink: "📤 Share Link",
  btnCopyLink: "📋 Copy Link",
  btnViewReferrals: "👥 View Referrals",
  inviteShareText: "🎁 Join using this link and get a special discount!",
  inviteLinkCopied: (link: string) =>
    `✅ Link copied!\n\n${link}\n\nSend this link to your friends.`,
  noReferralsYet: "You haven't invited anyone yet 📭",
  referralListTitle: "👥 <b>Referral List</b>",
  andMore: (count: number) => format`and ${bold(count)} more...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `🎉 A new user (${data.userName}) joined through your referral link!\n💰 ${data.amount} has been added to your account.`,

  // Discount Codes
  discountCodeInfo:
    "🎁 <b>Discount Code</b>\n\n" +
    "Use discount codes to get discounts on your purchases.\n\n" +
    "You can enter a discount code during checkout or verify it here.",
  btnEnterDiscountCode: "✏️ Enter Discount Code",
  btnDiscountHistory: "📊 Usage History",
  enterDiscountCodePrompt:
    "✏️ Please enter your discount code:\n\n" +
    "Example: <code>SUMMER2024</code>",
  btnTryAgain: "🔄 Try Again",
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `✅ <b>Valid Discount Code!</b>\n\n` +
    `🎫 Code: <code>${data.code}</code>\n` +
    `📝 Type: ${data.type}\n` +
    `💰 Value: ${data.value}\n` +
    `📄 Description: ${data.description}\n\n` +
    `You can use this code during checkout.`,
  discountCodeInvalid: (reason: string) =>
    `❌ <b>Invalid Discount Code</b>\n\n${reason}`,
  discountTypePercentage: "Percentage",
  discountTypeFixed: "Fixed Amount",
  noDescription: "No description",
  noDiscountHistory: "You haven't used any discount codes yet 📭",
  discountHistoryTitle: "📊 <b>Discount Code Usage History</b>",
  discountAmount: "Discount Amount",
  orderId: "Order ID",

  // Settings
  settingsTitle: "⚙️ Settings",
  settingsDescription: "Manage your account settings from here.",
  btnAccountInfo: "👤 Account Info",
  btnNotificationSettings: "🔔 Notification Settings",
  btnPrivacy: "🔒 Privacy",
  btnAbout: "ℹ️ About",

  // Account Info
  accountInfoTitle: "👤 Account Information",
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `👤 <b>Your Account Information</b>\n\n` +
    `🆔 User ID: <code>${data.userId}</code>\n` +
    `👤 Username: ${data.username ? `@${data.username}` : "None"}\n` +
    `📝 Name: ${data.firstName}\n` +
    `📅 Join Date: ${data.joinDate}\n\n` +
    `📊 <b>Statistics:</b>\n` +
    `🛒 Total Orders: <b>${data.totalOrders}</b>\n` +
    `💰 Total Spent: <b>${data.totalSpent}</b> Toman\n` +
    `👥 Total Referrals: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: "🔔 Notification Settings",
  notificationSettingsDescription:
    "Choose which notifications you want to receive:",
  btnToggleOrderNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Order Notifications`,
  btnToggleWalletNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Wallet Notifications`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Promotion Notifications`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Referral Notifications`,
  btnToggleStockNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Stock Notifications`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? "✅ Enabled" : "❌ Disabled"}: ${type}`,
  allNotificationsEnabled: "✅ All notifications are enabled",
  allNotificationsDisabled: "❌ All notifications are disabled",

  // Privacy
  privacyTitle: "🔒 Privacy",
  privacyDescription: "Manage your personal data and privacy settings:",
  btnClearHistory: "🗑️ Clear History",
  btnDeleteAccount: "❌ Delete Account",
  btnExportData: "📤 Export My Data",
  clearHistoryConfirm:
    "⚠️ Are you sure you want to clear your history?\n\n" +
    "This action cannot be undone.",
  clearHistorySuccess: "✅ Your history has been cleared successfully.",
  clearHistoryCancelled: "❌ Operation cancelled.",
  deleteAccountConfirm:
    "⚠️ <b>Warning!</b>\n\n" +
    "Are you sure you want to delete your account?\n\n" +
    "❌ All your data including:\n" +
    "• Orders\n" +
    "• Wallet\n" +
    "• Referrals\n" +
    "will be permanently deleted.\n\n" +
    "This action is <b>irreversible</b>!",
  deleteAccountSuccess:
    "✅ Your account has been deleted.\n\nWe hope to see you again!",
  deleteAccountCancelled: "✅ Your account was not deleted.",
  exportDataProcessing: "⏳ Preparing your data...",
  exportDataReady: "✅ Your data is ready!",

  // About
  aboutTitle: "ℹ️ About Us",
  aboutDescription:
    "🤖 <b>Digital Products Sales Bot</b>\n\n" +
    "We provide the best digital services with the best prices and fastest delivery.\n\n" +
    "📧 <b>Contact Us:</b>\n" +
    "• Support: @YourSupportBot\n" +
    "• Channel: @YourChannel\n\n" +
    "💡 Version: 1.0.0",

  // Orders (My Orders)
  ordersTitle: "📦 My Orders",
  ordersEmpty:
    "You don't have any orders yet 📭\n\nVisit the Products section to start shopping.",
  ordersTotal: "📊 Total Orders",
  ordersActive: "🔵 Active Orders",
  ordersCompleted: "✅ Completed Orders",
  ordersSelectFilter: "Please select a filter:",

  // Orders Filter Buttons
  btnOrdersFilterActive: "🔵 Active",
  btnOrdersFilterCompleted: "✅ Completed",
  btnOrdersFilterAll: "📋 All",

  // Orders List
  ordersActiveTitle: "🔵 Active Orders",
  ordersCompletedTitle: "✅ Completed Orders",
  ordersAllTitle: "📋 All Orders",
  ordersSelectOne: "👆 Click on an order to view its details:",
  ordersNoActive: "You don't have any active orders",
  ordersNoCompleted: "You don't have any completed orders",

  // Order Details
  orderDetailsTitle: "📦 Order Details",
  orderNumber: "Order Number",
  orderProduct: "Product",
  orderStatus: "Status",
  orderTotalPrice: "Original Price",
  orderDiscount: "Discount",
  orderWalletUsed: "Wallet Used",
  orderFinalPrice: "Final Price",
  orderCreatedAt: "Created At",
  orderDeliveredAt: "Delivered At",
  orderScheduledTime: "Scheduled Time",
  orderNotes: "Notes",

  // Order Delivery Info
  orderDeliveryInfo: "Delivery Information",
  orderDeliveryCode: "Code",
  orderDeliveryEmail: "Email",
  orderDeliveryLink: "Link",
  orderDeliveryInstructions: "Instructions",

  // Order Buttons
  btnOrderOpenTicket: "💬 Open Ticket",
  btnOrderRenew: "🔄 Renew",
  btnOrderReschedule: "📅 Reschedule",
  btnOrderReportProblem: "⚠️ Report Problem",
  btnBackToOrders: "🔙 Back to Orders",

  // Order Actions
  orderNotFound: "Order not found",
  orderAccessDenied: "You don't have access to this order",
  orderTicketComingSoon: "Ticket system will be available soon",
  orderNotRenewable: "This product is not renewable",
  orderRenewComingSoon: "Renewal feature will be available soon",
  orderCannotReschedule: "This order cannot be rescheduled",
  orderRescheduleComingSoon: "Rescheduling feature will be available soon",
  orderReportComingSoon: "Problem reporting system will be available soon",
} satisfies LanguageMap;
