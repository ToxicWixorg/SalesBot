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

  // Language Names
  langEnglish: "🇬🇧 English",
  langPersian: "🇮🇷 فارسی",
  langRussian: "🇷🇺 Русский",
} satisfies LanguageMap;
