import type { LanguageMap } from "@gramio/i18n";
import { e } from "./emojies";
// ─── Premium Telegram Emoji IDs ────────────────────────────────────────────
// Usage: <tg-emoji emoji-id="ID">fallback</tg-emoji>

export const fa = {
  // Language Selection
  selectLanguage: `${e.earth} <b>زبان مورد نظرت رو انتخاب کن:</b>`,
  languageSelected: (lang: string) =>
    `${e.checkBold} زبان به <b>${lang}</b> تغییر یافت`,

  // Greeting & Welcome
  greeting: (name: string) => `سلام <b>${name}</b>! ${e.sparkles}`,
  welcome: (name: string) =>
    `${e.crown} سلام <b>${name}</b>، خوش اومدی!\n\n` +
    `${e.gem} بهترین سرویس‌های دیجیتال رو با بهترین قیمت پیدا می‌کنی اینجا.\n`,

  // Main Menu
  mainMenu: `${e.home} منوی اصلی`,
  chooseAction: "",
  main_menu: (name: string) =>
    `${e.crown} سلام <b>${name}</b>!\n\n` +
    `${e.sparkles} به فروشگاه دیجیتال ما خوش اومدی!\n\n` +
    `${e.gem} اشتراک‌های پریمیوم، اکانت‌های هوش مصنوعی و سرویس‌های دیجیتال — همه با بهترین قیمت.\n\n` +
    `یه گزینه انتخاب کن:`,

  // Buttons
  btnProducts: `${e.bag} محصولات`,
  btnMyOrders: `${e.box} سفارشات من`,
  btnWallet: `${e.wallet} کیف پول`,
  btnInviteFriends: `${e.users} دعوت دوستان`,
  btnDiscountCode: `${e.gift} کد تخفیف`,
  btnSupport: `${e.chat} پشتیبانی`,
  btnSettings: `${e.settings} تنظیمات`,
  btnBack: `${e.back} بازگشت`,
  btnCancel: `${e.cross} لغو`,
  btnMainMenu: `${e.home} منوی اصلی`,
  btnChangeLanguage: `🌐 تغییر زبان`,
  btnNotifications: `${e.bell} اعلان‌ها`,
  btnYes: `${e.checkBold} بله`,
  btnNo: `${e.cross} خیر`,
  btnConfirm: `${e.checkBold} تایید`,

  // Products
  btnBuyProduct: `${e.bag} خرید`,
  btnNotifyStock: `${e.bell} اطلاع موجودی`,
  btnConfirmOrder: `${e.checkBold} تایید سفارش`,
  btnAddDiscountCode: `${e.ticket} افزودن کد تخفیف`,
  productsTitle: `${e.bag} محصولات`,
  selectCategory: `${e.tag} یه دسته‌بندی انتخاب کن:`,
  categoryProducts: (category: string) => `محصولات <b>${category}</b>:`,
  noProducts: `${e.cross} محصولی در این دسته موجود نیست.`,
  productDetails: `${e.box} جزئیات محصول`,
  price: `${e.wallet} قیمت:`,
  stock: `${e.box} موجودی:`,
  available: `${e.checkBold} موجود`,
  outOfStock: `${e.cross} ناموجود`,
  deliveryTime: `${e.clock} زمان تحویل:`,
  deliveryType: `${e.truck} نوع تحویل:`,
  deliveryAutomatic: `${e.zap} فوری (خودکار)`,
  deliveryManual: `${e.person} دستی (۱ تا ۲۴ ساعت)`,
  deliveryCoordination: `${e.calendar} نیاز به هماهنگی`,
  selectPlan: `${e.clipboard} پلن مورد نظرت رو انتخاب کن:`,
  orderSummary: `${e.clipboard} خلاصه سفارش:`,
  total: `${e.wallet} جمع کل:`,
  currency: "تومان",
  oneTime: "یک‌بار",
  duration_day: "روز",
  duration_month: "ماه",
  duration_year: "سال",

  // Wallet
  walletTitle: `${e.wallet} کیف پول`,
  walletBalance: (balance: string) => `موجودی: <b>${balance}</b> تومان`,
  walletEmpty: `${e.wallet} کیف پولت فعلاً خالیه ${e.sparkles} شارژش کن و شروع کن!`,
  btnRechargeWallet: `${e.card} شارژ کیف پول`,
  btnTransactionHistory: `${e.chart} تاریخچه تراکنش‌ها`,

  // Wallet Recharge
  rechargeWalletTitle: `${e.card} شارژ کیف پول`,
  rechargeSelectMethod: `روش شارژ رو انتخاب کن:`,
  btnRechargeCrypto: `${e.coin} پرداخت کریپتو (USDT)`,
  btnRechargeCard: `${e.card} پرداخت با کارت`,
  btnRechargeZarinpal: `${e.wallet} درگاه زرین‌پال`,

  rechargeEnterAmount: `${e.wallet} مبلغ شارژ رو وارد کن:`,
  rechargeEnterAmountUsdt: `${e.coin} مقدار USDT رو وارد کن:`,
  rechargeMinAmount: (amount: string) =>
    `حداقل مبلغ شارژ: <b>${amount}</b> تومان`,
  rechargeMaxAmount: (amount: string) =>
    `حداکثر مبلغ شارژ: <b>${amount}</b> تومان`,
  rechargeMinAmountUsdt: (amount: string) =>
    `حداقل مقدار: <b>${amount}</b> USDT`,
  rechargeMaxAmountUsdt: (amount: string) =>
    `حداکثر مقدار: <b>${amount}</b> USDT`,
  rechargeInvalidAmount: `${e.cross} مبلغ وارد شده نامعتبره`,
  rechargeTooLow: (min: string) =>
    `${e.cross} مبلغ شارژ باید حداقل <b>${min}</b> تومان باشه`,
  rechargeTooHigh: (max: string) =>
    `${e.cross} مبلغ شارژ نمی‌تونه بیشتر از <b>${max}</b> تومان باشه`,

  // Crypto Payment
  rechargeCryptoTitle: `${e.coin} پرداخت کریپتو`,
  rechargeCryptoAddress: (address: string) =>
    `آدرس کیف پول:\n\n<code>${address}</code>`,
  rechargeCryptoAmount: (amount: string) => `مبلغ USDT: <b>${amount}</b>`,
  rechargeCryptoNetwork: (network: string) => `شبکه: <b>${network}</b>`,
  rechargeCryptoInstructions:
    `${e.clipboard} <b>دستورالعمل پرداخت:</b>\n\n` +
    `۱. مبلغ USDT رو به آدرس بالا ارسال کن\n` +
    `۲. TxID (شناسه تراکنش) رو برام بفرست\n` +
    `۳. تا ۳۰ دقیقه صبر کن تا تأیید بشه`,
  rechargeCryptoSendTxId: `TxID (شناسه تراکنش) رو ارسال کن:`,
  rechargeCryptoTxIdReceived: `${e.checkBold} شناسه تراکنش دریافت شد\n\n${e.hourglass} در حال بررسی پرداخت...\nاین فرآیند ممکنه تا ۳۰ دقیقه طول بکشه.`,
  rechargeCryptoVerified: (amount: string) =>
    `${e.party} <b>پرداخت تأیید شد!</b>\n\n${e.gem} <b>${amount}</b> تومان به کیف پولت اضافه شد.`,
  rechargeCryptoFailed: `${e.cross} پرداخت تأیید نشد. لطفاً با پشتیبانی تماس بگیر.`,

  // Card/Zarinpal Payment
  rechargeCardTitle: `${e.card} پرداخت با کارت`,
  rechargeZarinpalTitle: `${e.wallet} درگاه زرین‌پال`,
  rechargePaymentLink: (amount: string) =>
    `مبلغ: <b>${amount}</b> تومان\n\nروی دکمه زیر کلیک کن تا به درگاه پرداخت بری:`,
  btnPayNow: `${e.card} پرداخت`,
  rechargePaymentPending: `${e.hourglass} در انتظار پرداخت...\n\nلطفاً پرداخت رو در مرورگر کامل کن.`,
  rechargePaymentSuccess: (amount: string) =>
    `${e.party} <b>پرداخت موفق!</b>\n\n${e.gem} <b>${amount}</b> تومان به کیف پولت اضافه شد.`,
  rechargePaymentFailed: `${e.cross} پرداخت ناموفق بود. دوباره تلاش کن.`,
  rechargePaymentCancelled: `${e.warn} پرداخت لغو شد.`,

  // Transaction History
  transactionHistoryTitle: `${e.chart} تاریخچه تراکنش‌ها`,
  transactionHistoryEmpty: `${e.chart} هنوز تراکنشی نداری — اولین خریدت رو ثبت کن!`,
  transactionType: "نوع:",
  transactionAmount: "مبلغ:",
  transactionDate: "تاریخ:",
  transactionDescription: "توضیحات:",

  // Transaction Types
  txTypeCredit: "➕ واریز",
  txTypeDebit: "➖ برداشت",

  // Transaction Sources
  txSourcePurchase: `${e.bag} خرید`,
  txSourceRecharge: `${e.card} شارژ`,
  txSourceRefund: `${e.bounce} بازگشت وجه`,
  txSourceReferral: `${e.users} پاداش دعوت`,
  txSourceReward: `${e.gift} جایزه`,
  txSourcePerk: `${e.target} پاداش Perk`,
  txSourceAdminAdjustment: `${e.settings} تعدیل ادمین`,

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
    `${e.crown} <b>دوستاتو دعوت کن، درآمد داشته باش!</b>\n\n` +
    `${e.users} دعوت‌های موفق: <b>${data.totalReferrals}</b>\n` +
    `${e.gem} مجموع پاداش‌ها: <b>${data.totalRewards}</b> تومان\n\n` +
    `🔗 <b>لینک اختصاصی تو:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `${e.sparkles} <b>چطور کار می‌کنه؟</b>\n` +
    `۱. لینکت رو برای دوستات بفرست\n` +
    `۲. وقتی عضو شدن، پاداش می‌گیری\n` +
    `۳. پاداش مستقیم به کیف پولت واریز می‌شه\n\n` +
    `${e.gem} پاداش هر دعوت: <b>۱۰٬۰۰۰</b> تومان`,
  btnShareInviteLink: `${e.send} اشتراک‌گذاری لینک`,
  btnCopyLink: `${e.clipboard} کپی لینک`,
  btnViewReferrals: `${e.users} لیست دعوت‌شدگان`,
  inviteShareText: `${e.gift} با این لینک عضو شو و تخفیف ویژه بگیر!`,
  inviteLinkCopied: (link: string) =>
    `${e.checkBold} لینک کپی شد!\n\n<code>${link}</code>\n\nاین لینک رو برای دوستات بفرست.`,
  noReferralsYet: `${e.users} هنوز کسی رو دعوت نکردی — شروع کن و درآمد داشته باش!`,
  referralListTitle: `${e.users} <b>لیست دعوت‌شدگان</b>`,
  andMore: (count: number) => `و <b>${count}</b> نفر دیگه...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `${e.party} کاربر جدیدی (<b>${data.userName}</b>) از لینک دعوت تو پیوست!\n` +
    `${e.gem} <b>${data.amount}</b> تومان به حسابت اضافه شد.`,

  // Discount Codes
  discountCodeInfo:
    `${e.gift} <b>کد تخفیف</b>\n\n` +
    `با کدهای تخفیف، قیمت خریدت رو پایین بیار.\n\n` +
    `می‌تونی هنگام خرید کد بزنی یا از اینجا اعتبارش رو چک کنی.`,
  btnEnterDiscountCode: `${e.pencil} وارد کردن کد تخفیف`,
  btnDiscountHistory: `${e.chart} تاریخچه استفاده`,
  enterDiscountCodePrompt: `${e.pencil} کد تخفیفت رو وارد کن:\n\nمثال: <code>SUMMER2024</code>`,
  btnTryAgain: `${e.refresh} تلاش دوباره`,
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `${e.checkBold} <b>کد تخفیف معتبره!</b>\n\n` +
    `${e.ticket} کد: <code>${data.code}</code>\n` +
    `${e.tag} نوع: ${data.type}\n` +
    `${e.gem} مقدار: ${data.value}\n` +
    `${e.clipboard} توضیحات: ${data.description}\n\n` +
    `این کد رو هنگام خرید استفاده کن.`,
  discountCodeInvalid: (reason: string) =>
    `${e.cross} <b>کد تخفیف نامعتبره</b>\n\n${reason}`,
  discountTypePercentage: "درصدی",
  discountTypeFixed: "مبلغ ثابت",
  noDescription: "بدون توضیحات",
  noDiscountHistory: `${e.chart} هنوز از هیچ کد تخفیفی استفاده نکردی — اولین باری رو ثبت کن!`,
  discountHistoryTitle: `${e.chart} <b>تاریخچه کدهای تخفیف</b>`,
  discountAmount: "مقدار تخفیف",
  orderId: "شماره سفارش",

  // Settings
  settingsTitle: `${e.settings} تنظیمات`,
  settingsDescription: `${e.info} از اینجا می‌تونی حسابت رو مدیریت کنی.`,
  btnAccountInfo: `${e.person} اطلاعات حساب`,
  btnNotificationSettings: `${e.bell} تنظیمات اعلان‌ها`,
  btnPrivacy: `${e.lock} حریم خصوصی`,
  btnAbout: `${e.info} درباره ما`,

  // Account Info
  accountInfoTitle: `${e.person} اطلاعات حساب`,
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `${e.crown} <b>اطلاعات حساب تو</b>\n\n` +
    `${e.id} شناسه: <code>${data.userId}</code>\n` +
    `${e.person} نام‌کاربری: ${data.username ? `@${data.username}` : "ندارد"}\n` +
    `${e.tag} نام: ${data.firstName}\n` +
    `${e.calendar} عضویت: ${data.joinDate}\n\n` +
    `${e.chart} <b>آمار:</b>\n` +
    `${e.bag} خریدها: <b>${data.totalOrders}</b>\n` +
    `${e.gem} مجموع خرید: <b>${data.totalSpent}</b> تومان\n` +
    `${e.users} دعوت‌ها: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: `${e.bell} تنظیمات اعلان‌ها`,
  notificationSettingsDescription: `${e.info} انتخاب کن کدوم اعلان‌ها رو دریافت کنی:`,
  btnToggleOrderNotifications: (enabled: boolean) =>
    `${enabled ? e.checkBold : e.cross} اعلان سفارشات`,
  btnToggleWalletNotifications: (enabled: boolean) =>
    `${enabled ? e.checkBold : e.cross} اعلان کیف پول`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `${enabled ? e.checkBold : e.cross} اعلان تخفیفات`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `${enabled ? e.checkBold : e.cross} اعلان دعوت دوستان`,
  btnToggleStockNotifications: (enabled: boolean) =>
    `${enabled ? e.checkBold : e.cross} اعلان موجودی محصولات`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? `${e.checkBold} فعال شد` : `${e.cross} غیرفعال شد`}: ${type}`,
  allNotificationsEnabled: `${e.checkBold} همه اعلان‌ها فعالن`,
  allNotificationsDisabled: `${e.cross} همه اعلان‌ها غیرفعالن`,

  // Privacy
  privacyTitle: `${e.lock} حریم خصوصی`,
  privacyDescription: `${e.shield} مدیریت داده‌های شخصی:`,
  btnClearHistory: `${e.trash} پاک کردن تاریخچه`,
  btnDeleteAccount: `${e.cross} حذف حساب`,
  btnExportData: `${e.send} دریافت اطلاعات من`,
  clearHistoryConfirm:
    `${e.warn} <b>مطمئنی؟</b>\n\n` +
    `تاریخچه‌ات پاک می‌شه — این عمل برگشت نداره.`,
  clearHistorySuccess: `${e.checkBold} تاریخچه با موفقیت پاک شد.`,
  clearHistoryCancelled: `${e.cross} عملیات لغو شد.`,
  deleteAccountConfirm:
    `${e.warn} <b>هشدار!</b>\n\n` +
    `مطمئنی می‌خوای حسابت رو حذف کنی؟\n\n` +
    `${e.cross} تمام موارد زیر <b>برای همیشه</b> پاک می‌شن:\n` +
    `• سفارشات\n• کیف پول\n• دعوت‌ها\n\n` +
    `این عمل <b>غیرقابل بازگشته</b>!`,
  deleteAccountSuccess: `${e.checkBold} حسابت حذف شد.\n\nامیدواریم دوباره ببینیمت!`,
  deleteAccountCancelled: `${e.checkBold} حسابت حذف نشد.`,
  exportDataProcessing: `${e.hourglass} در حال آماده‌سازی اطلاعاتت...`,
  exportDataReady: `${e.checkBold} اطلاعاتت آماده‌ست!`,

  // About
  aboutTitle: `${e.info} درباره ما`,
  aboutDescription:
    `${e.robot} <b>ربات فروش سرویس‌های دیجیتال</b>\n\n` +
    `${e.gem} بهترین سرویس‌ها با بهترین قیمت و سریع‌ترین تحویل.\n\n` +
    `${e.mail} <b>ارتباط با ما:</b>\n` +
    `• پشتیبانی: @TajEzat\n` +
    `• کانال: @ZendeBadParsi\n\n` +
    `${e.tag} نسخه: 1.0.0`,

  // Orders (سفارشات من)
  ordersTitle: `${e.box} سفارشات من`,
  ordersEmpty: `${e.box} هنوز سفارشی ثبت نکردی!\n\nبرو سراغ محصولات و اولین خریدت رو بزن.`,
  ordersTotal: `${e.chart} کل سفارشات`,
  ordersActive: `${e.blue} سفارشات فعال`,
  ordersCompleted: `${e.green} سفارشات تکمیل‌شده`,
  ordersSelectFilter: `یه فیلتر انتخاب کن:`,

  // Orders Filter Buttons
  btnOrdersFilterActive: `${e.blue} فعال`,
  btnOrdersFilterCompleted: `${e.green} تکمیل‌شده`,
  btnOrdersFilterAll: `${e.clipboard} همه`,

  // Orders List
  ordersActiveTitle: `${e.blue} سفارشات فعال`,
  ordersCompletedTitle: `${e.green} سفارشات تکمیل‌شده`,
  ordersAllTitle: `${e.clipboard} تمام سفارشات`,
  ordersSelectOne: `${e.pin} روی یه سفارش کلیک کن تا جزئیاتش رو ببینی:`,
  ordersNoActive: `${e.info} هیچ سفارش فعالی نداری`,
  ordersNoCompleted: `${e.info} هیچ سفارش تکمیل‌شده‌ای نداری`,

  // Order Details
  orderDetailsTitle: `${e.box} جزئیات سفارش`,
  orderNumber: "شماره سفارش",
  orderProduct: "محصول",
  orderStatus: "وضعیت",
  orderTotalPrice: "قیمت اولیه",
  orderDiscount: "تخفیف",
  orderWalletUsed: "کیف پول",
  orderFinalPrice: "قیمت نهایی",
  orderCreatedAt: "تاریخ ثبت",
  orderDeliveredAt: "تاریخ تحویل",
  orderScheduledTime: "زمان‌بندی",
  orderNotes: "یادداشت",

  // Order Delivery Info
  orderDeliveryInfo: "اطلاعات تحویل",
  orderDeliveryCode: "کد",
  orderDeliveryEmail: "ایمیل",
  orderDeliveryLink: "لینک",
  orderDeliveryInstructions: "دستورالعمل",

  // Order Buttons
  btnOrderOpenTicket: `${e.chat} باز کردن تیکت`,
  btnOrderRenew: `${e.refresh} تمدید`,
  btnOrderReschedule: `${e.calendar} تغییر زمان`,
  btnOrderReportProblem: `${e.warn} گزارش مشکل`,
  btnBackToOrders: `${e.back} بازگشت به سفارشات`,

  // Order Actions
  orderNotFound: "سفارش پیدا نشد",
  orderAccessDenied: "دسترسی به این سفارش مجاز نیست",
  orderTicketComingSoon: "سیستم تیکت به‌زودی فعال می‌شه",
  orderNotRenewable: "این محصول قابل تمدید نیست",
  orderRenewComingSoon: "امکان تمدید به‌زودی فعال می‌شه",
  orderCannotReschedule: "این سفارش قابل تغییر زمان نیست",
  orderRescheduleComingSoon: "امکان تغییر زمان به‌زودی فعال می‌شه",
  orderReportComingSoon: "سیستم گزارش مشکل به‌زودی فعال می‌شه",

  // Support & Tickets
  supportMenuText:
    `${e.chat} <b>مرکز پشتیبانی</b>\n\nچطور می‌تونم کمکت کنم؟\n\n` +
    `• ارسال تیکت پشتیبانی\n` +
    `• گزارش مشکل\n` +
    `• مشاهده تیکت‌ها`,

  btnNewSupportTicket: `${e.ticket} تیکت جدید`,
  btnNewReportTicket: `${e.warn} گزارش مشکل`,
  btnMyTickets: `${e.clipboard} تیکت‌های من`,
  btnViewMyTickets: `${e.eye} مشاهده تیکت‌ها`,
  btnBackToMain: `${e.home} منوی اصلی`,
  btnReplyToTicket: `${e.chat} پاسخ`,
  btnViewMessages: `${e.chat} مشاهده پیام‌ها`,
  btnBackToTickets: `${e.back} بازگشت به تیکت‌ها`,
  btnViewTicket: `${e.eye} مشاهده تیکت`,
  btnViewOrder: `${e.box} مشاهده سفارش`,

  // Ticket Creation
  ticketSupportPrompt:
    `${e.ticket} <b>تیکت پشتیبانی جدید</b>\n\n` +
    `سوال یا مشکلت رو کامل توضیح بده.\n` +
    `تیم ما در اسرع وقت جواب می‌ده.`,

  ticketOrderPrompt:
    `${e.box} <b>مشکل سفارش</b>\n\n` +
    `مشکل مربوط به سفارشت رو کامل توضیح بده.`,

  ticketReportPrompt:
    `${e.warn} <b>گزارش مشکل</b>\n\n` +
    `مشکلی که باهاش مواجه شدی رو کامل توضیح بده.`,

  ticketMessageTooShort: `${e.cross} لطفاً بیشتر توضیح بده (حداقل ۱۰ کاراکتر)`,
  ticketMessageEmpty: `${e.cross} پیام نمی‌تونه خالی باشه`,

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    `${e.checkBold} <b>تیکت ایجاد شد!</b>\n\nشماره تیکت: <b>${data.ticketNumber}</b>\n\nتیم پشتیبانی ما مطلع شدن و به‌زودی جواب می‌دن.`,

  ticketCreateError: `${e.cross} ایجاد تیکت با خطا مواجه شد. دوباره امتحان کن یا مستقیم با پشتیبانی تماس بگیر.`,

  ticketOrderNotFound: `${e.cross} سفارش پیدا نشد`,

  // Ticket List
  ticketListTitle: `${e.clipboard} <b>تیکت‌های تو</b>`,
  ticketListEmpty: `${e.chat} هنوز هیچ تیکتی نداری — نگرانی؟ تیکت باز کن!`,
  ticketListShowingFirst10: "نمایش ۱۰ تیکت اول",
  ticketListError: `${e.cross} بارگذاری تیکت‌ها با خطا مواجه شد. دوباره تلاش کن.`,

  // Ticket Details
  ticketNotFound: `${e.cross} تیکت پیدا نشد`,
  ticketNotYours: `${e.cross} این تیکت مال تو نیست`,
  ticketAlreadyClosed: `${e.lock} این تیکت بسته‌ست`,
  ticketLoadError: `${e.cross} بارگذاری تیکت با خطا مواجه شد. دوباره تلاش کن.`,

  status: "وضعیت",
  created: "تاریخ ایجاد",
  order: "سفارش",
  messages: "پیام‌ها",
  lastMessage: "آخرین پیام",

  // Ticket Statuses
  ticketStatus_open: `${e.green} باز`,
  ticketStatus_waiting_user: `${e.yellow} در انتظار پاسخ تو`,
  ticketStatus_waiting_support: `${e.orange} در انتظار پشتیبانی`,
  ticketStatus_in_progress: `${e.blue} در حال بررسی`,
  ticketStatus_resolved: `${e.checkBold} حل شده`,
  ticketStatus_closed: `${e.lock} بسته شده`,
  ticketStatus_blocked: `${e.no} مسدود شده`,

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    `${e.chat} <b>پاسخ به ${data.ticketNumber}</b>\n\nپیامت رو تایپ کن:`,

  ticketReplySent: `${e.checkBold} پیامت ارسال شد!\n\nوقتی جواب بیاد بهت اطلاع می‌دم.`,

  ticketReplyError: `${e.cross} ارسال پیام با خطا مواجه شد. دوباره تلاش کن.`,

  ticketCreationCancelled: `${e.cross} ایجاد تیکت لغو شد`,

  // Ticket Messages
  ticketMessages: "پیام‌ها",
  ticketNoMessages: "هنوز پیامی در این تیکت نیست",
  ticketMessagesError: `${e.cross} بارگذاری پیام‌ها با خطا مواجه شد`,
  ticketShowingLast5Messages: "نمایش ۵ پیام آخر",
  you: "تو",
  support: "پشتیبانی",

  // Purchase / Order Completion
  insufficientBalance: (data: { required: string; current: string }) =>
    `${e.cross} <b>موجودی کافی نیست</b>\n\nنیاز: <b>${data.required}</b> تومان\nموجودی تو: <b>${data.current}</b> تومان\n\nکیف پولت رو شارژ کن و دوباره تلاش کن.`,
  noConfigAvailable: `${e.cross} در حال حاضر کانفیگ VPN برای این پلن موجود نیست. با پشتیبانی تماس بگیر.`,
  orderSuccess: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>خرید موفق بود!</b>\n\n` +
    `${e.bag} محصول: ${data.productName}\n` +
    `${e.clipboard} پلن: ${data.planName}\n` +
    `${e.gem} مبلغ: <b>${data.amount}</b> تومان\n` +
    `${e.wallet} موجودی باقی: <b>${data.remainingBalance}</b> تومان\n` +
    `${e.id} سفارش: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `${e.key} <b>کانفیگ VPN تو</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `روی کانفیگ بالا تپ کن تا کپی بشه، بعد توی اپ VPN وارد کن.`,
  btnMyOrders2: `${e.box} سفارشات من`,
  btnBackToMenu: `${e.home} منوی اصلی`,

  // Discount code during order flow
  enterDiscountCodeForOrder: `${e.ticket} <b>افزودن کد تخفیف</b>\n\nکد تخفیفت رو وارد کن:\n\nمثال: <code>SUMMER2024</code>`,
  btnSkipDiscount: `${e.zap} بدون کد تخفیف ادامه بده`,
  btnRemoveDiscount: `${e.trash} حذف تخفیف`,
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `${e.checkBold} <b>کد تخفیف اعمال شد!</b>\n\n` +
    `${e.ticket} کد: <code>${data.code}</code>\n` +
    `${e.gem} تخفیف: -<b>${data.discountAmount}</b> تومان\n` +
    `${e.wallet} مبلغ جدید: <b>${data.finalPrice}</b> تومان`,
  orderSummaryWithDiscount: (data: {
    productName: string;
    planName: string;
    duration: string;
    originalPrice: string;
    discountAmount: string;
    finalPrice: string;
    code: string;
  }) =>
    `${e.clipboard} <b>خلاصه سفارش</b>\n\n` +
    `${e.bag} محصول: ${data.productName}\n` +
    `${e.tag} پلن: ${data.planName}\n` +
    (data.duration ? `${e.clock} مدت: ${data.duration}\n` : "") +
    `\n${e.wallet} قیمت اصلی: <b>${data.originalPrice}</b> تومان\n` +
    `${e.ticket} تخفیف (${data.code}): -<b>${data.discountAmount}</b> تومان\n` +
    `${e.checkBold} قیمت نهایی: <b>${data.finalPrice}</b> تومان`,
  discountNotApplicableForProduct: `${e.cross} این کد تخفیف برای این محصول معتبر نیست.`,
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `${e.cross} <b>موجودی کافی نیست</b>\n\nنیاز (بعد تخفیف): <b>${data.required}</b> تومان\nموجودی تو: <b>${data.current}</b> تومان\n\nکیف پولت رو شارژ کن.`,

  // Force Join Channels/Groups
  joinChannelRequired: `${e.flag_ir} <b>عضویت الزامی</b>\n\nبرای استفاده از ربات، اول توی کانال‌ها/گروه‌های زیر عضو بشو:`,
  btnIJoined: `${e.checkBold} عضو شدم — بررسی کن`,
  joinChannelNotJoinedAlert: `${e.cross} هنوز توی همه کانال‌های لازم عضو نشدی. عضو بشو و دوباره امتحان کن.`,

  // ── فلوی سفارش دستی / زمان‌بندی‌شده ──────────────────────────────────────
  manualOrderInfoRequired: `${e.clipboard} <b>اطلاعات مورد نیاز</b>\n\nبرای پردازش سفارشت، اطلاعات زیر رو وارد کن:`,
  manualOrderStep: (data: { current: number; total: number }) =>
    `${e.pin} مرحله ${data.current} از ${data.total}`,
  manualOrderEmailPrompt: `${e.mail} <b>آدرس ایمیل</b> اکانت رو وارد کن:`,
  manualOrderLoginUsernamePrompt: `${e.person} <b>نام کاربری</b> اکانت رو وارد کن:`,
  manualOrderLoginPasswordPrompt: `${e.lock} <b>رمز عبور</b> اکانت رو وارد کن:`,
  manualOrderRegionPrompt: `${e.earth} <b>منطقه مورد نظر</b> رو وارد کن (مثلاً: US، EU، Asia):`,
  manualOrderNeedsLabel: "اطلاعات مورد نیاز",
  btnCancelManualOrder: `${e.cross} لغو سفارش`,
  manualOrderCancelled: `${e.cross} سفارش لغو شد.`,
  manualOrderPending: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.checkBold} <b>سفارش ثبت شد!</b>\n\n` +
    `${e.bag} محصول: ${data.productName}\n` +
    `${e.clipboard} پلن: ${data.planName}\n` +
    `${e.gem} مبلغ: <b>${data.amount}</b> تومان\n` +
    `${e.wallet} موجودی باقی: <b>${data.remainingBalance}</b> تومان\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.hourglass} سفارشت به تیم ما رسید.\n` +
    `ظرف <b>۱ تا ۲۴ ساعت</b> پردازش و بهت اطلاع داده می‌شه.`,
  orderDeliveredNotification: (data: {
    orderId: number;
    productName: string;
  }) =>
    `${e.party} <b>سفارشت آماده‌ست!</b>\n\n` +
    `${e.bag} محصول: ${data.productName}\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `اطلاعات دسترسی توی بخش سفارشات من ← جزئیات سفارش موجوده.`,

  // ── انتخاب بازه زمانی ────────────────────────────────────────────────────
  schedulePickSlot: (data: { date: string }) =>
    `${e.calendar} <b>انتخاب بازه زمانی</b>\n\nیه بازه آزاد برای <b>${data.date}</b> انتخاب کن:\n\n${e.checkBold} = آزاد  |  ${e.cross} = پر`,
  scheduleSlotFree: "جای خالی",
  scheduleSlotFullAlert: `${e.cross} این بازه پر شد. بازه دیگه‌ای انتخاب کن.`,
  scheduleBooked: (data: {
    orderId: number;
    productName: string;
    planName: string;
    timeSlot: string;
    date: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>بازه زمانی رزرو شد!</b>\n\n` +
    `${e.bag} محصول: ${data.productName}\n` +
    `${e.clipboard} پلن: ${data.planName}\n` +
    `${e.calendar} تاریخ: <b>${data.date}</b>\n` +
    `${e.clock} ساعت: <b>${data.timeSlot}</b>\n` +
    `${e.gem} مبلغ: <b>${data.amount}</b> تومان\n` +
    `${e.wallet} موجودی باقی: <b>${data.remainingBalance}</b> تومان\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.bell} <b>${e.clock} ۱۵ دقیقه</b> قبل از شروع بهت یادآوری می‌کنم.\n` +
    `وضعیت جلسه رو توی <b>سفارشات من</b> پیگیری کن.`,
  scheduleReminderNotification: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.bell} <b>یادآوری جلسه!</b>\n\n` +
    `جلسه <b>${data.productName}</b> تو <b>۱۵ دقیقه</b> دیگه شروع می‌شه.\n` +
    `${e.clock} ساعت: <b>${data.timeSlot}</b>\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.rocket} آماده باش — تیم ما به‌زودی با تو تماس می‌گیره.`,
  sessionStartedUser: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.rocket} <b>جلسه‌ات شروع شد!</b>\n\n` +
    `${e.bag} محصول: <b>${data.productName}</b>\n` +
    `${e.clock} بازه: <b>${data.timeSlot}</b>\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.key} ادمین از همین چت اطلاعات لاگین رو برات می‌فرسته.\n` +
    `${e.sparkles} آماده‌ای؟ بپر توش!`,
} satisfies LanguageMap;
