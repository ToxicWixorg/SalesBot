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

  // Wallet
  walletTitle: "💰 Кошелек",
  walletBalance: (balance: string) => format`Баланс: ${bold(balance)} USD`,
  walletEmpty: "Ваш кошелек пуст 📭",
  btnRechargeWallet: "💳 Пополнить кошелек",
  btnTransactionHistory: "📊 История транзакций",

  // Wallet Recharge
  rechargeWalletTitle: "💳 Пополнение кошелька",
  rechargeSelectMethod: "Пожалуйста, выберите способ пополнения:",
  btnRechargeCrypto: "🪙 Криптоплатеж (USDT)",
  btnRechargeCard: "💳 Оплата картой",
  btnRechargeZarinpal: "💰 Zarinpal Gateway",

  rechargeEnterAmount: "💵 Пожалуйста, введите сумму пополнения в USD:",
  rechargeEnterAmountUsdt: "💵 Пожалуйста, введите количество USDT:",
  rechargeMinAmount: (amount: string) =>
    format`Минимальная сумма: ${bold(amount)} USD`,
  rechargeMaxAmount: (amount: string) =>
    format`Максимальная сумма: ${bold(amount)} USD`,
  rechargeMinAmountUsdt: (amount: string) =>
    format`Минимальное количество: ${bold(amount)} USDT`,
  rechargeMaxAmountUsdt: (amount: string) =>
    format`Максимальное количество: ${bold(amount)} USDT`,
  rechargeInvalidAmount: "❌ Введена неверная сумма",
  rechargeTooLow: (min: string) =>
    format`❌ Сумма пополнения должна быть не менее ${bold(min)} USD`,
  rechargeTooHigh: (max: string) =>
    format`❌ Сумма пополнения не может превышать ${bold(max)} USD`,

  // Crypto Payment
  rechargeCryptoTitle: "🪙 Криптоплатеж",
  rechargeCryptoAddress: (address: string) =>
    format`Адрес кошелька:\n\n${bold(address)}`,
  rechargeCryptoAmount: (amount: string) => format`Сумма USDT: ${bold(amount)}`,
  rechargeCryptoNetwork: (network: string) => format`Сеть: ${bold(network)}`,
  rechargeCryptoInstructions:
    "📝 Инструкция:\n\n1. Отправьте USDT на адрес выше\n2. Отправьте TxID (ID транзакции)\n3. Ожидайте подтверждения до 30 минут",
  rechargeCryptoSendTxId: "Пожалуйста, отправьте TxID (ID транзакции):",
  rechargeCryptoTxIdReceived:
    "✅ ID транзакции получен\n\nПроверка платежа...\nЭтот процесс может занять до 30 минут.",
  rechargeCryptoVerified: (amount: string) =>
    format`✅ Платеж подтвержден!\n\n${bold(amount)} USD добавлено на ваш кошелек.`,
  rechargeCryptoFailed:
    "❌ Платеж не подтвержден. Пожалуйста, свяжитесь с поддержкой.",

  // Card/Zarinpal Payment
  rechargeCardTitle: "💳 Оплата картой",
  rechargeZarinpalTitle: "💰 Zarinpal Gateway",
  rechargePaymentLink: (amount: string) =>
    format`Сумма: ${bold(amount)} USD\n\nНажмите кнопку ниже для перехода к платежному шлюзу:`,
  btnPayNow: "💳 Оплатить",
  rechargePaymentPending:
    "⏳ Ожидание оплаты...\n\nПожалуйста, завершите оплату в браузере.",
  rechargePaymentSuccess: (amount: string) =>
    format`✅ Оплата успешна!\n\n${bold(amount)} USD добавлено на ваш кошелек.`,
  rechargePaymentFailed: "❌ Оплата не удалась. Пожалуйста, попробуйте снова.",
  rechargePaymentCancelled: "⚠️ Оплата отменена.",

  // Transaction History
  transactionHistoryTitle: "📊 История транзакций",
  transactionHistoryEmpty: "История транзакций пуста 📭",
  transactionType: "Тип:",
  transactionAmount: "Сумма:",
  transactionDate: "Дата:",
  transactionDescription: "Описание:",

  // Transaction Types
  txTypeCredit: "➕ Пополнение",
  txTypeDebit: "➖ Списание",

  // Transaction Sources
  txSourcePurchase: "🛒 Покупка",
  txSourceRecharge: "💳 Пополнение",
  txSourceRefund: "↩️ Возврат",
  txSourceReferral: "👥 Реферальная награда",
  txSourceReward: "🎁 Награда",
  txSourcePerk: "🎯 Perk награда",
  txSourceAdminAdjustment: "⚙️ Корректировка администратора",

  // Language Names
  langEnglish: "🇬🇧 English",
  langPersian: "🇮🇷 فارسی",
  langRussian: "🇷🇺 Русский",
} satisfies ShouldFollowLanguageStrict<typeof en>;
