import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { e } from "./emojies";
import type { fa } from "./fa";

export const ru = {
  // Language Selection
  selectLanguage: `${e.earth} <b>Выбери свой язык:</b>`,
  languageSelected: (lang: string) =>
    `${e.checkBold} Язык изменён на <b>${lang}</b>`,

  // Greeting & Welcome
  greeting: (name: string) => `Привет <b>${name}</b>! ${e.sparkles}`,
  welcome: (name: string) =>
    `${e.crown} Привет <b>${name}</b>, добро пожаловать!\n\n` +
    `${e.gem} Лучшие цифровые сервисы по лучшим ценам — всё здесь.\n`,

  // Main Menu
  mainMenu: `${e.home} Главное меню`,
  chooseAction: "",
  main_menu: (name: string) =>
    `${e.crown} Привет <b>${name}</b>!\n\n` +
    `${e.sparkles} Добро пожаловать в наш цифровой магазин!\n\n` +
    `${e.gem} Премиум подписки, AI-аккаунты и цифровые сервисы — всё по лучшим ценам.\n\n` +
    `Выбери действие:`,

  // Buttons
  btnProducts: `🛍️ Продукты`,
  btnMyOrders: `📦 Мои заказы`,
  btnWallet: `💰 Кошелёк`,
  btnInviteFriends: `👥 Пригласить друзей`,
  btnDiscountCode: `🎁 Промокод`,
  btnSupport: `💬 Поддержка`,
  btnSettings: `⚙️ Настройки`,
  btnBack: `🔙 Назад`,
  btnCancel: `❌ Отмена`,
  btnMainMenu: `🏠 Главное меню`,
  btnChangeLanguage: `🌐 Сменить язык`,
  btnNotifications: `🔔 Уведомления`,
  btnYes: `✅ Да`,
  btnNo: `❌ Нет`,
  btnConfirm: `✅ Подтвердить`,

  // Products
  btnBuyProduct: `🛍️ Купить`,
  btnNotifyStock: `🔔 Уведомить о наличии`,
  btnConfirmOrder: `✅ Подтвердить заказ`,
  btnAddDiscountCode: `🎫 Добавить промокод`,
  productsTitle: `${e.bag} Продукты`,
  selectCategory: `${e.tag} Выбери категорию:`,
  categoryProducts: (category: string) => `Продукты в <b>${category}</b>:`,
  noProducts: `${e.cross} В этой категории нет доступных продуктов.`,
  productDetails: `${e.box} Детали продукта`,
  price: `${e.wallet} Цена:`,
  stock: `${e.box} Наличие:`,
  available: `${e.checkBold} В наличии`,
  outOfStock: `${e.cross} Нет в наличии`,
  productNotFound: `${e.cross} Продукт не найден`,
  planNotFound: `${e.cross} Тариф не найден`,
  categoryNotFound: `${e.cross} Категория не найдена`,
  noPlansAvailable: `${e.cross} Нет доступных тарифов`,
  insufficientBalanceAlert: `${e.cross} Недостаточно средств`,
  deliveryTime: `${e.clock} Время доставки:`,
  deliveryType: `${e.truck} Тип доставки:`,
  deliveryAutomatic: `${e.zap} Мгновенно (автоматически)`,
  deliveryManual: `${e.person} Вручную (1-24 часа)`,
  deliveryCoordination: `${e.calendar} Требует согласования`,
  selectPlan: `${e.clipboard} Выбери тариф:`,
  orderSummary: `${e.clipboard} Сводка заказа:`,
  total: `${e.wallet} Итого:`,
  currency: "USD",
  oneTime: "Разово",
  duration_day: "дн.",
  duration_month: "мес.",
  duration_year: "г.",

  // Wallet
  walletTitle: `${e.wallet} Кошелёк`,
  walletBalance: (balance: string) => `Баланс: <b>${balance}</b> USD`,
  walletEmpty: `${e.wallet} Твой кошелёк пуст ${e.sparkles} Пополни его и начинай!`,
  btnRechargeWallet: `💳 Пополнить кошелёк`,
  btnTransactionHistory: `📊 История транзакций`,

  // Wallet Recharge
  rechargeWalletTitle: `${e.card} Пополнение кошелька`,
  rechargeSelectMethod: `Выбери способ пополнения:`,
  btnRechargeCrypto: `🪙 Крипто (USDT)`,
  btnRechargeCard: `💳 Банковская карта`,
  btnRechargeZarinpal: `💰 Zarinpal`,

  rechargeEnterAmount: `${e.wallet} Введи сумму пополнения:`,
  rechargeEnterAmountUsdt: `${e.coin} Введи сумму USDT:`,
  rechargeMinAmount: (amount: string) =>
    `Минимальная сумма: <b>${amount}</b> USD`,
  rechargeMaxAmount: (amount: string) =>
    `Максимальная сумма: <b>${amount}</b> USD`,
  rechargeMinAmountUsdt: (amount: string) => `Минимум: <b>${amount}</b> USDT`,
  rechargeMaxAmountUsdt: (amount: string) => `Максимум: <b>${amount}</b> USDT`,
  rechargeInvalidAmount: `${e.cross} Введена некорректная сумма`,
  rechargeTooLow: (min: string) =>
    `${e.cross} Сумма пополнения должна быть не менее <b>${min}</b> USD`,
  rechargeTooHigh: (max: string) =>
    `${e.cross} Сумма пополнения не может превышать <b>${max}</b> USD`,

  // Crypto Payment
  rechargeCryptoTitle: `${e.coin} Крипто-оплата`,
  rechargeCryptoAddress: (address: string) =>
    `Адрес кошелька:\n\n<code>${address}</code>`,
  rechargeCryptoAmount: (amount: string) => `Сумма USDT: <b>${amount}</b>`,
  rechargeCryptoNetwork: (network: string) => `Сеть: <b>${network}</b>`,
  rechargeCryptoInstructions:
    `${e.clipboard} <b>Инструкция по оплате:</b>\n\n` +
    `1. Отправь указанную сумму USDT на адрес выше\n` +
    `2. Пришли TxID (ID транзакции)\n` +
    `3. Подожди до 30 минут для подтверждения`,
  rechargeCryptoSendTxId: `Пришли TxID (ID транзакции):`,
  rechargeCryptoTxIdReceived: `${e.checkBold} TxID получен\n\n${e.hourglass} Проверяем платёж...\nЭто может занять до 30 минут.`,
  rechargeCryptoVerified: (amount: string) =>
    `${e.party} <b>Платёж подтверждён!</b>\n\n${e.gem} <b>${amount}</b> USD зачислено на твой кошелёк.`,
  rechargeCryptoFailed: `${e.cross} Платёж не подтверждён. Обратись в поддержку.`,

  // Card/Zarinpal Payment
  rechargeCardTitle: `${e.card} Оплата картой`,
  rechargeZarinpalTitle: `${e.wallet} Zarinpal`,
  rechargePaymentLink: (amount: string) =>
    `Сумма: <b>${amount}</b>\n\nНажми кнопку ниже, чтобы перейти к оплате:`,
  btnPayNow: `💳 Оплатить`,
  rechargePaymentPending: `${e.hourglass} Ожидаем оплату...\n\nПожалуйста, завершить оплату в браузере.`,
  rechargePaymentSuccess: (amount: string) =>
    `${e.party} <b>Оплата прошла!</b>\n\n${e.gem} <b>${amount}</b> зачислено на твой кошелёк.`,
  rechargePaymentFailed: `${e.cross} Оплата не прошла. Попробуй ещё раз.`,
  rechargePaymentCancelled: `${e.warn} Оплата отменена.`,

  // Transaction History
  transactionHistoryTitle: `${e.chart} История транзакций`,
  transactionHistoryEmpty: `${e.chart} Транзакций пока нет — сделай первую покупку!`,
  transactionType: "Тип:",
  transactionAmount: "Сумма:",
  transactionDate: "Дата:",
  transactionDescription: "Описание:",

  // Transaction Types
  txTypeCredit: "Пополнение",
  txTypeDebit: "Списание",

  // Transaction Sources
  txSourcePurchase: `${e.bag} Покупка`,
  txSourceRecharge: `${e.card} Пополнение`,
  txSourceRefund: `${e.bounce} Возврат`,
  txSourceReferral: `${e.users} Реферальное вознаграждение`,
  txSourceReward: `${e.gift} Награда`,
  txSourcePerk: `${e.target} Бонус Perk`,
  txSourceAdminAdjustment: `${e.settings} Корректировка администратора`,

  // ── Новые ключи пополнения кошелька ──────────────────────────────────
  rechargeAmount: (amount: string) => `💰 Сумма: <b>${amount}</b> Томан`,
  rechargeMethodSelectTitle: (amount: string) =>
    `${e.wallet} Сумма: <b>${amount}</b> Томан\n\nВыбери способ оплаты:`,
  rechargeCardNumbers: `Номера карт`,
  rechargeCardSendReceipt: `После перевода суммы пришли фото чека сюда.`,
  rechargeCardExpectPhoto: `${e.cross} Пожалуйста, пришли фото квитанции (изображение, не текст).`,
  rechargePendingApproval: `${e.checkBold} Заявка отправлена!\n\n${e.hourglass} Ожидай подтверждения администратора — обычно до 30 минут.`,
  rechargeApproved: (amount: string) =>
    `${e.party} <b>Пополнение подтверждено!</b>\n\n${e.gem} <b>${amount}</b> Томан добавлено на твой кошелёк.`,
  rechargeRejected: `${e.cross} <b>Заявка на пополнение отклонена.</b>\n\nСвяжись с поддержкой при необходимости.`,
  rechargeSessionExpired: `${e.warn} Сессия истекла. Начни заново из кошелька.`,
  rechargeMethodDisabled: `${e.cross} Этот способ оплаты временно недоступен.`,
  rechargeNoMethodAvailable: `${e.cross} Нет доступных способов оплаты. Попробуй позже.`,
  rechargeUsdtRate: (rate: string) =>
    `📈 Текущий курс: <b>${rate}</b> Томан/USDT`,
  rechargeRateUnavailable: `${e.cross} Текущий курс USDT недоступен. Подожди и попробуй снова.`,
  rechargeCryptoInvalidTxId: `${e.cross} Неверный TxID (минимум 10 символов). Пришли ещё раз.`,
  rechargeZarinpalInstructions: `${e.clipboard} Нажми Оплатить, заверши оплату, затем нажми Проверить оплату.`,
  btnVerifyPayment: `Проверить оплату`,
  rechargeZarinpalVerifying: `${e.hourglass} Проверяем оплату...`,
  rechargeZarinpalSuccess: (amount: string) =>
    `${e.party} <b>Оплата подтверждена!</b>\n\n${e.gem} <b>${amount}</b> Томан добавлено на твой кошелёк.`,
  rechargeZarinpalFailed: `${e.cross} Оплата не подтверждена или ещё не обработана.`,
  rechargeZarinpalRetry: `Попробуй снова или проверь ещё раз.`,

  // Language Names
  langEnglish: `${e.flag_en} English`,
  langPersian: `${e.flag_ir} فارسی`,
  langRussian: `${e.flag_ru} Русский`,

  // Invite Friends (Referral)
  inviteBanner: (data: {
    totalReferrals: number;
    totalRewards: string;
    referralLink: string;
  }) =>
    `${e.crown} <b>Приглашай друзей и зарабатывай!</b>\n\n` +
    `${e.users} Успешных приглашений: <b>${data.totalReferrals}</b>\n` +
    `${e.gem} Всего заработано: <b>${data.totalRewards}</b>\n\n` +
    `<b>Твоя реферальная ссылка:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `${e.sparkles} <b>Как это работает:</b>\n` +
    `1. Поделись ссылкой с друзьями\n` +
    `2. Когда они зарегистрируются, ты получишь вознаграждение\n` +
    `3. Вознаграждение зачисляется прямо на кошелёк\n\n` +
    `${e.gem} Вознаграждение за каждого: <b>10 000</b> Toман`,
  btnShareInviteLink: `📤 Поделиться ссылкой`,
  btnCopyLink: `📋 Скопировать ссылку`,
  btnViewReferrals: `👥 Список рефералов`,
  inviteShareText: `${e.gift} Зарегистрируйся по этой ссылке и получи скидку!`,
  inviteLinkCopied: (link: string) =>
    `${e.checkBold} Ссылка скопирована!\n\n<code>${link}</code>\n\nОтправь эту ссылку друзьям.`,
  noReferralsYet: `${e.users} Ты ещё никого не пригласил — начни и зарабатывай!`,
  referralListTitle: `${e.users} <b>Список рефералов</b>`,
  andMore: (count: number) => `и ещё <b>${count}</b>...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `${e.party} Новый пользователь (<b>${data.userName}</b>) присоединился по твоей реферальной ссылке!\n` +
    `${e.gem} <b>${data.amount}</b> зачислено на твой счёт.`,

  // Discount Codes
  discountCodeInfo:
    `${e.gift} <b>Промокод</b>\n\n` +
    `Используй промокоды для получения скидок на покупки.\n\n` +
    `Можно ввести код при оформлении заказа или проверить здесь.`,
  btnEnterDiscountCode: `✏️ Ввести промокод`,
  btnDiscountHistory: `📊 История использования`,
  enterDiscountCodePrompt: `${e.pencil} Введи промокод:\n\nПример: <code>SUMMER2024</code>`,
  btnTryAgain: `🔄 Попробовать снова`,
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `${e.checkBold} <b>Промокод действителен!</b>\n\n` +
    `${e.ticket} Код: <code>${data.code}</code>\n` +
    `${e.tag} Тип: ${data.type}\n` +
    `${e.gem} Значение: ${data.value}\n` +
    `${e.clipboard} Описание: ${data.description}\n\n` +
    `Используй этот код при оформлении заказа.`,
  discountCodeInvalid: (reason: string) =>
    `${e.cross} <b>Промокод недействителен</b>\n\n${reason}`,
  discountTypePercentage: "Процентная скидка",
  discountTypeFixed: "Фиксированная скидка",
  noDescription: "Без описания",
  noDiscountHistory: `${e.chart} Ты ещё не использовал промокоды — начни экономить!`,
  discountHistoryTitle: `${e.chart} <b>История промокодов</b>`,
  discountAmount: "Сумма скидки",
  orderId: "Номер заказа",

  // Settings
  userNotFound: `${e.cross} Пользователь не найден`,
  userIdentificationError: `${e.cross} Не удалось определить пользователя`,
  settingsTitle: `${e.settings} Настройки`,
  settingsDescription: `${e.info} Управляй своим аккаунтом здесь.`,
  btnAccountInfo: `👤 Информация об аккаунте`,
  btnNotificationSettings: `🔔 Настройки уведомлений`,
  btnPrivacy: `🔒 Конфиденциальность`,
  btnAbout: `ℹ️ О нас`,

  // Account Info
  accountInfoTitle: `${e.person} Информация об аккаунте`,
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `${e.crown} <b>Твой аккаунт</b>\n\n` +
    `${e.id} ID: <code>${data.userId}</code>\n` +
    `${e.person} Имя пользователя: ${data.username ? `@${data.username}` : "Нет"}\n` +
    `${e.tag} Имя: ${data.firstName}\n` +
    `${e.calendar} Дата регистрации: ${data.joinDate}\n\n` +
    `${e.chart} <b>Статистика:</b>\n` +
    `${e.bag} Покупки: <b>${data.totalOrders}</b>\n` +
    `${e.gem} Всего потрачено: <b>${data.totalSpent}</b>\n` +
    `${e.users} Рефералы: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: `${e.bell} Настройки уведомлений`,
  notificationSettingsDescription: `${e.info} Выбери, какие уведомления получать:`,
  btnToggleOrderNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления о заказах`,
  btnToggleWalletNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления о кошельке`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления об акциях`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления о рефералах`,
  btnToggleStockNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Уведомления о наличии`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? `${e.checkBold} Включено` : `${e.cross} Отключено`}: ${type}`,
  allNotificationsEnabled: `${e.checkBold} Все уведомления включены`,
  allNotificationsDisabled: `${e.cross} Все уведомления отключены`,

  // Privacy
  privacyTitle: `${e.lock} Конфиденциальность`,
  privacyDescription: `${e.shield} Управление персональными данными:`,
  btnClearHistory: `🗑️ Очистить историю`,
  btnDeleteAccount: `❌ Удалить аккаунт`,
  btnExportData: `📤 Экспортировать данные`,
  clearHistoryConfirm:
    `${e.warn} <b>Ты уверен?</b>\n\n` +
    `История будет удалена — это действие необратимо.`,
  clearHistorySuccess: `${e.checkBold} История успешно очищена.`,
  clearHistoryCancelled: `${e.cross} Действие отменено.`,
  deleteAccountConfirm:
    `${e.warn} <b>Внимание!</b>\n\n` +
    `Ты уверен, что хочешь удалить аккаунт?\n\n` +
    `${e.cross} Всё нижеперечисленное будет удалено <b>навсегда</b>:\n` +
    `- Заказы\n- Кошелёк\n- Рефералы\n\n` +
    `Это действие <b>необратимо</b>!`,
  deleteAccountSuccess: `${e.checkBold} Твой аккаунт удалён.\n\nНадеемся снова тебя увидеть!`,
  deleteAccountCancelled: `${e.checkBold} Аккаунт не был удалён.`,
  exportDataProcessing: ` Подготавливаем твои данные...`,
  exportDataReady: `${e.checkBold} Данные готовы!`,

  // About
  aboutTitle: `${e.info} О нас`,
  aboutDescription:
    `${e.robot} <b>Бот цифрового магазина</b>\n\n` +
    `${e.gem} Лучшие сервисы по лучшим ценам и с самой быстрой доставкой.\n\n` +
    `${e.mail} <b>Связаться с нами:</b>\n` +
    `- Поддержка: @TajEzat\n` +
    `- Канал: @ZendeBadParsi\n\n` +
    `${e.tag} Версия: 1.0.0`,

  // Orders
  ordersTitle: `${e.box} Мои заказы`,
  ordersEmpty: `${e.box} Ты ещё ничего не заказывал!\n\nПосмотри продукты и сделай первую покупку.`,
  ordersTotal: `${e.chart} Всего заказов`,
  ordersActive: `${e.blue} Активные заказы`,
  ordersCompleted: `${e.green} Выполненные заказы`,
  ordersSelectFilter: `Выбери фильтр:`,

  // Orders Filter Buttons
  btnOrdersFilterActive: `🔵 Активные`,
  btnOrdersFilterCompleted: `🟢 Выполненные`,
  btnOrdersFilterAll: `📋 Все`,

  // Orders List
  ordersActiveTitle: `${e.blue} Активные заказы`,
  ordersCompletedTitle: `${e.green} Выполненные заказы`,
  ordersAllTitle: `${e.clipboard} Все заказы`,
  ordersSelectOne: `${e.pin} Нажми на заказ, чтобы увидеть детали:`,
  ordersNoActive: `${e.info} У тебя нет активных заказов`,
  ordersNoCompleted: `${e.info} У тебя нет выполненных заказов`,

  // Order Details
  orderDetailsTitle: `${e.box} Детали заказа`,
  orderNumber: "Номер заказа",
  orderProduct: "Продукт",
  orderStatus: "Статус",
  orderTotalPrice: "Исходная цена",
  orderDiscount: "Скидка",
  orderWalletUsed: "Использовано с кошелька",
  orderFinalPrice: "Итоговая цена",
  orderCreatedAt: "Дата создания",
  orderDeliveredAt: "Дата доставки",
  orderScheduledTime: "Запланированное время",
  orderNotes: "Примечания",

  // Order Delivery Info
  orderDeliveryInfo: "Информация о доставке",
  orderDeliveryCode: "Код",
  orderDeliveryEmail: "Email",
  orderDeliveryLink: "Ссылка",
  orderDeliveryInstructions: "Инструкции",

  // Order Buttons
  btnOrderOpenTicket: `💬 Открыть тикет`,
  btnOrderRenew: `🔄 Продлить`,
  btnOrderReschedule: `📅 Перенести`,
  btnOrderReportProblem: `⚠️ Сообщить о проблеме`,
  btnBackToOrders: `🔙 Назад к заказам`,

  // Order Actions
  orderNotFound: "Заказ не найден",
  orderAccessDenied: "Доступ к этому заказу запрещён",
  orderTicketComingSoon: "Система тикетов скоро появится",
  orderNotRenewable: "Этот продукт нельзя продлить",
  orderRenewComingSoon: "Функция продления скоро появится",
  renewScreenTitle: "🔄 Продление сервиса",
  renewWalletSuccess: (data: {
    orderId: number;
    productName: string;
    remainingBalance: string;
  }) =>
    `✅ <b>Продление выполнено успешно!</b>\n\n` +
    `📦 ${data.productName}\n` +
    `🎫 Заказ #${data.orderId}\n\n` +
    `👛 Остаток баланса: ${data.remainingBalance} томан`,
  orderCannotReschedule: "Этот заказ нельзя перенести",
  orderRescheduleComingSoon: "Функция переноса скоро появится",
  orderReportComingSoon: "Система сообщений о проблемах скоро появится",
  errorFetchingOrders: `${e.cross} Ошибка при загрузке заказов`,
  errorFetchingOrderDetails: `${e.cross} Ошибка при загрузке деталей заказа`,
  errorReschedulingOrder: `${e.cross} Ошибка при переносе заказа`,
  errorRenewingOrder: `${e.cross} Ошибка при продлении заказа`,
  errorOpeningTicket: `${e.cross} Ошибка при открытии тикета`,
  errorReportingProblem: `${e.cross} Ошибка при отправке жалобы`,

  // Support & Tickets
  supportMenuText:
    `${e.chat} <b>Центр поддержки</b>\n\nКак я могу помочь?\n\n` +
    `- Отправить тикет\n` +
    `- Сообщить о проблеме\n` +
    `- Просмотреть тикеты`,

  btnNewSupportTicket: `🎫 Новый тикет`,
  btnNewReportTicket: `⚠️ Сообщить о проблеме`,
  btnMyTickets: `📋 Мои тикеты`,
  btnViewMyTickets: `👁️ Просмотр тикетов`,
  btnBackToMain: `🏠 Главное меню`,
  btnReplyToTicket: `💬 Ответить`,
  btnViewMessages: `💬 Просмотр сообщений`,
  btnBackToTickets: `🔙 Назад к тикетам`,
  btnViewTicket: `👁️ Просмотр тикета`,
  btnViewOrder: `📦 Просмотр заказа`,

  // Ticket Creation
  ticketSupportPrompt:
    `${e.ticket} <b>Новый тикет поддержки</b>\n\n` +
    `Подробно опиши свой вопрос или проблему.\n` +
    `Наша команда ответит как можно скорее.`,

  ticketOrderPrompt:
    `${e.box} <b>Проблема с заказом</b>\n\n` +
    `Подробно опиши проблему с твоим заказом.`,

  ticketReportPrompt:
    `${e.warn} <b>Сообщить о проблеме</b>\n\n` +
    `Подробно опиши проблему, с которой ты столкнулся.`,

  ticketMessageTooShort: `${e.cross} Пожалуйста, опиши подробнее (минимум 10 символов)`,
  ticketMessageEmpty: `${e.cross} Сообщение не может быть пустым`,

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    `${e.checkBold} <b>Тикет создан!</b>\n\nНомер тикета: <b>${data.ticketNumber}</b>\n\nНаша команда поддержки уведомлена и скоро ответит.`,

  ticketCreateError: `${e.cross} Не удалось создать тикет. Попробуй снова или обратись в поддержку напрямую.`,

  ticketOrderNotFound: `${e.cross} Заказ не найден`,

  // Ticket List
  ticketListTitle: `${e.clipboard} <b>Твои тикеты</b>`,
  ticketListEmpty: `${e.chat} У тебя ещё нет тикетов — есть проблема? Открой тикет!`,
  ticketListShowingFirst10: "Показаны первые 10 тикетов",
  ticketListError: `${e.cross} Не удалось загрузить тикеты. Попробуй снова.`,

  // Ticket Details
  ticketNotFound: `${e.cross} Тикет не найден`,
  ticketNotYours: `${e.cross} Этот тикет не принадлежит тебе`,
  ticketAlreadyClosed: `${e.lock} Этот тикет закрыт`,
  ticketLoadError: `${e.cross} Не удалось загрузить тикет. Попробуй снова.`,

  status: "Статус",
  created: "Создан",
  order: "Заказ",
  messages: "Сообщения",
  lastMessage: "Последнее сообщение",

  // Ticket Statuses
  ticketStatus_open: `${e.green} Открыт`,
  ticketStatus_waiting_user: `${e.yellow} Ожидает ответа`,
  ticketStatus_waiting_support: `${e.orange} Ожидает поддержки`,
  ticketStatus_in_progress: `${e.blue} В работе`,
  ticketStatus_resolved: `${e.checkBold} Решён`,
  ticketStatus_closed: `${e.lock} Закрыт`,
  ticketStatus_blocked: `${e.no} Заблокирован`,

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    `${e.chat} <b>Ответ на ${data.ticketNumber}</b>\n\nВведи сообщение:`,

  ticketReplySent: `${e.checkBold} Сообщение отправлено!\n\nЯ уведомлю тебя, когда придёт ответ.`,

  ticketReplyError: `${e.cross} Не удалось отправить сообщение. Попробуй снова.`,

  ticketCreationCancelled: `${e.cross} Создание тикета отменено`,

  // Ticket Messages
  ticketMessages: "Сообщения",
  ticketNoMessages: "В этом тикете ещё нет сообщений",
  ticketMessagesError: `${e.cross} Не удалось загрузить сообщения`,
  ticketShowingLast5Messages: "Показаны последние 5 сообщений",
  you: "Ты",
  support: "Поддержка",

  // Purchase / Order Completion
  insufficientBalance: (data: { required: string; current: string }) =>
    `${e.cross} <b>Недостаточно средств</b>\n\nНужно: <b>${data.required}</b>\nТвой баланс: <b>${data.current}</b>\n\nПополни кошелёк и попробуй снова.`,
  noConfigAvailable: `${e.cross} Нет доступных VPN-конфигов для этого тарифа. Обратись в поддержку.`,
  orderSuccess: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>Покупка успешна!</b>\n\n` +
    `${e.bag} Продукт: ${data.productName}\n` +
    `${e.clipboard} Тариф: ${data.planName}\n` +
    `${e.gem} Сумма: <b>${data.amount}</b>\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance}</b>\n` +
    `${e.id} Заказ: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `${e.key} <b>Твой VPN-конфиг</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `Нажми на конфиг выше, чтобы скопировать, затем вставь в VPN-приложение.`,
  btnMyOrders2: `📦 Мои заказы`,
  btnBackToMenu: `🏠 Главное меню`,

  // Discount code during order flow
  enterDiscountCodeForOrder: `${e.ticket} <b>Добавить промокод</b>\n\nВведи промокод:\n\nПример: <code>SUMMER2024</code>`,
  btnSkipDiscount: `⚡ Продолжить без промокода`,
  btnRemoveDiscount: `🗑️ Убрать скидку`,
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `${e.checkBold} <b>Промокод применён!</b>\n\n` +
    `${e.ticket} Код: <code>${data.code}</code>\n` +
    `${e.gem} Скидка: -<b>${data.discountAmount}</b>\n` +
    `${e.wallet} Новая сумма: <b>${data.finalPrice}</b>`,
  orderSummaryWithDiscount: (data: {
    productName: string;
    planName: string;
    duration: string;
    originalPrice: string;
    discountAmount: string;
    finalPrice: string;
    code: string;
  }) =>
    `${e.clipboard} <b>Сводка заказа</b>\n\n` +
    `${e.bag} Продукт: ${data.productName}\n` +
    `${e.tag} Тариф: ${data.planName}\n` +
    (data.duration ? `${e.clock} Срок: ${data.duration}\n` : "") +
    `\n${e.wallet} Исходная цена: <b>${data.originalPrice}</b>\n` +
    `${e.ticket} Скидка (${data.code}): -<b>${data.discountAmount}</b>\n` +
    `${e.checkBold} Итоговая цена: <b>${data.finalPrice}</b>`,
  discountNotApplicableForProduct: `${e.cross} Этот промокод недействителен для данного продукта.`,
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `${e.cross} <b>Недостаточно средств</b>\n\nНужно (после скидки): <b>${data.required}</b>\nТвой баланс: <b>${data.current}</b>\n\nПожалуйста, пополни кошелёк.`,

  // Force Join Channels/Groups
  joinChannelRequired: `${e.flag_ru} <b>Требуется вступление</b>\n\nДля использования бота сначала вступи в следующие каналы/группы:`,
  btnIJoined: `✅ Вступил — проверить`,
  joinChannelNotJoinedAlert: ` Ты ещё не вступил во все необходимые каналы. Вступи и попробуй снова.`,

  // Manual / Scheduled Order Flow
  manualOrderInfoRequired: `${e.clipboard} <b>Необходимые данные</b>\n\nВведи следующие данные для обработки заказа:`,
  manualOrderStep: (data: { current: number; total: number }) =>
    `${e.pin} Шаг ${data.current} из ${data.total}`,
  manualOrderEmailPrompt: `${e.mail} Введи <b>email</b> аккаунта:`,
  manualOrderPasswordPrompt: `${e.lock} <b>رمز عبور</b> اکانت رو وارد کن:\n\n مطمئن شوید ایمیل رو رمز درست و معتبر باشند تا در فرایند سفارش مشکلی ایجاد نشود با تشکر.`,
  manualOrderLoginUsernamePrompt: `${e.person} Введи <b>имя пользователя</b> аккаунта:`,
  manualOrderLoginPasswordPrompt: `${e.lock} Введи <b>пароль</b> аккаунта:`,
  manualOrderRegionPrompt: `${e.earth} Введи желаемый <b>регион</b> (например: US, EU, Asia):`,
  manualOrderNeedsLabel: "Необходимые данные",
  adminOrderEmail: "📧 Email",
  adminOrderEmailPassword: "🔑 Пароль Email",
  adminOrderUsername: "👤 Имя пользователя",
  adminOrderLoginPassword: "🔐 Пароль",
  adminOrderRegion: "🌍 Регион",
  adminOrderPayment: "💳 Оплата",
  adminOrderScheduled: "📅 Запланировано",
  selectRegion: `${e.earth} <b>Выбор региона</b>\n\nВыбери нужный регион:`,
  selectedRegion: "Выбранный регион",
  orderInfoReviewTitle: `${e.clipboard} <b>Проверка данных заказа</b>`,
  orderInfoReviewPrompt: "Подтверди данные ниже или отредактируй их:",
  btnConfirmInfo: `Подтвердить и продолжить`,
  paymentSummaryTitle: `${e.wallet} <b>Оплата заказа</b>`,
  paymentPrompt: "Выбери способ оплаты для завершения заказа:",
  paymentOriginalPrice: "Исходная цена",
  paymentDiscount: "Скидка",
  paymentFinalPrice: "Итоговая цена",
  paymentWalletBalance: "Баланс кошелька",
  btnPayWallet: `Оплатить с кошелька`,
  btnPayCard: `💳 Оплатить картой`,
  btnPayZarinpal: `🟢 Шлюз ZarinPal`,
  btnPayCrypto: `🪙 Оплатить USDT (крипто)`,
  payCardInstructions: (data: { amount: string }) =>
    `💳 <b>Оплата картой</b>\n\n` +
    `💰 Сумма: <b>${data.amount}</b> Toман\n\n` +
    `Скопируй один из номеров карты ниже и переведи сумму:`,
  payCardConfirmNote: `После перевода нажми кнопку «✅ Я перевёл».`,
  btnConfirmCardPayment: `✅ Я перевёл`,
  payCardPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Заказ оформлен!</b>\n\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.hourglass} Заказ будет обработан после подтверждения перевода администратором.\n` +
    `Обычно подтверждается в течение <b>1–24 часов</b>.`,
  payCryptoConfirmNote: `После выполнения транзакции нажми кнопку «✅ Я оплатил».`,
  btnConfirmCryptoPayment: `✅ Я оплатил`,
  payCryptoPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Заказ оформлен!</b>\n\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.hourglass} Заказ будет обработан после подтверждения транзакции администратором.\n` +
    `Обычно подтверждается в течение <b>30 минут – 2 часов</b>.`,
  btnCancelManualOrder: `❌ Отменить заказ`,
  manualOrderCancelled: `${e.cross} Заказ отменён.`,
  manualOrderPending: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.checkBold} <b>Заказ оформлен!</b>\n\n` +
    `${e.bag} Продукт: ${data.productName}\n` +
    `${e.clipboard} Тариф: ${data.planName}\n` +
    `${e.gem} Сумма: <b>${data.amount}</b>\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance}</b>\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.hourglass} Заказ получен нашей командой.\n` +
    `Будет обработан и доставлен в течение <b>1-24 часов</b>.`,
  orderDeliveredNotification: (data: {
    orderId: number;
    productName: string;
  }) =>
    `${e.party} <b>Твой заказ готов!</b>\n\n` +
    `${e.bag} Продукт: ${data.productName}\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `Данные для доступа доступны в разделе Мои заказы затем Детали заказа.`,

  // Time Slot Selection
  schedulePickSlot: (data: { date: string }) =>
    `${e.calendar} <b>Выбери временной слот</b>\n\nВыбери доступный слот на <b>${data.date}</b>:\n\n${e.checkBold} = Свободно  |  ${e.cross} = Занято`,
  scheduleSlotFree: "Свободно",
  scheduleSlotFullAlert: `${e.cross} Этот слот занят. Выбери другой.`,
  scheduleNoSlotsToday:
    `${e.cross} <b>Слотов нет</b>\n\n` +
    `К сожалению, сегодня нет доступных временных слотов для этого продукта.\n` +
    `Попробуй завтра или обратись в поддержку.`,
  schedulePickDay: `${e.calendar} Пожалуйста, выбери день недели:`,
  schedulePickDayNoSlots: `${e.cross} Извини, нет активных дней с доступными слотами.`,
  scheduleBooked: (data: {
    orderId: number;
    productName: string;
    planName: string;
    timeSlot: string;
    date: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>Слот забронирован!</b>\n\n` +
    `${e.bag} Продукт: ${data.productName}\n` +
    `${e.clipboard} Тариф: ${data.planName}\n` +
    `${e.calendar} Дата: <b>${data.date}</b>\n` +
    `${e.clock} Время: <b>${data.timeSlot}</b>\n` +
    `${e.gem} Сумма: <b>${data.amount}</b>\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance}</b>\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.bell} Напомню тебе за <b>${e.clock} 15 минут</b> до начала.\n` +
    `Следи за статусом в разделе <b>Мои заказы</b>.`,
  scheduleReminderNotification: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.bell} <b>Напоминание о сессии!</b>\n\n` +
    `Сессия <b>${data.productName}</b> начнётся через <b>15 минут</b>.\n` +
    `${e.clock} Время: <b>${data.timeSlot}</b>\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.rocket} Готовься — наша команда скоро свяжется с тобой.`,
  sessionStartedUser: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.rocket} <b>Твоя сессия началась!</b>\n\n` +
    `${e.bag} Продукт: <b>${data.productName}</b>\n` +
    `${e.clock} Слот: <b>${data.timeSlot}</b>\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.key} Администратор пришлёт данные для входа в этот чат.\n` +
    `${e.sparkles} Готов? Начинаем!`,

  // ── Stock notification ──────────────────────────────────────────────────────
  stockSubscribed: `🔔 Уведомим, когда появится в наличии!`,
  stockAlreadySubscribed: `✅ Вы уже подписаны. Сообщим, когда появится.`,
  stockRestocked: (data: { productName: string }) =>
    `🎉 <b>Снова в наличии!</b>\n\n📦 <b>${data.productName}</b> доступен.\n\n🛍 Покупайте, пока не разобрали!`,

  // ── Inventory order flow ──────────────────────────────────────────────────
  enterQuantityPrompt: `📦 Введите желаемое количество:`,
  enterQuantityHint: `⚠️ Введите только число`,
  quantityInvalid: `${e.cross} Неверное количество. Пожалуйста, введите положительное целое число.`,
  quantityExceedsStock: (data: { stock: number }) =>
    `${e.cross} Недостаточно товара. Доступно: <b>${data.stock}</b> шт.`,
  quantityExceedsLimit: (data: { max: number }) =>
    `${e.cross} Максимально <b>${data.max}</b> шт. за один заказ.`,
  warrantyDays: (data: { days: number }) =>
    `Гарантия: <b>${data.days} дней</b>`,
  termsTitle: `Условия и правила`,
  btnChangeQuantity: `✏️ Изменить количество`,
  inventoryOrderSummary: (data: {
    productName: string;
    qty: number;
    unitPrice: string;
    total: string;
    currency: string;
  }) =>
    `${e.clipboard} <b>Итог заказа</b>\n\n` +
    `📦 Продукт: <b>${data.productName}</b>\n` +
    `🔢 Количество: <b>${data.qty}</b>\n` +
    `💰 Цена за единицу: <b>${data.unitPrice} ${data.currency}</b>\n` +
    `💵 Итого: <b>${data.total} ${data.currency}</b>`,
  inventoryOrderSuccess: (data: {
    orderId: number;
    productName: string;
    qty: number;
    total: string;
    remainingBalance: string;
    currency: string;
  }) =>
    `${e.party} <b>Заказ выполнен!</b>\n\n` +
    `📦 Продукт: <b>${data.productName}</b>\n` +
    `🔢 Количество: <b>${data.qty}</b>\n` +
    `💵 Оплачено: <b>${data.total} ${data.currency}</b>\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance} ${data.currency}</b>\n` +
    `${e.id} Заказ: #${data.orderId}`,
  inventoryDeliveryHeader: (data: { productName: string }) =>
    `${e.key} <b>Доставка: ${data.productName}</b>`,
  inventoryDeliveryItem: (data: { index: number; content: string }[]) =>
    `${e.fire} با تشکر از خرید شما دوست عزیز \n\n` +
    `${e.bag} سفارش شما آماده \n\n` +
    data.map((item) => `<b>#${item.index}</b>\n${item.content}`).join("\n\n") +
    `${e.truck} باز هم یه فروشگاه ما سر بزنید \n` +
    `${e.sparkles} مشتاقانه منتظر شما هستیم `,

  // Blocked user
  userBlocked:
    `⛔ <b>Ваш доступ ограничен</b>\n\n` +
    `Ваш аккаунт заблокирован администрацией. Если вы считаете, что это ошибка, свяжитесь с поддержкой.`,
  userBlockedWithReason: (reason: string) =>
    `⛔ <b>Ваш доступ ограничен</b>\n\n` +
    `📝 Причина: ${reason}\n\n` +
    `Если вы считаете, что это ошибка, свяжитесь с поддержкой.`,

  // Maintenance mode
  botMaintenance:
    `🔧 <b>Бот временно недоступен</b>\n\n` +
    `Проводится техобслуживание или обновление. Скоро вернёмся. Спасибо за ожидание ༉`,
  botMaintenanceCustom: (msg: string) => `🔧 ${msg}`,

  // Feature disabled messages
  referralDisabled: `🔒 <b>Реферальная система недоступна</b>\n\nРеферальная программа временно отключена.`,
  shopDisabled: `🔒 <b>Магазин недоступен</b>\n\nМагазин временно отключён. Попробуйте позже.`,
  adminConfirmRechargeMsg: (
    userLabel: string,
    opts: any,
    formatNum: (num: number) => string,
    methodLabel: string,
  ) =>
    `💵 <b>Wallet Recharge Request</b>\n\n` +
    `👤 User: ${userLabel} (<code>${opts.userId}</code>)\n` +
    `💰 Amount: <b>${formatNum(opts.amount)}</b> Toman\n` +
    `🔑 Method: ${methodLabel}\n`,
  regionNotFound: "Регион не найден ❌",

  rechargeCardSaveFailed: "Ошибка при сохранении файла",
} satisfies ShouldFollowLanguageStrict<typeof fa>;
