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
    `💰 Всего наград: <b>${data.totalRewards}</b> Toman\n\n` +
    `🔗 <b>Ваша реферальная ссылка:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `📝 <b>Как это работает:</b>\n` +
    `1. Поделитесь ссылкой выше с друзьями\n` +
    `2. Когда они присоединятся, вы получите награду\n` +
    `3. Награды добавляются прямо на ваш кошелек\n\n` +
    `💎 Награда за реферала: <b>10,000 Toman</b>`,
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

  // Settings
  settingsTitle: "⚙️ Настройки",
  settingsDescription: "Управляйте настройками вашего аккаунта здесь.",
  btnAccountInfo: "👤 Информация об аккаунте",
  btnNotificationSettings: "🔔 Настройки уведомлений",
  btnPrivacy: "🔒 Конфиденциальность",
  btnAbout: "ℹ️ О нас",

  // Account Info
  accountInfoTitle: "👤 Информация об аккаунте",
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `👤 <b>Информация о вашем аккаунте</b>\n\n` +
    `🆔 ID пользователя: <code>${data.userId}</code>\n` +
    `👤 Имя пользователя: ${data.username ? `@${data.username}` : "Нет"}\n` +
    `📝 Имя: ${data.firstName}\n` +
    `📅 Дата регистрации: ${data.joinDate}\n\n` +
    `📊 <b>Статистика:</b>\n` +
    `🛒 Всего заказов: <b>${data.totalOrders}</b>\n` +
    `💰 Всего потрачено: <b>${data.totalSpent}</b> Toman\n` +
    `👥 Всего рефералов: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: "🔔 Настройки уведомлений",
  notificationSettingsDescription:
    "Выберите, какие уведомления вы хотите получать:",
  btnToggleOrderNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления о заказах`,
  btnToggleWalletNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления кошелька`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления об акциях`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Реферальные уведомления`,
  btnToggleStockNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления о наличии`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? "✅ Включено" : "❌ Отключено"}: ${type}`,
  allNotificationsEnabled: "✅ Все уведомления включены",
  allNotificationsDisabled: "❌ Все уведомления отключены",

  // Privacy
  privacyTitle: "🔒 Конфиденциальность",
  privacyDescription:
    "Управляйте вашими личными данными и настройками конфиденциальности:",
  btnClearHistory: "🗑️ Очистить историю",
  btnDeleteAccount: "❌ Удалить аккаунт",
  btnExportData: "📤 Экспорт данных",
  clearHistoryConfirm:
    "⚠️ Вы уверены, что хотите очистить историю?\n\n" +
    "Это действие необратимо.",
  clearHistorySuccess: "✅ Ваша история успешно очищена.",
  clearHistoryCancelled: "❌ Операция отменена.",
  deleteAccountConfirm:
    "⚠️ <b>Внимание!</b>\n\n" +
    "Вы уверены, что хотите удалить ваш аккаунт?\n\n" +
    "❌ Все ваши данные, включая:\n" +
    "• Заказы\n" +
    "• Кошелек\n" +
    "• Рефералы\n" +
    "будут удалены навсегда.\n\n" +
    "Это действие <b>необратимо</b>!",
  deleteAccountSuccess:
    "✅ Ваш аккаунт был удален.\n\nНадеемся увидеть вас снова!",
  deleteAccountCancelled: "✅ Ваш аккаунт не был удален.",
  exportDataProcessing: "⏳ Подготовка ваших данных...",
  exportDataReady: "✅ Ваши данные готовы!",

  // About
  aboutTitle: "ℹ️ О нас",
  aboutDescription:
    "🤖 <b>Бот продажи цифровых товаров</b>\n\n" +
    "Мы предоставляем лучшие цифровые сервисы по лучшим ценам и с быстрой доставкой.\n\n" +
    "📧 <b>Связаться с нами:</b>\n" +
    "• Поддержка: @TajEzat\n" +
    "• Канал: @ZendeBadParsi\n\n" +
    "💡 Версия: 1.0.0",

  // Orders (Мои заказы)
  ordersTitle: "📦 Мои заказы",
  ordersEmpty:
    "У вас пока нет заказов 📭\n\nПерейдите в раздел Товары, чтобы начать покупки.",
  ordersTotal: "📊 Всего заказов",
  ordersActive: "🔵 Активные заказы",
  ordersCompleted: "✅ Завершенные заказы",
  ordersSelectFilter: "Пожалуйста, выберите фильтр:",

  // Orders Filter Buttons
  btnOrdersFilterActive: "🔵 Активные",
  btnOrdersFilterCompleted: "✅ Завершенные",
  btnOrdersFilterAll: "📋 Все",

  // Orders List
  ordersActiveTitle: "🔵 Активные заказы",
  ordersCompletedTitle: "✅ Завершенные заказы",
  ordersAllTitle: "📋 Все заказы",
  ordersSelectOne: "👆 Нажмите на заказ, чтобы просмотреть детали:",
  ordersNoActive: "У вас нет активных заказов",
  ordersNoCompleted: "У вас нет завершенных заказов",

  // Order Details
  orderDetailsTitle: "📦 Детали заказа",
  orderNumber: "Номер заказа",
  orderProduct: "Товар",
  orderStatus: "Статус",
  orderTotalPrice: "Исходная цена",
  orderDiscount: "Скидка",
  orderWalletUsed: "Использовано из кошелька",
  orderFinalPrice: "Итоговая цена",
  orderCreatedAt: "Создан",
  orderDeliveredAt: "Доставлен",
  orderScheduledTime: "Запланировано на",
  orderNotes: "Заметки",

  // Order Delivery Info
  orderDeliveryInfo: "Информация о доставке",
  orderDeliveryCode: "Код",
  orderDeliveryEmail: "Email",
  orderDeliveryLink: "Ссылка",
  orderDeliveryInstructions: "Инструкции",

  // Order Buttons
  btnOrderOpenTicket: "💬 Открыть тикет",
  btnOrderRenew: "🔄 Продлить",
  btnOrderReschedule: "📅 Перенести",
  btnOrderReportProblem: "⚠️ Сообщить о проблеме",
  btnBackToOrders: "🔙 Назад к заказам",

  // Order Actions
  orderNotFound: "Заказ не найден",
  orderAccessDenied: "У вас нет доступа к этому заказу",
  orderTicketComingSoon: "Система тикетов скоро будет доступна",
  orderNotRenewable: "Этот товар не подлежит продлению",
  orderRenewComingSoon: "Функция продления скоро будет доступна",
  orderCannotReschedule: "Этот заказ нельзя перенести",
  orderRescheduleComingSoon: "Функция переноса скоро будет доступна",
  orderReportComingSoon: "Система сообщения о проблемах скоро будет доступна",

  // Support & Tickets
  supportMenuText:
    "💬 <b>Центр поддержки</b>\n\nКак мы можем вам помочь?\n\n" +
    "• Открыть тикет поддержки\n" +
    "• Сообщить о проблеме\n" +
    "• Просмотреть ваши тикеты",

  btnNewSupportTicket: "🎫 Новый тикет поддержки",
  btnNewReportTicket: "⚠️ Сообщить о проблеме",
  btnMyTickets: "📋 Мои тикеты",
  btnViewMyTickets: "📋 Просмотреть тикеты",
  btnBackToMain: "🏠 Вернуться в главное меню",
  btnReplyToTicket: "💬 Ответить",
  btnViewMessages: "💬 Просмотреть сообщения",
  btnBackToTickets: "🔙 Назад к тикетам",
  btnViewTicket: "👁️ Просмотреть тикет",
  btnViewOrder: "📦 Просмотреть заказ",

  // Ticket Creation
  ticketSupportPrompt:
    "🎫 <b>Новый тикет поддержки</b>\n\n" +
    "Пожалуйста, опишите ваш вопрос или проблему подробно.\n" +
    "Наша служба поддержки ответит как можно скорее.",

  ticketOrderPrompt:
    "📦 <b>Проблема с заказом</b>\n\n" +
    "Пожалуйста, опишите проблему с вашим заказом подробно.",

  ticketReportPrompt:
    "⚠️ <b>Сообщить о проблеме</b>\n\n" +
    "Пожалуйста, опишите проблему, с которой вы столкнулись, подробно.",

  ticketMessageTooShort:
    "❌ Пожалуйста, предоставьте больше деталей (минимум 10 символов)",
  ticketMessageEmpty: "❌ Сообщение не может быть пустым",

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    format`✅ <b>Тикет успешно создан!</b>\n\nНомер тикета: ${bold(data.ticketNumber)}\n\nНаша служба поддержки уведомлена и скоро ответит.`,

  ticketCreateError:
    "❌ Не удалось создать тикет. Пожалуйста, попробуйте снова или свяжитесь с поддержкой напрямую.",

  ticketOrderNotFound: "❌ Заказ не найден",

  // Ticket List
  ticketListTitle: "📋 <b>Ваши тикеты</b>",
  ticketListEmpty: "📭 У вас пока нет тикетов.",
  ticketListShowingFirst10: "Показаны первые 10 тикетов",
  ticketListError:
    "❌ Не удалось загрузить тикеты. Пожалуйста, попробуйте снова.",

  // Ticket Details
  ticketNotFound: "❌ Тикет не найден",
  ticketNotYours: "❌ Этот тикет вам не принадлежит",
  ticketAlreadyClosed: "🔒 Этот тикет закрыт",
  ticketLoadError:
    "❌ Не удалось загрузить тикет. Пожалуйста, попробуйте снова.",

  status: "Статус",
  created: "Создан",
  order: "Заказ",
  messages: "Сообщения",
  lastMessage: "Последнее сообщение",

  // Ticket Statuses
  ticketStatus_open: "🟢 Открыт",
  ticketStatus_waiting_user: "🟡 Ожидание вашего ответа",
  ticketStatus_waiting_support: "🟠 Ожидание поддержки",
  ticketStatus_in_progress: "🔵 В процессе",
  ticketStatus_resolved: "✅ Решён",
  ticketStatus_closed: "🔒 Закрыт",
  ticketStatus_blocked: "⛔ Заблокирован",

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    format`💬 <b>Ответ на ${bold(data.ticketNumber)}</b>\n\nПожалуйста, введите ваше сообщение:`,

  ticketReplySent:
    "✅ Ваше сообщение отправлено в поддержку!\n\nВы получите уведомление, когда они ответят.",

  ticketReplyError:
    "❌ Не удалось отправить сообщение. Пожалуйста, попробуйте снова.",

  ticketCreationCancelled: "❌ Создание тикета отменено",

  // Ticket Messages
  ticketMessages: "Сообщения",
  ticketNoMessages: "В этом тикете пока нет сообщений",
  ticketMessagesError: "❌ Не удалось загрузить сообщения",
  ticketShowingLast5Messages: "Показаны последние 5 сообщений",
  you: "Вы",
  support: "Поддержка",
} satisfies ShouldFollowLanguageStrict<typeof en>;
