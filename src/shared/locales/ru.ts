import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { bold, format } from "gramio";
import type { en } from "./en.ts";

export const ru = {
  // Language Selection
  selectLanguage: "🌍 Пожалуйста, выберите ваш язык:",
  languageSelected: (lang: string) =>
    format`✅ Язык установлен на ${bold(lang)}`,

  // Greeting & Welcome
  greeting: (name: string) => format`Привет, ${bold(name)}!`,
  welcome: (name: string) =>
    format`Добро пожаловать в наш цифровой магазин, ${bold(name)}! 🎉\n\nМы предлагаем различные цифровые подписки и услуги.`,

  // Main Menu
  mainMenu: "🏠 Главное меню",
  chooseAction: "Пожалуйста, выберите действие:",

  // Buttons
  btnProducts: "🛒 Продукты",
  btnMyOrders: "📦 Мои заказы",
  btnWallet: "💰 Кошелек",
  btnInviteFriends: "👥 Пригласить друзей",
  btnDiscountCode: "🎁 Промокод",
  btnSupport: "💬 Поддержка",
  btnSettings: "⚙️ Настройки",
  btnBack: "🔙 Назад",
  btnCancel: "❌ Отмена",
  btnMainMenu: "🏠 Главное меню",
  btnChangeLanguage: "🌐 Изменить язык",
  btnNotifications: "🔔 Уведомления",
  btnYes: "✅ Да",
  btnNo: "❌ Нет",
  btnConfirm: "✅ Подтвердить",

  // Products
  btnBuyProduct: "🛍️ Купить",
  btnNotifyStock: "🔔 Уведомить о наличии",
  btnConfirmOrder: "✅ Подтвердить заказ",
  btnAddDiscountCode: "🎫 Добавить промокод",
  productsTitle: "🛍️ Продукты",
  selectCategory: "🏷️ Выберите категорию:",
  categoryProducts: (category: string) => format`Продукты в ${bold(category)}:`,
  noProducts: "❌ Нет продуктов в этой категории.",
  productDetails: "📦 Детали продукта",
  price: "💵 Цена:",
  stock: "📦 Наличие:",
  available: "✅ Доступно",
  outOfStock: "❌ Нет в наличии",
  deliveryTime: "⏰ Время доставки:",
  deliveryType: "🚚 Тип доставки:",
  deliveryAutomatic: "⚡ Мгновенно (Автомат)",
  deliveryManual: "👤 Вручную (1-24 часа)",
  deliveryCoordination: "📝 Требуется координация",
  selectPlan: "📋 Выберите план:",
  orderSummary: "📝 Сводка заказа:",
  total: "💰 Итого:",
  currency: "USD",
  oneTime: "Одноразовый",
  duration_day: "дней",
  duration_month: "месяцев",
  duration_year: "лет",

  // Language Names
  langEnglish: "🇬🇧 English",
  langPersian: "🇮🇷 فارسی",
  langRussian: "🇷🇺 Русский",
} satisfies ShouldFollowLanguageStrict<typeof en>;
