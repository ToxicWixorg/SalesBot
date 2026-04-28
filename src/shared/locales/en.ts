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
  rechargeMinAmount: (amount: string) =>
    format`Minimum recharge: ${bold(amount)} USD`,
  rechargeMaxAmount: (amount: string) =>
    format`Maximum recharge: ${bold(amount)} USD`,
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
    format`Amount: ${bold(amount)} USD\n\nClick the button below to proceed to the payment gateway:`,
  btnPayNow: "💳 Pay Now",
  rechargePaymentPending:
    "⏳ Waiting for payment...\n\nPlease complete the payment in your browser.",
  rechargePaymentSuccess: (amount: string) =>
    format`✅ Payment successful!\n\n${bold(amount)} USD has been added to your wallet.`,
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
} satisfies LanguageMap;
