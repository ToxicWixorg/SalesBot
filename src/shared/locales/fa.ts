import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { bold, format } from "gramio";
import type { en } from "./en.ts";

export const fa = {
  // Language Selection
  selectLanguage: "🌍 لطفاً زبان خود را انتخاب کنید:",
  languageSelected: (lang: string) =>
    format`✅ زبان به ${bold(lang)} تغییر یافت`,

  // Greeting & Welcome
  greeting: (name: string) => format`سلام، ${bold(name)}!`,
  welcome: (name: string) =>
    format`به فروشگاه دیجیتال ما خوش آمدید، ${bold(name)}! 🎉\n\nما انواع اشتراک‌ها و سرویس‌های دیجیتال را ارائه می‌دهیم.`,

  // Main Menu
  mainMenu: "🏠 منوی اصلی",
  chooseAction: "لطفاً یک گزینه را انتخاب کنید:",

  // Buttons
  btnProducts: "🛒 محصولات",
  btnMyOrders: "📦 سفارشات من",
  btnWallet: "💰 کیف پول",
  btnInviteFriends: "👥 دعوت دوستان",
  btnDiscountCode: "🎁 کد تخفیف",
  btnSupport: "💬 پشتیبانی",
  btnSettings: "⚙️ تنظیمات",
  btnBack: "🔙 بازگشت",
  btnCancel: "❌ لغو",
  btnMainMenu: "🏠 منوی اصلی",
  btnChangeLanguage: "🌐 تغییر زبان",
  btnNotifications: "🔔 اعلان‌ها",
  btnYes: "✅ بله",
  btnNo: "❌ خیر",
  btnConfirm: "✅ تایید",

  // Language Names
  langEnglish: "🇬🇧 English",
  langPersian: "🇮🇷 فارسی",
  langRussian: "🇷🇺 Русский",
} satisfies ShouldFollowLanguageStrict<typeof en>;
