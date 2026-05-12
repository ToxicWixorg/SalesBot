import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { e } from "./emojies";
import type { fa } from "./fa";
import { en } from "./en";

export const ru = {
  ...en,

  // Language Selection
  selectLanguage: `${e.earth} <b>Выберите предпочитаемый язык:</b>`,
  languageSelected: (lang: string) =>
    `${e.checkBold} Язык изменён на <b>${lang}</b>`,

  btnAdminPanel: "َAdmin panel",

  adminpanelText: (userid: number, userRole: string) =>
    `${e.id} Your userid : <code>${userid}</code>\n` +
    `${e.user} Your Role : <b>${userRole === "super_admin" ? "Owner" : userRole === "admin" ? "Admin" : "Support"}</b>\n\n` +
    `${e.admin} Use bottons below:`,
  adminpanelBtnUrl: "Enter admin panel",
  adminpanelBtnEmojies: "Premium emoji id",

  // Greeting & Welcome
  greeting: (name: string) => `Привет, <b>${name}</b>! ${e.sparkles}`,
  welcome: (name: string) =>
    `${e.crown} Привет, <b>${name}</b>, добро пожаловать!\n\n` +
    `${e.diamond} Здесь вы найдёте лучшие цифровые сервисы по лучшим ценам.\n`,

  // Main Menu
  mainMenu: `${e.home} Главное меню`,
  main_menu: (name: string) =>
    `${e.crown} Привет, <b>${name}</b>!\n\n` +
    `${e.sparkles} Добро пожаловать в наш цифровой магазин!\n\n` +
    `${e.diamond} Премиум-подписки, AI-аккаунты и цифровые сервисы — всё по лучшим ценам.\n\n` +
    `Выберите действие:`,

  // Buttons
  btnProducts: `Товары`,
  btnMyOrders: `Мои заказы`,
  btnWallet: `Кошелёк`,
  btnInviteFriends: ` Пригласить друзей`,
  btnDiscountCode: ` Промокод`,
  btnSupport: ` Поддержка`,
  btnSettings: ` Настройки`,
  btnBack: ` Назад`,
  btnCancel: ` Отмена`,
  btnMainMenu: ` Главное меню`,
  btnChangeLanguage: ` Сменить язык`,
  btnNotifications: ` Уведомления`,
  btnYes: ` Да`,
  btnNo: ` Нет`,
  btnConfirm: ` Подтвердить`,

  // Products
  btnBuyProduct: ` Купить`,
  btnNotifyStock: ` Сообщить о наличии`,
  btnConfirmOrder: ` Подтвердить заказ`,
  btnAddDiscountCode: ` Добавить промокод`,
  productsTitle: `${e.bag} Товары`,
  selectCategory: `${e.tag} Выберите категорию:`,
  categoryProducts: (category: string, emoji: string) =>
    emoji === ""
      ? e.bag
      : `<tg-emoji emoji-id="${emoji}">🛍️</tg-emoji> ` +
        `Товары в категории <b>${category}</b>:`,
  noProducts: `${e.reject} В этой категории нет товаров.`,
  productDetails: `${e.bag} Детали товара`,
  price: `${e.wallet} Цена:`,
  stock: `${e.bag} Наличие:`,
  available: `${e.checkBold} В наличии`,
  outOfStock: `${e.reject} Нет в наличии`,
  productNotFound: `${e.reject} Товар не найден`,
  planNotFound: `${e.reject} Тариф не найден`,
  categoryNotFound: `${e.reject} Категория не найдена`,
  noPlansAvailable: `${e.reject} Нет доступных тарифов`,
  insufficientBalanceAlert: `${e.reject} Недостаточно средств`,
  deliveryTime: `${e.clock} Время доставки:`,
  deliveryType: `${e.truck} Тип доставки:`,
  deliveryAutomatic: `${e.zap} Мгновенно (авто)`,
  deliveryManual: `${e.user} Вручную (1–24 часа)`,
  deliveryCoordination: `${e.date} Требуется согласование`,
  selectPlan: `${e.clipboard} Выберите тариф:`,
  orderSummary: `${e.clipboard} Сводка заказа:`,
  total: `${e.wallet} Итого:`,
  currency: "Томан",
  oneTime: "Разово",
  duration_day: "День",
  duration_month: "Месяц",
  duration_year: "Год",

  // Wallet
  walletTitle: `${e.wallet} Кошелёк`,
  walletBalance: (balance: string) =>
    `Баланс: <b>${balance}</b> Toman ` + e.Toman,
  walletEmpty: `${e.wallet} Ваш кошелёк пуст ${e.sparkles} Пополните его и начните!`,
  btnRechargeWallet: ` Пополнить кошелёк`,
  btnTransactionHistory: ` История транзакций`,

  // Recharge
  rechargeWalletTitle: `${e.card} Пополнение кошелька`,
  rechargeSelectMethod: `Выберите способ пополнения:`,
  btnRechargeCrypto: ` Крипто-оплата (USDT)`,
  btnRechargeCard: ` Оплата картой`,
  btnRechargeZarinpal: ` Шлюз Zarinpal`,
  rechargeEnterAmount: `${e.wallet} Введите сумму пополнения:`,
  rechargeMinAmount: (amount: string) =>
    `Минимальная сумма пополнения: <b>${amount}</b> Toman ` + e.Toman,
  rechargeMaxAmount: (amount: string) =>
    `Максимальная сумма пополнения: <b>${amount}</b> Toman ` + e.Toman,
  rechargeInvalidAmount: `${e.reject} Неверная сумма`,
  rechargeTooLow: (min: string) =>
    `${e.reject} Сумма должна быть не менее <b>${min}</b> Toman ${e.Toman}`,
  rechargeTooHigh: (max: string) =>
    `${e.reject} Сумма не может превышать <b>${max}</b> Toman ${e.Toman}`,

  rechargeCryptoTitle: `${e.wallet} Крипто-оплата`,
  rechargeCryptoAddress: (address: string) =>
    `Адрес кошелька:\n\n<code>${address}</code>`,
  rechargeCryptoAmount: (amount: string) => `Сумма USDT: <b>${amount}</b>`,
  rechargeCryptoNetwork: (network: string) => `Сеть: <b>${network}</b>`,
  rechargeCryptoInstructions:
    `${e.clipboard} <b>Инструкция по оплате:</b>\n\n` +
    `1. Отправьте USDT на адрес выше\n` +
    `2. Отправьте TxID (хэш транзакции)\n` +
    `3. Дождитесь подтверждения (до 30 минут)`,
  rechargeCryptoSendTxId: `Отправьте TxID (хэш транзакции):`,
  rechargeCryptoTxIdReceived: `${e.checkBold} TxID получен\n\n${e.time} Проверяем оплату...\nЭто может занять до 30 минут.`,
  rechargeCryptoVerified: (amount: string) =>
    `${e.party} <b>Оплата подтверждена!</b>\n\n${e.diamond} <b>${amount}</b> томан добавлено в ваш кошелёк.`,
  rechargeCryptoFailed: `${e.reject} Не удалось подтвердить оплату. Обратитесь в поддержку.`,

  rechargeCardTitle: `${e.card} Оплата картой`,
  rechargeZarinpalTitle: `${e.wallet} Шлюз Zarinpal`,
  btnPayNow: `💳 Оплатить`,
  rechargePaymentPending: `${e.time} Ожидание оплаты...\n\nПожалуйста, завершите оплату в браузере.`,
  rechargePaymentSuccess: (amount: string) =>
    `${e.party} <b>Оплата успешна!</b>\n\n${e.diamond} <b>${amount}</b> томан добавлено в ваш кошелёк.`,
  rechargePaymentFailed: `${e.reject} Ошибка оплаты. Попробуйте снова.`,
  rechargePaymentCancelled: `${e.warning} Оплата отменена.`,

  // Transactions
  transactionHistoryTitle: `${e.chart} История транзакций`,
  transactionHistoryEmpty: `У вас пока нет транзакций — сделайте первый заказ!`,
  transactionType: "Тип:",
  transactionAmount: "Сумма:",
  transactionDate: "Дата:",
  transactionDescription: "Описание:",
  txTypeCredit: " Пополнение",
  txTypeDebit: " Списание",
  txSourcePurchase: `${e.bag} Покупка`,
  txSourceRecharge: `${e.card} Пополнение`,
  txSourceRefund: `${e.wallet} Возврат`,
  txSourceReferral: `${e.gift} Реферальный бонус`,
  txSourceReward: `${e.gift} Награда`,
  txSourceAdminAdjustment: `${e.settings} Корректировка админом`,

  // Settings
  settingsTitle: `${e.settings} Настройки`,
  settingsDescription: `${e.info} Управляйте вашим аккаунтом здесь.`,
  btnAccountInfo: `👤 Информация об аккаунте`,
  btnNotificationSettings: `Настройки уведомлений`,
  btnPrivacy: ` Конфиденциальность`,
  btnAbout: `ℹ О нас`,

  // Orders
  ordersTitle: `${e.bag} Мои заказы`,
  ordersEmpty: `${e.bag} У вас ещё нет заказов!\n\nПерейдите в товары и оформите первую покупку.`,
  ordersTotal: `${e.chart} Всего заказов`,
  ordersActive: `${e.active} Активные заказы`,
  ordersCompleted: `${e.complete} Завершённые заказы`,
  ordersSelectFilter: `Выберите фильтр:`,
  btnOrdersFilterActive: `Активные`,
  btnOrdersFilterCompleted: `Завершённые`,
  btnOrdersFilterAll: `Все`,
  orderDetailsTitle: `${e.clipboard} Детали заказа`,
  orderNumber: `${e.id} Номер заказа`,
  orderStatus: "Статус",
  orderNotFound: "Заказ не найден",

  // Support
  supportMenuText:
    `${e.chat} <b>Центр поддержки</b>\n\nЧем могу помочь?\n\n` +
    `• Создать тикет\n` +
    `• Сообщить о проблеме\n` +
    `• Просмотреть тикеты`,
  btnNewSupportTicket: `Новый тикет`,
  btnNewReportTicket: `Сообщить о проблеме`,
  btnMyTickets: `Мои тикеты`,
  btnViewMyTickets: `Просмотреть тикеты`,
  btnReplyToTicket: `Ответить`,
  ticketListTitle: `${e.clipboard} <b>Ваши тикеты</b>`,
  ticketNotFound: `${e.reject} Тикет не найден`,

  // Purchase flow
  btnMyOrders2: `Мои заказы`,
  btnBackToMenu: `Главное меню`,
  btnSkipDiscount: `Продолжить без промокода`,
  btnRemoveDiscount: `Удалить скидку`,
  btnIJoined: `Я вступил — Проверить`,
  btnConfirmInfo: `✅ Подтвердить и продолжить`,
  btnPayWallet: `Оплатить с кошелька`,
  btnPayCard: `💳 Оплата картой`,
  btnPayZarinpal: `🟢 Шлюз Zarinpal`,
  btnPayCrypto: `🪙 Оплата USDT (крипто)`,
  btnConfirmCardPayment: `✅ Я оплатил`,
  btnConfirmCryptoPayment: `✅ Я оплатил`,
  btnCancelManualOrder: `Отменить заказ`,

  // Remaining full Russian overrides
  chooseAction: "",
  txSourcePerk: `${e.target} Бонус Perk`,

  rechargeAmount: (amount: string) =>
    `💰 Сумма: <b>${amount}</b> Toman ` + e.Toman,
  rechargeMethodSelectTitle: (amount: string) =>
    `${e.wallet} Сумма <b>${amount}</b> Toman ${e.Toman}\n\nВыберите способ оплаты:`,
  rechargeCardNumbers: `Номера карт`,
  rechargeCardSendReceipt: `После перевода отправьте сюда фото чека оплаты.`,
  rechargeCardExpectPhoto: `${e.reject} Пожалуйста, отправьте фото чека (изображение, не текст).`,
  rechargePendingApproval: `${e.checkBold} Ваш запрос принят!\n\n${e.time} Дождитесь подтверждения админа — обычно до 30 минут.`,
  rechargeApproved: (amount: string) =>
    `${e.party} <b>Пополнение подтверждено!</b>\n\n${e.diamond} <b>${amount}</b> томан добавлено в ваш кошелёк.`,
  rechargeRejected: `${e.reject} <b>Запрос на пополнение отклонён.</b>\n\nПри необходимости обратитесь в поддержку.`,
  rechargeSessionExpired: `${e.warning} Сессия истекла. Начните снова из раздела кошелька.`,
  rechargeMethodDisabled: `${e.reject} Этот способ оплаты сейчас недоступен.`,
  rechargeNoMethodAvailable: `${e.reject} Сейчас нет активных способов оплаты. Попробуйте позже.`,
  rechargeUsdtRate: (rate: string) =>
    `📈 Актуальный курс: <b>${rate}</b> томан/USDT`,
  rechargeRateUnavailable: `${e.reject} Актуальный курс USDT недоступен. Подождите и попробуйте снова.`,
  rechargeCryptoInvalidTxId: `${e.reject} Неверный TxID (минимум 10 символов). Отправьте ещё раз.`,
  rechargePaymentLink: (amount: string) =>
    `Сумма: <b>${amount}</b> томан\n\nНажмите кнопку ниже, чтобы перейти к оплате:`,
  rechargeZarinpalInstructions: `${e.clipboard} Нажмите «Оплатить», завершите оплату, затем нажмите «Проверить оплату».`,
  btnVerifyPayment: `Проверить оплату`,
  rechargeZarinpalVerifying: `${e.time} Проверяем оплату...`,
  rechargeZarinpalSuccess: (amount: string) =>
    `${e.party} <b>Оплата подтверждена!</b>\n\n${e.diamond} <b>${amount}</b> томан добавлено в ваш кошелёк.`,
  rechargeZarinpalFailed: `${e.reject} Оплата не подтверждена или ещё не зарегистрирована.`,
  rechargeZarinpalRetry: `Попробуйте оплатить снова или выполнить повторную проверку.`,
  rechargeCardSaveFailed: e.warning + "Ошибка сохранения файла",

  inviteBanner: (data: {
    totalReferrals: number;
    totalRewards: string;
    referralLink: string;
  }) =>
    `${e.crown} <b>Приглашайте друзей и зарабатывайте!</b>\n\n` +
    `${e.user} Успешных приглашений: <b>${data.totalReferrals}</b>\n` +
    `${e.diamond} Всего бонусов: <b>${data.totalRewards}</b> томан\n\n` +
    `🔗 <b>Ваша персональная ссылка:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `${e.sparkles} <b>Как это работает:</b>\n` +
    `1. Отправьте ссылку друзьям\n` +
    `2. Когда они присоединятся — вы получите бонус\n` +
    `3. Бонус автоматически зачисляется в кошелёк\n\n` +
    `${e.diamond} Награда за приглашение: <b>10,000</b> томан`,
  btnShareInviteLink: ` Поделиться ссылкой`,
  btnCopyLink: ` Копировать ссылку`,
  btnViewReferrals: ` Список приглашённых`,
  inviteShareText: `${e.gift} Присоединяйся по этой ссылке и получи специальную скидку!`,
  inviteLinkCopied: (link: string) =>
    `${e.checkBold} Ссылка скопирована!\n\n<code>${link}</code>\n\nОтправьте её друзьям.`,
  noReferralsYet: `${e.user} У вас пока нет приглашённых — начните сейчас и зарабатывайте!`,
  referralListTitle: `${e.user} <b>Список приглашённых</b>`,
  andMore: (count: number) => `и ещё <b>${count}</b>...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `${e.party} Новый пользователь (<b>${data.userName}</b>) зарегистрировался по вашей ссылке!\n` +
    `${e.diamond} <b>${data.amount}</b> томан добавлено в ваш баланс.`,

  discountCodeInfo:
    `${e.gift} <b>Промокод</b>\n\n` +
    `Используйте промокоды, чтобы снизить стоимость покупки.\n\n` +
    `Можно применить код при оформлении заказа или проверить его здесь.`,
  btnEnterDiscountCode: ` Ввести промокод`,
  btnDiscountHistory: ` История использования`,
  enterDiscountCodePrompt: `${e.pencil} Введите промокод:\n\nПример: <code>SUMMER2024</code>`,
  btnTryAgain: ` Повторить`,
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `${e.checkBold} <b>Промокод действителен!</b>\n\n` +
    `${e.ticket} Код: <code>${data.code}</code>\n` +
    `${e.tag} Тип: ${data.type}\n` +
    `${e.diamond} Значение: ${data.value}\n` +
    `${e.clipboard} Описание: ${data.description}\n\n` +
    `Используйте этот код при покупке.`,
  discountCodeInvalid: (reason: string) =>
    `${e.reject} <b>Недействительный промокод</b>\n\n${reason}`,
  discountTypePercentage: "Процент",
  discountTypeFixed: "Фиксированная сумма",
  noDescription: "Без описания",
  noDiscountHistory: `${e.chart} Вы ещё не использовали промокоды.`,
  discountHistoryTitle: `${e.chart} <b>История промокодов</b>`,
  discountAmount: "Размер скидки",
  orderId: "Номер заказа",
  enterDiscountCodeForOrder: `${e.ticket} <b>Добавить промокод</b>\n\nВведите промокод:\n\nПример: <code>SUMMER2024</code>`,
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `${e.checkBold} <b>Промокод применён!</b>\n\n` +
    `${e.ticket} Код: <code>${data.code}</code>\n` +
    `${e.diamond} Скидка: -<b>${data.discountAmount}</b> томан\n` +
    `${e.wallet} Новая сумма: <b>${data.finalPrice}</b> томан`,
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
    `${e.bag} Товар: ${data.productName}\n` +
    `${e.tag} Тариф: ${data.planName}\n` +
    (data.duration ? `${e.clock} Срок: ${data.duration}\n` : "") +
    `\n${e.wallet} Исходная цена: <b>${data.originalPrice}</b> томан\n` +
    `${e.ticket} Скидка (${data.code}): -<b>${data.discountAmount}</b> томан\n` +
    `${e.checkBold} Итоговая цена: <b>${data.finalPrice}</b> томан`,
  discountNotApplicableForProduct: `${e.reject} Этот промокод не подходит для данного товара.`,
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `${e.reject} <b>Недостаточно средств</b>\n\nТребуется (после скидки): <b>${data.required}</b> томан\nВаш баланс: <b>${data.current}</b> томан\n\nПополните кошелёк.`,

  userNotFound: `❌ Пользователь не найден`,
  userIdentificationError: `${e.reject} Ошибка идентификации пользователя`,
  accountInfoTitle: `${e.user} Информация об аккаунте`,
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `${e.crown} <b>Информация о вашем аккаунте</b>\n\n` +
    `${e.id} ID: <code>${data.userId}</code>\n` +
    `${e.user} Username: ${data.username ? `@${data.username}` : "Не указан"}\n` +
    `${e.tag} Имя: ${data.firstName}\n` +
    `${e.date} Дата регистрации: ${data.joinDate}\n\n` +
    `${e.chart} <b>Статистика:</b>\n` +
    `${e.bag} Заказы: <b>${data.totalOrders}</b>\n` +
    `${e.diamond} Потрачено: <b>${data.totalSpent}</b> томан\n` +
    `${e.user} Приглашения: <b>${data.totalReferrals}</b>`,
  notificationSettingsTitle: `${e.bell} Настройки уведомлений`,
  notificationSettingsDescription: `${e.info} Выберите, какие уведомления получать:`,
  btnToggleOrderNotifications: (enabled: boolean) => `Уведомления о заказах`,
  btnToggleWalletNotifications: (enabled: boolean) => ` Уведомления кошелька`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `Уведомления об акциях`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `Уведомления о рефералах`,
  btnToggleStockNotifications: (enabled: boolean) => ` Уведомления о наличии`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? `${e.checkBold} Включено` : `${e.reject} Выключено`}: ${type}`,
  allNotificationsEnabled: `${e.checkBold} Все уведомления включены`,
  allNotificationsDisabled: `${e.reject} Все уведомления выключены`,

  privacyTitle: `${e.lock} Конфиденциальность`,
  privacyDescription: `${e.shield} Управление персональными данными:`,
  btnClearHistory: ` Очистить историю`,
  btnDeleteAccount: `Удалить аккаунт`,
  btnExportData: ` Экспортировать мои данные`,
  clearHistoryConfirm:
    `${e.warning} <b>Вы уверены?</b>\n\n` +
    `История будет удалена — это действие нельзя отменить.`,
  clearHistorySuccess: `${e.checkBold} История успешно очищена.`,
  clearHistoryCancelled: `${e.reject} Действие отменено.`,
  deleteAccountConfirm:
    `${e.warning} <b>Внимание!</b>\n\n` +
    `Вы действительно хотите удалить аккаунт?\n\n` +
    `${e.reject} Будут удалены навсегда:\n` +
    `• Заказы\n• Кошелёк\n• Приглашения\n\n` +
    `Это действие <b>необратимо</b>!`,
  deleteAccountSuccess: `${e.checkBold} Ваш аккаунт удалён.\n\nБудем рады видеть вас снова!`,
  deleteAccountCancelled: `${e.checkBold} Аккаунт не удалён.`,
  exportDataProcessing: `Подготавливаем ваши данные...`,
  exportDataReady: `${e.checkBold} Ваши данные готовы!`,

  aboutTitle: `${e.info} О нас`,
  aboutDescription:
    `${e.robot} <b>Бот продажи цифровых сервисов</b>\n\n` +
    `${e.diamond} Лучшие сервисы, лучшие цены и быстрая доставка.\n\n` +
    `${e.mail} <b>Связь с нами:</b>\n` +
    `• Поддержка: @r4m_m\n` +
    `${e.tag} Версия: 2.3.5`,

  ordersActiveTitle: `${e.active} Активные заказы`,
  ordersCompletedTitle: `${e.complete} Завершённые заказы`,
  ordersAllTitle: `${e.clipboard} Все заказы`,
  ordersSelectOne: `${e.pin} Нажмите на заказ, чтобы посмотреть детали:`,
  ordersNoActive: `${e.info} У вас нет активных заказов`,
  ordersNoCompleted: `${e.info} У вас нет завершённых заказов`,
  created: "Дата создания",
  order: "Заказ",
  status: "Статус",
  messages: "Сообщения",
  lastMessage: "Последнее сообщение",
  orderProduct: e.bag + " Товар",
  orderTotalPrice: e.wallet + " Исходная цена",
  orderDiscount: e.gift + " Скидка",
  orderWalletUsed: e.card + " Кошелёк",
  orderFinalPrice: e.confirm + " Итоговая цена",
  orderCreatedAt: e.date + " Дата создания",
  orderDeliveredAt: e.date + " Дата доставки",
  orderScheduledTime: e.time + " Время",
  orderNotes: e.note + " Примечание",
  orderDeliveryInfo: "Данные доставки",
  orderDeliveryCode: "Код",
  orderDeliveryEmail: "Email",
  orderDeliveryLink: "Ссылка",
  orderDeliveryInstructions: "Инструкция",
  btnOrderOpenTicket: `Открыть тикет`,
  btnOrderRenew: `Продлить`,
  btnOrderReschedule: `Перенести`,
  btnOrderReportProblem: `Сообщить о проблеме`,
  btnBackToOrders: `Назад к заказам`,
  orderAccessDenied: "У вас нет доступа к этому заказу",
  orderTicketComingSoon: "Система тикетов скоро будет доступна",
  orderNotRenewable: "Этот товар нельзя продлить",
  orderRenewComingSoon: "Продление скоро станет доступно",
  orderCannotReschedule: "Этот заказ нельзя перенести",
  orderRescheduleComingSoon: "Перенос времени скоро будет доступен",
  orderReportComingSoon: "Система отчётов о проблемах скоро будет доступна",
  errorFetchingOrders: `${e.reject} Ошибка загрузки заказов`,
  errorFetchingOrderDetails: `${e.reject} Ошибка загрузки деталей заказа`,
  errorReschedulingOrder: `${e.reject} Ошибка переноса заказа`,
  errorRenewingOrder: `${e.reject} Ошибка продления заказа`,
  renewScreenTitle: "🔄 Продление сервиса",
  renewWalletSuccess: (data: {
    orderId: number;
    productName: string;
    remainingBalance: string;
  }) =>
    `✅ <b>Продление выполнено успешно!</b>\n\n` +
    `📦 ${data.productName}\n` +
    `🎫 Номер заказа: #${data.orderId}\n\n` +
    `👛 Остаток: ${data.remainingBalance} томан`,
  errorOpeningTicket: `${e.reject} Ошибка открытия тикета`,
  errorReportingProblem: `${e.reject} Ошибка отправки отчёта о проблеме`,
  btnBackToMain: `Главное меню`,
  btnViewMessages: `Просмотреть сообщения`,
  btnBackToTickets: `Назад к тикетам`,
  btnViewTicket: `Открыть тикет`,
  btnViewOrder: `Открыть заказ`,
  ticketSupportPrompt:
    `${e.chat} <b>Новый тикет поддержки</b>\n\n` +
    `Подробно опишите вопрос или проблему.\n` +
    `Наша команда ответит как можно скорее.`,
  ticketOrderPrompt:
    `${e.chat} <b>Проблема с заказом</b>\n\n` +
    `Подробно опишите проблему, связанную с заказом.`,
  ticketReportPrompt:
    `${e.warning} <b>Сообщение о проблеме</b>\n\n` +
    `Подробно опишите, с какой проблемой вы столкнулись.`,
  ticketMessageTooShort: `${e.reject} Пожалуйста, добавьте больше деталей (минимум 10 символов)`,
  ticketMessageEmpty: `${e.reject} Сообщение не может быть пустым`,
  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    `${e.checkBold} <b>Тикет создан!</b>\n\nНомер тикета: <b>${data.ticketNumber}</b>\n\nКоманда поддержки уже уведомлена и скоро ответит.`,
  ticketCreateError: `${e.reject} Не удалось создать тикет. Попробуйте снова или свяжитесь с поддержкой.`,
  ticketOrderNotFound: `${e.reject} Заказ не найден`,
  ticketListEmpty: `${e.chat} У вас ещё нет тикетов — нужна помощь? Создайте тикет!`,
  ticketListShowingFirst10: "Показаны первые 10 тикетов",
  ticketListError: `${e.reject} Не удалось загрузить тикеты. Попробуйте снова.`,
  ticketNotYours: `${e.reject} Этот тикет вам не принадлежит`,
  ticketAlreadyClosed: `${e.lock} Этот тикет закрыт`,
  ticketLoadError: `${e.reject} Ошибка загрузки тикета. Попробуйте снова.`,
  ticketStatus_open: `${e.active} Открыт`,
  ticketStatus_waiting_user: `${e.pending} Ожидает вашего ответа`,
  ticketStatus_waiting_support: `${e.admin} Ожидает поддержки`,
  ticketStatus_in_progress: `${e.pending} В обработке`,
  ticketStatus_resolved: `${e.checkBold} Решён`,
  ticketStatus_closed: `${e.lock} Закрыт`,
  ticketStatus_blocked: `${e.failed} Заблокирован`,
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    `${e.chat} <b>Ответ на ${data.ticketNumber}</b>\n\nВведите сообщение:`,
  ticketReplySent: `${e.checkBold} Ваше сообщение отправлено!\n\nЯ сообщу вам, когда придёт ответ.`,
  ticketReplyError: `${e.reject} Ошибка отправки сообщения. Попробуйте снова.`,
  ticketCreationCancelled: `${e.reject} Создание тикета отменено`,
  ticketMessages: "Сообщения",
  ticketNoMessages: "В этом тикете пока нет сообщений",
  ticketMessagesError: `${e.reject} Ошибка загрузки сообщений`,
  ticketShowingLast5Messages: "Показаны последние 5 сообщений",
  you: "Вы",
  support: "Поддержка",

  insufficientBalance: (data: { required: string; current: string }) =>
    `😥 Недостаточно средств\n\nТребуется: ${data.required} томан\nВаш баланс: ${data.current} томан\n\nПополните кошелёк и попробуйте снова.`,
  noConfigAvailable: `${e.reject} Для этого тарифа сейчас нет доступной VPN-конфигурации. Обратитесь в поддержку.`,
  orderSuccess: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>Покупка успешно оформлена!</b>\n\n` +
    `${e.bag} Товар: ${data.productName}\n` +
    `${e.clipboard} Тариф: ${data.planName}\n` +
    `${e.diamond} Сумма: <b>${data.amount}</b> томан\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance}</b> томан\n` +
    `${e.id} Заказ: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `${e.key} <b>Ваш VPN-конфиг</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `Нажмите на конфиг выше, чтобы скопировать, затем импортируйте в VPN-приложение.`,

  joinChannelRequired: `${e.flag_ir} <b>Обязательная подписка</b>\n\nДля использования бота сначала вступите в следующие каналы/группы:`,
  joinChannelNotJoinedAlert: ` Вы ещё не вступили во все обязательные каналы. Вступите и попробуйте снова.`,

  manualOrderInfoRequired: `${e.clipboard} <b>Необходимая информация</b>\n\nДля обработки заказа укажите данные ниже:`,
  manualOrderStep: (data: { current: number; total: number }) =>
    `${e.pin} Шаг ${data.current} из ${data.total}`,
  manualOrderEmailPrompt: `${e.mail} <b>Введите email аккаунта:</b>`,
  manualOrderPasswordPrompt: `${e.lock} <b>Введите пароль аккаунта:</b>\n\nУбедитесь, что email и пароль указаны верно, чтобы избежать проблем при обработке заказа.`,
  manualOrderLoginUsernamePrompt: `${e.user} <b>Введите логин аккаунта:</b>`,
  manualOrderLoginPasswordPrompt: `${e.lock} <b>Введите пароль аккаунта:</b>`,
  manualOrderRegionPrompt: `${e.earth} <b>Введите нужный регион</b> (например: US, EU, Asia):`,
  manualOrderNeedsLabel: "Необходимая информация",
  adminOrderEmail: "📧 Email",
  adminOrderEmailPassword: "🔑 Пароль от email",
  adminOrderUsername: "👤 Логин",
  adminOrderLoginPassword: "🔐 Пароль",
  adminOrderRegion: "🌍 Регион",
  adminOrderPayment: "💳 Оплата",
  adminOrderScheduled: "📅 Расписание",
  selectRegion: `${e.earth} <b>Выбор региона</b>\n\nВыберите нужный регион:`,
  selectedRegion: "Выбранный регион",
  orderInfoReviewTitle: `${e.clipboard} <b>Проверка данных заказа</b>`,
  orderInfoReviewPrompt: "Подтвердите или измените данные ниже:",
  paymentSummaryTitle: `${e.wallet} <b>Оплата заказа</b>`,
  paymentPrompt: "Выберите способ оплаты для завершения покупки:",
  paymentOriginalPrice: "Исходная цена",
  paymentDiscount: "Скидка",
  paymentFinalPrice: "Итоговая цена",
  paymentWalletBalance: "Баланс кошелька",
  payCardInstructions: (data: { amount: string }) =>
    `💳 <b>Оплата банковской картой</b>\n\n` +
    `💰 Сумма: <b>${data.amount}</b> томан\n\n` +
    `Скопируйте номер карты ниже и переведите сумму:`,
  payCardConfirmNote: `После перевода нажмите «✅ Я оплатил».`,
  payCardPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Заказ оформлен!</b>\n\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.time} Заказ будет обработан после подтверждения оплаты админом.\n` +
    `Обычно подтверждение занимает <b>1–24 часа</b>.`,
  payCryptoConfirmNote: `После транзакции нажмите «✅ Я оплатил».`,
  payCryptoPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Заказ оформлен!</b>\n\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.time} Заказ будет обработан после подтверждения транзакции админом.\n` +
    `Обычно подтверждение занимает <b>30 минут – 2 часа</b>.`,
  manualOrderCancelled: `${e.reject} Заказ отменён.`,
  manualOrderPending: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.checkBold} <b>Заказ оформлен!</b>\n\n` +
    `${e.bag} Товар: ${data.productName}\n` +
    `${e.clipboard} Тариф: ${data.planName}\n` +
    `${e.diamond} Сумма: <b>${data.amount}</b> томан\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance}</b> томан\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.time} Ваш заказ передан нашей команде.\n` +
    `Мы обработаем его в течение <b>1–24 часов</b>.`,
  orderDeliveredNotification: (data: {
    orderId: number;
    productName: string;
  }) =>
    `${e.party} <b>Ваш заказ готов!</b>\n\n` +
    `${e.bag} Товар: ${data.productName}\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `Данные доступа доступны в разделе «Мои заказы» → «Детали заказа».`,

  schedulePickSlot: (data: { date: string }) =>
    `${e.date} <b>Выбор времени</b>\n\nВыберите свободный слот на <b>${data.date}</b>:\n\n${e.checkBold} = свободно  |  ${e.reject} = занято`,
  scheduleSlotFree: "Свободно",
  scheduleSlotFullAlert: `${e.reject} Этот слот уже занят. Выберите другой.`,
  scheduleNoSlotsToday:
    `${e.reject} <b>Нет доступных слотов</b>\n\n` +
    `К сожалению, сегодня для этого товара нет свободного времени.\n` +
    `Попробуйте завтра или обратитесь в поддержку.`,
  schedulePickDay: `${e.date} Пожалуйста, выберите нужный день недели:`,
  schedulePickDayNoSlots: `${e.reject} К сожалению, нет дней с активными слотами.`,
  scheduleBooked: (data: {
    orderId: number;
    productName: string;
    planName: string;
    timeSlot: string;
    date: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>Слот успешно забронирован!</b>\n\n` +
    `${e.bag} Товар: ${data.productName}\n` +
    `${e.clipboard} Тариф: ${data.planName}\n` +
    `${e.date} Дата: <b>${data.date}</b>\n` +
    `${e.clock} Время: <b>${data.timeSlot}</b>\n` +
    `${e.diamond} Сумма: <b>${data.amount}</b> томан\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance}</b> томан\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.bell} <b>${e.clock} За 15 минут</b> до начала я отправлю напоминание.\n` +
    `Статус сессии можно отслеживать в <b>Мои заказы</b>.`,
  scheduleReminderNotification: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.bell} <b>Напоминание о сессии!</b>\n\n` +
    `Ваша сессия <b>${data.productName}</b> начнётся через <b>15 минут</b>.\n` +
    `${e.clock} Время: <b>${data.timeSlot}</b>\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.rocket} Будьте готовы — наша команда скоро свяжется с вами.`,
  sessionStartedUser: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.rocket} <b>Ваша сессия началась!</b>\n\n` +
    `${e.bag} Товар: <b>${data.productName}</b>\n` +
    `${e.clock} Слот: <b>${data.timeSlot}</b>\n` +
    `${e.id} Заказ: #${data.orderId}\n\n` +
    `${e.key} Админ отправит данные для входа в этом чате.\n` +
    `${e.sparkles} Готовы? Поехали!`,

  userBlocked:
    `⛔ <b>Ваш доступ ограничен</b>\n\n` +
    `Ваш аккаунт заблокирован администрацией. Если это ошибка, свяжитесь с поддержкой.`,
  userBlockedWithReason: (reason: string) =>
    `⛔ <b>Ваш доступ ограничен</b>\n\n` +
    `📝 Причина: ${reason}\n\n` +
    `Если это ошибка, свяжитесь с поддержкой.`,

  botMaintenance:
    `🔧 <b>Бот временно недоступен</b>\n\n` +
    `Идут технические работы или обновление. Скоро вернёмся. Спасибо за терпение ༉`,
  botMaintenanceCustom: (msg: string) => `🔧 ${msg}`,
  referralDisabled: `🔒 <b>Реферальная система отключена</b>\n\nПрограмма приглашений временно недоступна.`,
  shopDisabled: `🔒 <b>Магазин отключён</b>\n\nСейчас магазин временно недоступен. Попробуйте позже.`,

  stockSubscribed: `🔔 Подписка оформлена! Мы сообщим, когда товар появится в наличии.`,
  stockAlreadySubscribed: `✅ Вы уже подписаны. Мы уведомим вас, когда товар появится.`,
  stockRestocked: (data: { productName: string }) =>
    `🎉 <b>Товар снова в наличии!</b>\n\n📦 ${data.productName} снова доступен.\n\n🛍 Покупайте прямо сейчас!`,

  enterQuantityPrompt: `📦 Введите нужное количество:`,
  enterQuantityHint: `⚠️ Вводите только число`,
  quantityInvalid: `${e.reject} Некорректное количество. Введите положительное число.`,
  quantityExceedsStock: (data: { stock: number }) =>
    `${e.reject} Недостаточно товара на складе. Доступно: <b>${data.stock}</b> шт.`,
  quantityExceedsLimit: (data: { max: number }) =>
    `${e.reject} Максимум <b>${data.max}</b> шт. в одном заказе.`,
  warrantyDays: (data: { days: number }) =>
    `Гарантия: <b>${data.days} дней</b>`,
  termsTitle: `Правила и условия`,
  btnChangeQuantity: `✏️ Изменить количество`,
  inventoryOrderSummary: (data: {
    productName: string;
    qty: number;
    unitPrice: string;
    total: string;
    currency: string;
  }) =>
    `${e.clipboard} <b>Сводка заказа</b>\n\n` +
    `📦 Товар: <b>${data.productName}</b>\n` +
    `🔢 Количество: <b>${data.qty}</b>\n` +
    `💰 Цена за единицу: <b>${data.unitPrice} ${data.currency}</b>\n` +
    `💵 Итоговая сумма: <b>${data.total} ${data.currency}</b>`,
  inventoryOrderSuccess: (data: {
    orderId: number;
    productName: string;
    qty: number;
    total: string;
    remainingBalance: string;
    currency: string;
  }) =>
    `${e.party} <b>Заказ успешно оформлен!</b>\n\n` +
    `📦 Товар: <b>${data.productName}</b>\n` +
    `🔢 Количество: <b>${data.qty}</b>\n` +
    `💵 Оплачено: <b>${data.total} ${data.currency}</b>\n` +
    `${e.wallet} Остаток: <b>${data.remainingBalance} ${data.currency}</b>\n` +
    `${e.id} Номер заказа: #${data.orderId}`,
  inventoryDeliveryHeader: (data: { productName: string }) =>
    `${e.key} <b>Доставка: ${data.productName}</b>`,
  inventoryDeliveryItem: (data: { index: number; content: string }[]) =>
    `${e.fire} Спасибо за покупку!\n\n` +
    `${e.bag} Ваш заказ готов:\n\n` +
    data.map((item) => `<b>#${item.index}</b>\n${item.content}`).join("\n\n") +
    `\n\n${e.truck} Заглядывайте к нам снова!\n` +
    `${e.sparkles} Будем рады видеть вас снова`,
  adminConfirmrechargeMsg: (
    userLabel: string,
    opts: any,
    formatNum: (num: number) => string,
    methodLabel: string,
  ) =>
    `💵 <b>Запрос на пополнение кошелька</b>\n\n` +
    `👤 Пользователь: ${userLabel} (<code>${opts.userId}</code>)\n` +
    `💰 Сумма: <b>${formatNum(opts.amount)}</b> томан\n` +
    `🔑 Способ: ${methodLabel}\n`,
  regionNotFound: "Регион не найден ❌",

  langEnglish: `${e.flag_en} English`,
  langPersian: `${e.flag_ir} Persian`,
  langRussian: `${e.flag_ru} Русский`,
} satisfies ShouldFollowLanguageStrict<typeof fa>;
