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

  // Invite Friends (Referral)
  inviteBanner: (data: {
    totalReferrals: number;
    totalRewards: string;
    referralLink: string;
  }) =>
    `🎁 <b>Приглашайте друзей и зарабатывайте!</b>\n\n` +
    `👥 Ваши рефералы: <b>${data.totalReferrals}</b>\n` +
    `💰 Всего наград: <b>${data.totalRewards}</b> USD\n\n` +
    `🔗 <b>Ваша реферальная ссылка:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `📝 <b>Как это работает:</b>\n` +
    `1. Поделитесь ссылкой выше с друзьями\n` +
    `2. Когда они присоединятся, вы получите награду\n` +
    `3. Награды добавляются прямо на ваш кошелек\n\n` +
    `💎 Награда за реферала: <b>$10</b>`,
  btnShareInviteLink: "📤 Поделиться ссылкой",
  btnCopyLink: "📋 Копировать ссылку",
  btnViewReferrals: "👥 Просмотр рефералов",
  inviteShareText:
    "🎁 Присоединяйтесь по этой ссылке и получите специальную скидку!",
  inviteLinkCopied: (link: string) =>
    `✅ Ссылка скопирована!\n\n${link}\n\nОтправьте эту ссылку своим друзьям.`,
  noReferralsYet: "Вы еще никого не пригласили 📭",
  referralListTitle: "👥 <b>Список рефералов</b>",
  andMore: (count: number) => format`и еще ${bold(count)}...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `🎉 Новый пользователь (${data.userName}) присоединился по вашей реферальной ссылке!\n💰 ${data.amount} добавлено на ваш счет.`,
  // Discount Codes
  discountCodeInfo:
    "🎁 <b>Промокод</b>\n\n" +
    "Используйте промокоды для получения скидок на ваши покупки.\n\n" +
    "Вы можете ввести промокод при оформлении заказа или проверить его здесь.",
  btnEnterDiscountCode: "✏️ Ввести промокод",
  btnDiscountHistory: "📊 История использования",
  enterDiscountCodePrompt:
    "✏️ Пожалуйста, введите ваш промокод:\n\n" +
    "Пример: <code>SUMMER2024</code>",
  btnTryAgain: "🔄 Попробовать снова",
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `✅ <b>Действительный промокод!</b>\n\n` +
    `🎫 Код: <code>${data.code}</code>\n` +
    `📝 Тип: ${data.type}\n` +
    `💰 Значение: ${data.value}\n` +
    `📄 Описание: ${data.description}\n\n` +
    `Вы можете использовать этот код при оформлении заказа.`,
  discountCodeInvalid: (reason: string) =>
    `❌ <b>Недействительный промокод</b>\n\n${reason}`,
  discountTypePercentage: "Процент",
  discountTypeFixed: "Фиксированная сумма",
  noDescription: "Нет описания",
  noDiscountHistory: "Вы еще не использовали промокоды 📭",
  discountHistoryTitle: "📊 <b>История использования промокодов</b>",
  discountAmount: "Сумма скидки",
  orderId: "ID заказа",
} satisfies ShouldFollowLanguageStrict<typeof en>;
