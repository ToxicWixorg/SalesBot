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
    "• پشتیبانی: @YourSupportBot\n" +
    "• کانال: @YourChannel\n\n" +
    "💡 نسخه: 1.0.0",
} satisfies ShouldFollowLanguageStrict<typeof en>;
