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
    format`به فروشگاه دیجیتال ما خوش آمدید، ${bold(name)}! 🎉\n\nما انواع اشتراک‌ها و سرویس‌های دیجیتال را ارائه می‌دهیم.\n`,

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

  // Products
  btnBuyProduct: "🛍️ خرید",
  btnNotifyStock: "🔔 اطلاع موجودی",
  btnConfirmOrder: "✅ تایید سفارش",
  btnAddDiscountCode: "🎫 افزودن کد تخفیف",
  productsTitle: "🛍️ محصولات",
  selectCategory: "🏷️ لطفاً یک دسته‌بندی انتخاب کنید:",
  categoryProducts: (category: string) => format`محصولات ${bold(category)}:`,
  noProducts: "❌ محصولی در این دسته موجود نیست.",
  productDetails: "📦 جزئیات محصول",
  price: "💵 قیمت:",
  stock: "📦 موجودی:",
  available: "✅ موجود",
  outOfStock: "❌ ناموجود",
  deliveryTime: "⏰ زمان تحویل:",
  deliveryType: "🚚 نوع تحویل:",
  deliveryAutomatic: "⚡ فوری (خودکار)",
  deliveryManual: "👤 دستی (1-24 ساعت)",
  deliveryCoordination: "📝 نیاز به هماهنگی",
  selectPlan: "📋 لطفاً پلن را انتخاب کنید:",
  orderSummary: "📝 خلاصه سفارش:",
  total: "💰 جمع کل:",
  currency: "تومان",
  oneTime: "یک‌بار",
  duration_day: "روز",
  duration_month: "ماه",
  duration_year: "سال",

  // Wallet
  walletTitle: "💰 کیف پول",
  walletBalance: (balance: string) => format`موجودی: ${bold(balance)} تومان`,
  walletEmpty: "کیف پول شما خالی است 📭",
  btnRechargeWallet: "💳 شارژ کیف پول",
  btnTransactionHistory: "📊 تاریخچه تراکنش‌ها",

  // Wallet Recharge
  rechargeWalletTitle: "💳 شارژ کیف پول",
  rechargeSelectMethod: "لطفاً روش شارژ را انتخاب کنید:",
  btnRechargeCrypto: "🪙 پرداخت کریپتو (USDT)",
  btnRechargeCard: "💳 پرداخت با کارت",
  btnRechargeZarinpal: "💰 درگاه زرین‌پال",

  rechargeEnterAmount: "💵 لطفاً مبلغ شارژ را وارد کنید:",
  rechargeEnterAmountUsdt: "💵 لطفاً مقدار USDT را وارد کنید:",
  rechargeMinAmount: (amount: string) =>
    format`حداقل مبلغ شارژ: ${bold(amount)} تومان`,
  rechargeMaxAmount: (amount: string) =>
    format`حداکثر مبلغ شارژ: ${bold(amount)} تومان`,
  rechargeMinAmountUsdt: (amount: string) =>
    format`حداقل مقدار: ${bold(amount)} USDT`,
  rechargeMaxAmountUsdt: (amount: string) =>
    format`حداکثر مقدار: ${bold(amount)} USDT`,
  rechargeInvalidAmount: "❌ مبلغ وارد شده نامعتبر است",
  rechargeTooLow: (min: string) =>
    format`❌ مبلغ شارژ باید حداقل ${bold(min)} تومان باشد`,
  rechargeTooHigh: (max: string) =>
    format`❌ مبلغ شارژ نمی‌تواند بیشتر از ${bold(max)} تومان باشد`,

  // Crypto Payment
  rechargeCryptoTitle: "🪙 پرداخت کریپتو",
  rechargeCryptoAddress: (address: string) =>
    format`آدرس کیف پول:\n\n${bold(address)}`,
  rechargeCryptoAmount: (amount: string) => format`مبلغ USDT: ${bold(amount)}`,
  rechargeCryptoNetwork: (network: string) => format`شبکه: ${bold(network)}`,
  rechargeCryptoInstructions:
    "📝 دستورالعمل:\n\n1. مبلغ USDT را به آدرس بالا ارسال کنید\n2. TxID (شناسه تراکنش) را ارسال کنید\n3. تا 30 دقیقه صبر کنید تا تأیید شود",
  rechargeCryptoSendTxId: "لطفاً TxID (شناسه تراکنش) را ارسال کنید:",
  rechargeCryptoTxIdReceived:
    "✅ شناسه تراکنش دریافت شد\n\nدر حال بررسی پرداخت...\nاین فرآیند ممکن است تا 30 دقیقه طول بکشد.",
  rechargeCryptoVerified: (amount: string) =>
    format`✅ پرداخت تأیید شد!\n\n${bold(amount)} تومان به کیف پول شما اضافه شد.`,
  rechargeCryptoFailed: "❌ پرداخت تأیید نشد. لطفاً با پشتیبانی تماس بگیرید.",

  // Card/Zarinpal Payment
  rechargeCardTitle: "💳 پرداخت با کارت",
  rechargeZarinpalTitle: "💰 درگاه زرین‌پال",
  rechargePaymentLink: (amount: string) =>
    format`مبلغ: ${bold(amount)} تومان\n\nروی دکمه زیر کلیک کنید تا به درگاه پرداخت منتقل شوید:`,
  btnPayNow: "💳 پرداخت",
  rechargePaymentPending:
    "⏳ در انتظار پرداخت...\n\nلطفاً پرداخت را در مرورگر تکمیل کنید.",
  rechargePaymentSuccess: (amount: string) =>
    format`✅ پرداخت موفق!\n\n${bold(amount)} تومان به کیف پول شما اضافه شد.`,
  rechargePaymentFailed: "❌ پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.",
  rechargePaymentCancelled: "⚠️ پرداخت لغو شد.",

  // Transaction History
  transactionHistoryTitle: "📊 تاریخچه تراکنش‌ها",
  transactionHistoryEmpty: "تاریخچه تراکنش شما خالی است 📭",
  transactionType: "نوع:",
  transactionAmount: "مبلغ:",
  transactionDate: "تاریخ:",
  transactionDescription: "توضیحات:",

  // Transaction Types
  txTypeCredit: "➕ واریز",
  txTypeDebit: "➖ برداشت",

  // Transaction Sources
  txSourcePurchase: "🛒 خرید",
  txSourceRecharge: "💳 شارژ",
  txSourceRefund: "↩️ بازگشت وجه",
  txSourceReferral: "👥 پاداش دعوت",
  txSourceReward: "🎁 جایزه",
  txSourcePerk: "🎯 پاداش Perk",
  txSourceAdminAdjustment: "⚙️ تعدیل ادمین",

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
    `🎁 <b>دعوت دوستان و کسب درآمد!</b>\n\n` +
    `👥 تعداد دعوت‌های شما: <b>${data.totalReferrals}</b>\n` +
    `💰 مجموع پاداش‌ها: <b>${data.totalRewards}</b> تومان\n\n` +
    `🔗 <b>لینک اختصاصی شما:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `📝 <b>نحوه کار:</b>\n` +
    `۱. لینک بالا را به دوستان خود بفرستید\n` +
    `۲. وقتی دوستان شما عضو شوند، پاداش دریافت می‌کنید\n` +
    `۳. پاداش مستقیماً به کیف پول شما واریز می‌شود\n\n` +
    `💎 پاداش هر دعوت: <b>10,000</b> تومان`,
  btnShareInviteLink: "📤 اشتراک‌گذاری لینک",
  btnCopyLink: "📋 کپی لینک",
  btnViewReferrals: "👥 مشاهده لیست دعوت‌ها",
  inviteShareText: "🎁 با استفاده از این لینک عضو شو و تخفیف ویژه بگیر!",
  inviteLinkCopied: (link: string) =>
    `✅ لینک کپی شد!\n\n${link}\n\nاین لینک را برای دوستان خود ارسال کنید.`,
  noReferralsYet: "شما هنوز کسی را دعوت نکرده‌اید 📭",
  referralListTitle: "👥 <b>لیست کاربران دعوت شده</b>",
  andMore: (count: number) => format`و ${bold(count)} نفر دیگر...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `🎉 کاربر جدیدی (${data.userName}) از طریق لینک دعوت شما پیوست!\n💰 مبلغ ${data.amount} تومان به حساب شما اضافه شد.`,

  // Discount Codes
  discountCodeInfo:
    "🎁 <b>کد تخفیف</b>\n\n" +
    "از کدهای تخفیف برای دریافت تخفیف در خریدهای خود استفاده کنید.\n\n" +
    "می‌توانید کد تخفیف را در زمان خرید وارد کنید یا از اینجا معتبر بودن آن را بررسی کنید.",
  btnEnterDiscountCode: "✏️ وارد کردن کد تخفیف",
  btnDiscountHistory: "📊 تاریخچه استفاده",
  enterDiscountCodePrompt:
    "✏️ لطفاً کد تخفیف خود را وارد کنید:\n\n" + "مثال: <code>SUMMER2024</code>",
  btnTryAgain: "🔄 تلاش مجدد",
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `✅ <b>کد تخفیف معتبر است!</b>\n\n` +
    `🎫 کد: <code>${data.code}</code>\n` +
    `📝 نوع: ${data.type}\n` +
    `💰 مقدار: ${data.value}\n` +
    `📄 توضیحات: ${data.description}\n\n` +
    `این کد را می‌توانید در زمان خرید استفاده کنید.`,
  discountCodeInvalid: (reason: string) =>
    `❌ <b>کد تخفیف نامعتبر است</b>\n\n${reason}`,
  discountTypePercentage: "درصدی",
  discountTypeFixed: "مبلغ ثابت",
  noDescription: "بدون توضیحات",
  noDiscountHistory: "شما هنوز از کد تخفیفی استفاده نکرده‌اید 📭",
  discountHistoryTitle: "📊 <b>تاریخچه استفاده از کدهای تخفیف</b>",
  discountAmount: "مقدار تخفیف",
  orderId: "شماره سفارش",

  // Settings
  settingsTitle: "⚙️ تنظیمات",
  settingsDescription: "از این بخش می‌توانید تنظیمات حساب خود را مدیریت کنید.",
  btnAccountInfo: "👤 اطلاعات حساب",
  btnNotificationSettings: "🔔 تنظیمات اعلان‌ها",
  btnPrivacy: "🔒 حریم خصوصی",
  btnAbout: "ℹ️ درباره ما",

  // Account Info
  accountInfoTitle: "👤 اطلاعات حساب کاربری",
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `👤 <b>اطلاعات حساب شما</b>\n\n` +
    `🆔 شناسه کاربری: <code>${data.userId}</code>\n` +
    `👤 نام کاربری: ${data.username ? `@${data.username}` : "ندارد"}\n` +
    `📝 نام: ${data.firstName}\n` +
    `📅 تاریخ عضویت: ${data.joinDate}\n\n` +
    `📊 <b>آمار:</b>\n` +
    `🛒 تعداد خریدها: <b>${data.totalOrders}</b>\n` +
    `💰 مجموع خرید: <b>${data.totalSpent}</b> تومان\n` +
    `👥 تعداد دعوت‌ها: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: "🔔 تنظیمات اعلان‌ها",
  notificationSettingsDescription:
    "می‌توانید انواع اعلان‌هایی که می‌خواهید دریافت کنید را انتخاب کنید:",
  btnToggleOrderNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} اعلان سفارشات`,
  btnToggleWalletNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} اعلان تراکنش‌های کیف پول`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} اعلان تخفیفات و پیشنهادها`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} اعلان دعوت دوستان`,
  btnToggleStockNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} اعلان موجودی محصولات`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? "✅ فعال شد" : "❌ غیرفعال شد"}: ${type}`,
  allNotificationsEnabled: "✅ همه اعلان‌ها فعال هستند",
  allNotificationsDisabled: "❌ همه اعلان‌ها غیرفعال هستند",

  // Privacy
  privacyTitle: "🔒 حریم خصوصی",
  privacyDescription: "مدیریت داده‌های شخصی و تنظیمات حریم خصوصی خود:",
  btnClearHistory: "🗑️ پاک کردن تاریخچه",
  btnDeleteAccount: "❌ حذف حساب کاربری",
  btnExportData: "📤 دریافت اطلاعات من",
  clearHistoryConfirm:
    "⚠️ آیا مطمئن هستید که می‌خواهید تاریخچه خود را پاک کنید؟\n\n" +
    "این عمل غیرقابل بازگشت است.",
  clearHistorySuccess: "✅ تاریخچه شما با موفقیت پاک شد.",
  clearHistoryCancelled: "❌ عملیات لغو شد.",
  deleteAccountConfirm:
    "⚠️ <b>هشدار!</b>\n\n" +
    "آیا مطمئن هستید که می‌خواهید حساب کاربری خود را حذف کنید؟\n\n" +
    "❌ تمام اطلاعات شما از جمله:\n" +
    "• سفارشات\n" +
    "• کیف پول\n" +
    "• دعوت‌ها\n" +
    "به طور دائمی حذف خواهند شد.\n\n" +
    "این عمل <b>غیرقابل بازگشت</b> است!",
  deleteAccountSuccess:
    "✅ حساب کاربری شما حذف شد.\n\nامیدواریم دوباره شما را ببینیم!",
  deleteAccountCancelled: "✅ حساب شما حذف نشد.",
  exportDataProcessing: "⏳ در حال آماده‌سازی اطلاعات شما...",
  exportDataReady: "✅ اطلاعات شما آماده است!",

  // About
  aboutTitle: "ℹ️ درباره ما",
  aboutDescription:
    "🤖 <b>ربات فروش محصولات دیجیتال</b>\n\n" +
    "ما بهترین سرویس‌های دیجیتال را با بهترین قیمت و سریع‌ترین تحویل ارائه می‌دهیم.\n\n" +
    "📧 <b>ارتباط با ما:</b>\n" +
    "• پشتیبانی: @TajEzat\n" +
    "• کانال: @ZendeBadParsi\n\n" +
    "💡 نسخه: 1.0.0",

  // Orders (سفارشات من)
  ordersTitle: "📦 سفارشات من",
  ordersEmpty:
    "شما هنوز سفارشی ندارید 📭\n\nبرای شروع خرید، به بخش محصولات بروید.",
  ordersTotal: "📊 تعداد کل سفارشات",
  ordersActive: "🔵 سفارشات فعال",
  ordersCompleted: "✅ سفارشات تکمیل شده",
  ordersSelectFilter: "لطفاً یک فیلتر را انتخاب کنید:",

  // Orders Filter Buttons
  btnOrdersFilterActive: "🔵 فعال",
  btnOrdersFilterCompleted: "✅ تکمیل شده",
  btnOrdersFilterAll: "📋 همه",

  // Orders List
  ordersActiveTitle: "🔵 سفارشات فعال",
  ordersCompletedTitle: "✅ سفارشات تکمیل شده",
  ordersAllTitle: "📋 تمام سفارشات",
  ordersSelectOne: "👆 روی یک سفارش کلیک کنید تا جزئیات آن را ببینید:",
  ordersNoActive: "شما سفارش فعالی ندارید",
  ordersNoCompleted: "شما سفارش تکمیل شده‌ای ندارید",

  // Order Details
  orderDetailsTitle: "📦 جزئیات سفارش",
  orderNumber: "شماره سفارش",
  orderProduct: "محصول",
  orderStatus: "وضعیت",
  orderTotalPrice: "قیمت اولیه",
  orderDiscount: "تخفیف",
  orderWalletUsed: "استفاده از کیف پول",
  orderFinalPrice: "قیمت نهایی",
  orderCreatedAt: "تاریخ ثبت",
  orderDeliveredAt: "تاریخ تحویل",
  orderScheduledTime: "زمان‌بندی شده",
  orderNotes: "یادداشت",

  // Order Delivery Info
  orderDeliveryInfo: "اطلاعات تحویل",
  orderDeliveryCode: "کد",
  orderDeliveryEmail: "ایمیل",
  orderDeliveryLink: "لینک",
  orderDeliveryInstructions: "دستورالعمل",

  // Order Buttons
  btnOrderOpenTicket: "💬 باز کردن تیکت",
  btnOrderRenew: "🔄 تمدید",
  btnOrderReschedule: "📅 تغییر زمان",
  btnOrderReportProblem: "⚠️ گزارش مشکل",
  btnBackToOrders: "🔙 بازگشت به سفارشات",

  // Order Actions
  orderNotFound: "سفارش یافت نشد",
  orderAccessDenied: "شما به این سفارش دسترسی ندارید",
  orderTicketComingSoon: "سیستم تیکت به زودی فعال می‌شود",
  orderNotRenewable: "این محصول قابل تمدید نیست",
  orderRenewComingSoon: "امکان تمدید به زودی فعال می‌شود",
  orderCannotReschedule: "این سفارش قابل تغییر زمان نیست",
  orderRescheduleComingSoon: "امکان تغییر زمان به زودی فعال می‌شود",
  orderReportComingSoon: "سیستم گزارش مشکل به زودی فعال می‌شود",

  // Support & Tickets
  supportMenuText:
    "💬 <b>مرکز پشتیبانی</b>\n\nچطور می‌تونیم کمکتون کنیم؟\n\n" +
    "• ارسال تیکت پشتیبانی\n" +
    "• گزارش مشکل\n" +
    "• مشاهده تیکت‌های شما",

  btnNewSupportTicket: "🎫 تیکت پشتیبانی جدید",
  btnNewReportTicket: "⚠️ گزارش مشکل",
  btnMyTickets: "📋 تیکت‌های من",
  btnViewMyTickets: "📋 مشاهده تیکت‌ها",
  btnBackToMain: "🏠 بازگشت به منوی اصلی",
  btnReplyToTicket: "💬 پاسخ",
  btnViewMessages: "💬 مشاهده پیام‌ها",
  btnBackToTickets: "🔙 بازگشت به تیکت‌ها",
  btnViewTicket: "👁️ مشاهده تیکت",
  btnViewOrder: "📦 مشاهده سفارش",

  // Ticket Creation
  ticketSupportPrompt:
    "🎫 <b>تیکت پشتیبانی جدید</b>\n\n" +
    "لطفاً سوال یا مشکل خود را به طور کامل توضیح دهید.\n" +
    "تیم پشتیبانی ما در اسرع وقت پاسخ خواهند داد.",

  ticketOrderPrompt:
    "📦 <b>مشکل سفارش</b>\n\n" +
    "لطفاً مشکل مربوط به سفارش خود را به طور کامل توضیح دهید.",

  ticketReportPrompt:
    "⚠️ <b>گزارش مشکل</b>\n\n" +
    "لطفاً مشکلی که با آن مواجه شده‌اید را به طور کامل توضیح دهید.",

  ticketMessageTooShort: "❌ لطفاً جزئیات بیشتری ارائه دهید (حداقل ۱۰ کاراکتر)",
  ticketMessageEmpty: "❌ پیام نمی‌تواند خالی باشد",

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    format`✅ <b>تیکت با موفقیت ایجاد شد!</b>\n\nشماره تیکت: ${bold(data.ticketNumber)}\n\nتیم پشتیبانی ما مطلع شده و به زودی پاسخ خواهند داد.`,

  ticketCreateError:
    "❌ ایجاد تیکت با خطا مواجه شد. لطفاً دوباره تلاش کنید یا مستقیماً با پشتیبانی تماس بگیرید.",

  ticketOrderNotFound: "❌ سفارش یافت نشد",

  // Ticket List
  ticketListTitle: "📋 <b>تیکت‌های شما</b>",
  ticketListEmpty: "📭 شما هنوز هیچ تیکتی ندارید.",
  ticketListShowingFirst10: "نمایش ۱۰ تیکت اول",
  ticketListError:
    "❌ بارگذاری تیکت‌ها با خطا مواجه شد. لطفاً دوباره تلاش کنید.",

  // Ticket Details
  ticketNotFound: "❌ تیکت یافت نشد",
  ticketNotYours: "❌ این تیکت متعلق به شما نیست",
  ticketAlreadyClosed: "🔒 این تیکت بسته شده است",
  ticketLoadError: "❌ بارگذاری تیکت با خطا مواجه شد. لطفاً دوباره تلاش کنید.",

  status: "وضعیت",
  created: "تاریخ ایجاد",
  order: "سفارش",
  messages: "پیام‌ها",
  lastMessage: "آخرین پیام",

  // Ticket Statuses
  ticketStatus_open: "🟢 باز",
  ticketStatus_waiting_user: "🟡 در انتظار پاسخ شما",
  ticketStatus_waiting_support: "🟠 در انتظار پشتیبانی",
  ticketStatus_in_progress: "🔵 در حال بررسی",
  ticketStatus_resolved: "✅ حل شده",
  ticketStatus_closed: "🔒 بسته شده",
  ticketStatus_blocked: "⛔ مسدود شده",

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    format`💬 <b>پاسخ به ${bold(data.ticketNumber)}</b>\n\nلطفاً پیام خود را تایپ کنید:`,

  ticketReplySent:
    "✅ پیام شما به پشتیبانی ارسال شد!\n\nزمانی که پاسخ دهند به شما اطلاع داده می‌شود.",

  ticketReplyError: "❌ ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.",

  ticketCreationCancelled: "❌ ایجاد تیکت لغو شد",

  // Ticket Messages
  ticketMessages: "پیام‌ها",
  ticketNoMessages: "هنوز پیامی در این تیکت وجود ندارد",
  ticketMessagesError: "❌ بارگذاری پیام‌ها با خطا مواجه شد",
  ticketShowingLast5Messages: "نمایش ۵ پیام آخر",
  you: "شما",
  support: "پشتیبانی",

  // Purchase / Order Completion
  insufficientBalance: (data: { required: string; current: string }) =>
    `❌ <b>موجودی کافی نیست</b>\n\nمبلغ مورد نیاز: <b>${data.required}</b> تومان\nموجودی شما: <b>${data.current}</b> تومان\n\nلطفاً کیف پول خود را شارژ کنید و دوباره تلاش کنید.`,
  noConfigAvailable:
    "❌ در حال حاضر کانفیگ VPN برای این پلن موجود نیست. لطفاً با پشتیبانی تماس بگیرید.",
  orderSuccess: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `✅ <b>خرید با موفقیت انجام شد!</b>\n\n` +
    `📦 محصول: ${data.productName}\n` +
    `📋 پلن: ${data.planName}\n` +
    `💰 مبلغ پرداخت شده: <b>${data.amount}</b> تومان\n` +
    `💳 موجودی باقی‌مانده: <b>${data.remainingBalance}</b> تومان\n` +
    `🆔 شماره سفارش: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `🔑 <b>کانفیگ VPN شما</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `📋 روی کانفیگ بالا تپ کنید تا کپی شود، سپس آن را در اپلیکیشن VPN وارد کنید.`,
  btnMyOrders2: "📦 سفارشات من",
  btnBackToMenu: "🏠 منوی اصلی",

  // Discount code during order flow
  enterDiscountCodeForOrder:
    "🎫 <b>افزودن کد تخفیف</b>\n\nلطفاً کد تخفیف خود را وارد کنید:\n\n" +
    "مثال: <code>SUMMER2024</code>",
  btnSkipDiscount: "⏭️ ادامه بدون کد تخفیف",
  btnRemoveDiscount: "🗑️ حذف تخفیف",
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `✅ <b>کد تخفیف اعمال شد!</b>\n\n` +
    `🎫 کد: <code>${data.code}</code>\n` +
    `💸 تخفیف: -<b>${data.discountAmount}</b> تومان\n` +
    `💰 مبلغ جدید: <b>${data.finalPrice}</b> تومان`,
  orderSummaryWithDiscount: (data: {
    productName: string;
    planName: string;
    duration: string;
    originalPrice: string;
    discountAmount: string;
    finalPrice: string;
    code: string;
  }) =>
    `📝 <b>خلاصه سفارش</b>\n\n` +
    `📦 محصول: ${data.productName}\n` +
    `📋 پلن: ${data.planName}\n` +
    (data.duration ? `⏱️ مدت: ${data.duration}\n` : "") +
    `\n💰 قیمت اصلی: <b>${data.originalPrice}</b> تومان\n` +
    `🎫 تخفیف (${data.code}): -<b>${data.discountAmount}</b> تومان\n` +
    `✅ قیمت نهایی: <b>${data.finalPrice}</b> تومان`,
  discountNotApplicableForProduct: "❌ این کد تخفیف برای این محصول معتبر نیست.",
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `❌ <b>موجودی کافی نیست</b>\n\nمبلغ مورد نیاز پس از تخفیف: <b>${data.required}</b> تومان\nموجودی شما: <b>${data.current}</b> تومان\n\nلطفاً کیف پول خود را شارژ کنید و دوباره تلاش کنید.`,

  // Force Join Channels/Groups
  joinChannelRequired:
    "📢 <b>عضویت الزامی</b>\n\nبرای استفاده از ربات، لطفاً ابتدا در کانال‌ها/گروه‌های زیر عضو شوید:",
  btnIJoined: "✅ عضو شدم — بررسی کن",
  joinChannelNotJoinedAlert:
    "❌ هنوز در همه کانال‌های مورد نیاز عضو نشده‌اید. لطفاً عضو شوید و دوباره امتحان کنید.",
} satisfies ShouldFollowLanguageStrict<typeof en>;
