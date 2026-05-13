import type { LanguageMap } from "@gramio/i18n";
import { e } from "./emojies";
import { normalizeCustomEmojiId } from "../utils/customEmoji.ts";
// ─── Premium Telegram Emoji IDs ────────────────────────────────────────────
// Usage: <tg-emoji emoji-id="ID">fallback</tg-emoji>

export const fa = {
  // Language Selection
  selectLanguage: `${e.earth} <b>زبان مورد نظرت رو انتخاب کن:</b>`,
  languageSelected: (lang: string) =>
    `${e.checkBold} زبان به <b>${lang}</b> تغییر یافت`,

  btnAdminPanel: "پنل ادمین",

  btnReportBug: "گزارش مشکل ربات",

  items: "ایتم ها",

  adminpanelText: (userid: number, userRole: string) =>
    `${e.id} ایدی عددی شما : <code>${userid}</code>\n` +
    `${e.user} نقش شما : <b>${userRole === "super_admin" ? "مالک" : userRole === "admin" ? "ادمین" : "پشتیبان"}</b>\n\n` +
    `${e.admin} برای تعامل از دکمه های زیر استفاده کنید:`,
  adminpanelBtnUrl: "ورود به پنل ادمین",
  adminpanelBtnEmojies: "ایدی ایموجی پرمیوم",

  // Greeting & Welcome
  greeting: (name: string) => `سلام <b>${name}</b>! ${e.sparkles}`,
  welcome: (name: string) =>
    `${e.crown} سلام <b>${name}</b>، خوش اومدی!\n\n` +
    `${e.diamond} بهترین سرویس‌های دیجیتال رو با بهترین قیمت پیدا می‌کنی اینجا.\n`,

  // Main Menu
  mainMenu: `${e.home} منوی اصلی`,
  chooseAction: "",
  main_menu: (name: string) =>
    `${e.crown} سلام <b>${name}</b>!\n\n` +
    `${e.sparkles} به فروشگاه دیجیتال ما خوش اومدی!\n\n` +
    `${e.diamond} اشتراک‌های پریمیوم، اکانت‌های هوش مصنوعی و سرویس‌های دیجیتال — همه با بهترین قیمت.\n\n` +
    `یه گزینه انتخاب کن:`,

  // Buttons
  btnProducts: `محصولات`,
  btnMyOrders: `سفارشات من`,
  btnWallet: `کیف پول`,
  btnInviteFriends: ` دعوت دوستان`,
  btnDiscountCode: ` کد تخفیف`,
  btnSupport: ` پشتیبانی`,
  btnSettings: ` تنظیمات`,
  btnBack: ` بازگشت`,
  btnCancel: `لغو`,
  btnMainMenu: ` منوی اصلی`,
  btnChangeLanguage: ` تغییر زبان`,
  btnNotifications: ` اعلان‌ها`,
  btnYes: ` بله`,
  btnNo: ` خیر`,
  btnConfirm: ` تایید`,

  // Products
  btnBuyProduct: ` خرید`,
  btnNotifyStock: ` اطلاع موجودی`,
  btnConfirmOrder: ` تایید سفارش`,
  btnAddDiscountCode: ` افزودن کد تخفیف`,
  productsTitle: `${e.bag} محصولات`,
  selectCategory: `${e.tag} یه دسته‌بندی انتخاب کن:`,
  categoryProducts: (category: string, emoji: string | null) => {
    const safeEmoji = normalizeCustomEmojiId(emoji);
    return safeEmoji
      ? `<tg-emoji emoji-id="${safeEmoji}">🛍️</tg-emoji> ` +
          `محصولات <b>${category}</b>:`
      : `${e.bag} محصولات <b>${category}</b>:`;
  },
  noProducts: `${e.reject} محصولی در این دسته موجود نیست.`,
  productDetails: `${e.bag} جزئیات محصول`,
  price: `${e.wallet} قیمت:`,
  stock: `${e.bag} موجودی:`,
  available: `${e.checkBold} موجود`,
  outOfStock: `❌ ناموجود`,
  productNotFound: `❌ محصول پیدا نشد`,
  planNotFound: `❌ پلن پیدا نشد`,
  categoryNotFound: `❌ دسته‌بندی پیدا نشد`,
  noPlansAvailable: `❌ پلنی موجود نیست`,
  insufficientBalanceAlert: `❌ موجودی کافی نیست`,
  deliveryTime: `${e.clock} زمان تحویل:`,
  deliveryType: `${e.truck} نوع تحویل:`,
  deliveryAutomatic: `${e.zap} فوری (خودکار)`,
  deliveryManual: `${e.user} دستی (۱ تا ۲۴ ساعت)`,
  deliveryCoordination: `${e.date} نیاز به هماهنگی`,
  selectPlan: `${e.clipboard} پلن مورد نظرت رو انتخاب کن:`,
  orderSummary: `${e.clipboard} خلاصه سفارش:`,
  total: `${e.wallet} جمع کل:`,
  currency: "تومان",
  oneTime: "یک‌بار",
  duration_day: "روز",
  duration_month: "ماه",
  duration_year: "سال",

  walletTitle: `${e.wallet} کیف پول`,
  walletBalance: (balance: string) =>
    `موجودی: <b>${balance}</b> تومان ` + e.Toman,
  walletEmpty: `${e.wallet} کیف پولت فعلاً خالیه ${e.sparkles} شارژش کن و شروع کن!`,
  btnRechargeWallet: ` شارژ کیف پول`,
  btnTransactionHistory: ` تاریخچه تراکنش‌ها`,

  // Wallet Recharge
  rechargeWalletTitle: `${e.card} شارژ کیف پول`,
  rechargeSelectMethod: `روش شارژ رو انتخاب کن:`,
  btnRechargeCrypto: ` پرداخت کریپتو (USDT)`,
  btnRechargeCard: ` پرداخت با کارت`,
  btnRechargeZarinpal: ` درگاه زرین‌پال`,

  rechargeEnterAmount: `${e.wallet} مبلغ شارژ رو وارد کن:`,
  rechargeMinAmount: (amount: string) =>
    `حداقل مبلغ شارژ: <b>${amount}</b> تومان ` + e.Toman,
  rechargeMaxAmount: (amount: string) =>
    `حداکثر مبلغ شارژ: <b>${amount}</b> تومان ` + e.Toman,
  rechargeInvalidAmount: `${e.reject} مبلغ وارد شده نامعتبره`,
  rechargeTooLow: (min: string) =>
    `${e.reject} مبلغ شارژ باید حداقل <b>${min}</b> تومان ${e.Toman} باشه`,
  rechargeTooHigh: (max: string) =>
    `${e.reject} مبلغ شارژ نمی‌تونه بیشتر از <b>${max}</b> تومان  ${e.Toman} باشه`,

  // Crypto Payment
  rechargeCryptoTitle: `${e.wallet} پرداخت کریپتو`,
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
  rechargeCryptoTxIdReceived: `${e.checkBold} شناسه تراکنش دریافت شد\n\n${e.time} در حال بررسی پرداخت...\nاین فرآیند ممکنه تا ۳۰ دقیقه طول بکشه.`,
  rechargeCryptoVerified: (amount: string) =>
    `${e.party} <b>پرداخت تأیید شد!</b>\n\n${e.diamond} <b>${amount}</b> تومان به کیف پولت اضافه شد.`,
  rechargeCryptoFailed: `${e.reject} پرداخت تأیید نشد. لطفاً با پشتیبانی تماس بگیر.`,

  // Card/Zarinpal Payment
  rechargeCardTitle: `${e.card} پرداخت با کارت`,
  rechargeZarinpalTitle: `${e.wallet} درگاه زرین‌پال`,
  rechargePaymentLink: (amount: string) =>
    `مبلغ: <b>${amount}</b> تومان\n\nروی دکمه زیر کلیک کن تا به درگاه پرداخت بری:`,
  btnPayNow: `پرداخت`,
  rechargePaymentPending: `${e.time} در انتظار پرداخت...\n\nلطفاً پرداخت رو در مرورگر کامل کن.`,
  rechargePaymentSuccess: (amount: string) =>
    `${e.party} <b>پرداخت موفق!</b>\n\n${e.diamond} <b>${amount}</b> تومان به کیف پولت اضافه شد.`,
  rechargePaymentFailed: `❌ پرداخت ناموفق بود. دوباره تلاش کن.`,
  rechargePaymentCancelled: `⚠️ پرداخت لغو شد.`,

  // Transaction History
  transactionHistoryTitle: `${e.chart} تاریخچه تراکنش‌ها`,
  transactionHistoryEmpty: `هنوز تراکنشی نداری — اولین خریدت رو ثبت کن!`,
  transactionType: "نوع:",
  transactionAmount: "مبلغ:",
  transactionDate: "تاریخ:",
  transactionDescription: "توضیحات:",

  // Transaction Types
  txTypeCredit: " واریز",
  txTypeDebit: " برداشت",

  // Transaction Sources
  txSourcePurchase: `${e.bag} خرید`,
  txSourceRecharge: `${e.card} شارژ`,
  txSourceRefund: `${e.wallet} بازگشت وجه`,
  txSourceReferral: `${e.gift} پاداش دعوت`,
  txSourceReward: `${e.gift} جایزه`,
  txSourcePerk: `${e.target} پاداش Perk`,
  txSourceAdminAdjustment: `${e.settings} تعدیل ادمین`,

  // ── کلیدهای جدید شارژ کیف پول ──────────────────────────
  rechargeAmount: (amount: string) =>
    `${e.wallet} مبلغ: <b>${amount}</b> تومان ` + e.Toman,
  rechargeMethodSelectTitle: (amount: string) =>
    `${e.wallet} مبلغ <b>${amount}</b> تومان ${e.Toman}\n\nروش پرداخت رو انتخاب کن:`,
  rechargeCardNumbers: `شماره کارت‌ها`,
  rechargeCardSendReceipt: `بعد از واریز مبلغ، رسید پرداخت (عکس) رو اینجا بفرست.`,
  rechargeCardExpectPhoto: `${e.reject} لطفاً عکس رسید پرداخت رو بفرست (تصویر باشه نه متن).`,
  rechargePendingApproval: `${e.checkBold} درخواستت ثبت شد!\n\n${e.time} منتظر تأیید ادمین باش — معمولاً زیر ۳۰ دقیقه.`,
  rechargeApproved: (amount: string) =>
    `${e.party} <b>شارژ تأیید شد!</b>\n\n${e.diamond} <b>${amount}</b> تومان به کیف پولت اضافه شد.`,
  rechargeRejected: `${e.reject} <b>درخواست شارژ رد شد.</b>\n\nدر صورت نیاز با پشتیبانی تماس بگیر.`,
  rechargeSessionExpired: `⚠️ جلسه منقضی شده. دوباره از کیف پول شروع کن.`,
  rechargeMethodDisabled: `❌ این روش پرداخت فعلاً غیرفعاله.`,
  rechargeNoMethodAvailable: `❌ در حال حاضر هیچ روش پرداختی فعال نیست. بعداً امتحان کن.`,
  rechargeUsdtRate: (rate: string) =>
    `📈 نرخ لحظه‌ای: <b>${rate}</b> تومان/USDT`,
  rechargeRateUnavailable: `❌ قیمت لحظه‌ای USDT در دسترس نیست. کمی صبر کن و دوباره تلاش کن.`,
  rechargeCryptoInvalidTxId: `❌ TxID نامعتبره (باید حداقل ۱۰ کاراکتر باشه). دوباره بفرست.`,
  rechargeZarinpalInstructions: `${e.clipboard} روی دکمه «پرداخت» بزن، مبلغ رو پرداخت کن، بعد دکمه «بررسی پرداخت» رو بزن.`,
  btnVerifyPayment: `بررسی پرداخت`,
  rechargeZarinpalVerifying: `⌛ در حال بررسی پرداخت...`,
  rechargeZarinpalSuccess: (amount: string) =>
    `${e.party} <b>پرداخت تأیید شد!</b>\n\n${e.diamond} <b>${amount}</b> تومان به کیف پولت اضافه شد.`,
  rechargeZarinpalFailed: `${e.reject} پرداخت تأیید نشد یا هنوز ثبت نشده.`,
  rechargeZarinpalRetry: `دوباره پرداخت کن یا دوباره بررسی کن.`,

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
    `${e.user} دعوت‌های موفق: <b>${data.totalReferrals}</b>\n` +
    `${e.diamond} مجموع پاداش‌ها: <b>${data.totalRewards}</b> تومان\n\n` +
    `🔗 <b>لینک اختصاصی تو:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `${e.sparkles} <b>چطور کار می‌کنه؟</b>\n` +
    `۱. لینکت رو برای دوستات بفرست\n` +
    `۲. وقتی عضو شدن، پاداش می‌گیری\n` +
    `۳. پاداش مستقیم به کیف پولت واریز می‌شه\n\n` +
    `${e.diamond} پاداش هر دعوت: <b>۱۰٬۰۰۰</b> تومان`,
  btnShareInviteLink: ` اشتراک‌گذاری لینک`,
  btnCopyLink: ` کپی لینک`,
  btnViewReferrals: ` لیست دعوت‌شدگان`,
  inviteShareText: `${e.gift} با این لینک عضو شو و تخفیف ویژه بگیر!`,
  inviteLinkCopied: (link: string) =>
    `✅ لینک کپی شد!\n\nاین لینک رو برای دوستات بفرست.`,
  noReferralsYet: `👤 هنوز کسی رو دعوت نکردی — شروع کن و درآمد داشته باش!`,
  referralListTitle: `${e.user} <b>لیست دعوت‌شدگان</b>`,
  andMore: (count: number) => `و <b>${count}</b> نفر دیگه...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `${e.party} کاربر جدیدی (<b>${data.userName}</b>) از لینک دعوت تو پیوست!\n` +
    `${e.diamond} <b>${data.amount}</b> تومان به حسابت اضافه شد.`,

  // Discount Codes
  discountCodeInfo:
    `${e.gift} <b>کد تخفیف</b>\n\n` +
    `با کدهای تخفیف، قیمت خریدت رو پایین بیار.\n\n` +
    `می‌تونی هنگام خرید کد بزنی یا از اینجا اعتبارش رو چک کنی.`,
  btnEnterDiscountCode: ` وارد کردن کد تخفیف`,
  btnDiscountHistory: ` تاریخچه استفاده`,
  enterDiscountCodePrompt: `${e.pencil} کد تخفیفت رو وارد کن:\n\nمثال: <code>SUMMER2024</code>`,
  btnTryAgain: ` تلاش دوباره`,
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `${e.checkBold} <b>کد تخفیف معتبره!</b>\n\n` +
    `${e.ticket} کد: <code>${data.code}</code>\n` +
    `${e.tag} نوع: ${data.type}\n` +
    `${e.diamond} مقدار: ${data.value}\n` +
    `${e.clipboard} توضیحات: ${data.description}\n\n` +
    `این کد رو هنگام خرید استفاده کن.`,
  discountCodeInvalid: (reason: string) =>
    `${e.reject} <b>کد تخفیف نامعتبره</b>\n\n${reason}`,
  discountTypePercentage: "درصدی",
  discountTypeFixed: "مبلغ ثابت",
  noDescription: "بدون توضیحات",
  noDiscountHistory: `📅 هنوز از هیچ کد تخفیفی استفاده نکردی — اولین باری رو ثبت کن!`,
  discountHistoryTitle: `${e.chart} <b>تاریخچه کدهای تخفیف</b>`,
  discountAmount: "مقدار تخفیف",
  orderId: "شماره سفارش",

  // Settings
  userNotFound: `❌ کاربر پیدا نشد`,
  userIdentificationError: `❌ خطا در شناسایی کاربر`,
  settingsTitle: `${e.settings} تنظیمات`,
  settingsDescription: `${e.info} از اینجا می‌تونی حسابت رو مدیریت کنی.`,
  btnAccountInfo: `اطلاعات حساب`,
  btnNotificationSettings: `تنظیمات اعلان‌ها`,
  btnPrivacy: ` حریم خصوصی`,
  btnAbout: `ℹ درباره ما`,

  // Account Info
  accountInfoTitle: `${e.user} اطلاعات حساب`,
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
    `${e.user} نام‌کاربری: ${data.username ? `@${data.username}` : "ندارد"}\n` +
    `${e.tag} نام: ${data.firstName}\n` +
    `${e.date} عضویت: ${data.joinDate}\n\n` +
    `${e.chart} <b>آمار:</b>\n` +
    `${e.bag} خریدها: <b>${data.totalOrders}</b>\n` +
    `${e.diamond} مجموع خرید: <b>${data.totalSpent}</b> تومان\n` +
    `${e.user} دعوت‌ها: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: `${e.bell} تنظیمات اعلان‌ها`,
  notificationSettingsDescription: `${e.info} انتخاب کن کدوم اعلان‌ها رو دریافت کنی:`,
  btnToggleOrderNotifications: (enabled: boolean) => `اعلان سفارشات`,
  btnToggleWalletNotifications: (enabled: boolean) => ` اعلان کیف پول`,
  btnTogglePromotionNotifications: (enabled: boolean) => `اعلان تخفیفات`,
  btnToggleReferralNotifications: (enabled: boolean) => `اعلان دعوت دوستان`,
  btnToggleStockNotifications: (enabled: boolean) => ` اعلان موجودی محصولات`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? `${e.checkBold} فعال شد` : `${e.reject} غیرفعال شد`}: ${type}`,
  allNotificationsEnabled: `${e.checkBold} همه اعلان‌ها فعالن`,
  allNotificationsDisabled: `${e.reject} همه اعلان‌ها غیرفعالن`,

  // Privacy
  privacyTitle: `${e.lock} حریم خصوصی`,
  privacyDescription: `${e.shield} مدیریت داده‌های شخصی:`,
  btnClearHistory: ` پاک کردن تاریخچه`,
  btnDeleteAccount: `حذف حساب`,
  btnExportData: ` دریافت اطلاعات من`,
  clearHistoryConfirm:
    `${e.warning} <b>مطمئنی؟</b>\n\n` +
    `تاریخچه‌ات پاک می‌شه — این عمل برگشت نداره.`,
  clearHistorySuccess: `${e.checkBold} تاریخچه با موفقیت پاک شد.`,
  clearHistoryCancelled: `${e.reject} عملیات لغو شد.`,
  deleteAccountConfirm:
    `${e.warning} <b>هشدار!</b>\n\n` +
    `مطمئنی می‌خوای حسابت رو حذف کنی؟\n\n` +
    `${e.reject} تمام موارد زیر <b>برای همیشه</b> پاک می‌شن:\n` +
    `• سفارشات\n• کیف پول\n• دعوت‌ها\n\n` +
    `این عمل <b>غیرقابل بازگشته</b>!`,
  deleteAccountSuccess: `${e.checkBold} حسابت حذف شد.\n\nامیدواریم دوباره ببینیمت!`,
  deleteAccountCancelled: `${e.checkBold} حسابت حذف نشد.`,
  exportDataProcessing: `در حال آماده‌سازی اطلاعاتت...`,
  exportDataReady: `${e.checkBold} اطلاعاتت آماده‌ست!`,

  // About
  aboutTitle: `${e.info} درباره ما`,
  aboutDescription:
    `${e.robot} <b>ربات فروش سرویس‌های دیجیتال</b>\n\n` +
    `${e.diamond} بهترین سرویس‌ها با بهترین قیمت و سریع‌ترین تحویل.\n\n` +
    `${e.bag} کیفیت تضمین شده ${e.confirm}.\n\n` +
    `${e.mail} <b>ارتباط با ما:</b>\n` +
    `• پشتیبانی: @r4m_m\n` +
    `${e.tag} نسخه: 2.3.5`,

  ordersTitle: `${e.bag} سفارشات من`,
  ordersEmpty: `🛍️ هنوز سفارشی ثبت نکردی!\n\nبرو سراغ محصولات و اولین خریدت رو بزن.`,
  ordersTotal: `${e.chart} کل سفارشات`,
  ordersActive: `${e.active} سفارشات فعال`,
  ordersCompleted: `${e.complete} سفارشات تکمیل‌شده`,
  ordersSelectFilter: `یه فیلتر انتخاب کن:`,

  // Orders Filter Buttons
  btnOrdersFilterActive: `فعال`,
  btnOrdersFilterCompleted: `تکمیل‌شده`,
  btnOrdersFilterAll: `همه`,

  // Orders List
  ordersActiveTitle: `${e.active} سفارشات فعال`,
  ordersCompletedTitle: `${e.complete} سفارشات تکمیل‌شده`,
  ordersAllTitle: `${e.clipboard} تمام سفارشات`,
  ordersSelectOne: `${e.pin} روی یه سفارش کلیک کن تا جزئیاتش رو ببینی:`,
  ordersOrderLabel: (data: { orderId: number }) => `سفارش #${data.orderId}`,
  ordersProductFallback: `محصول`,
  ordersDeliveredLabel: `تحویل`,
  ordersNoActive: `ℹ️ هیچ سفارش فعالی نداری`,
  ordersNoCompleted: `ℹ️ هیچ سفارش تکمیل‌شده‌ای نداری`,

  // Order Details
  orderDetailsTitle: `${e.clipboard} جزئیات سفارش`,
  orderNumber: `${e.id} شماره سفارش`,
  orderProduct: e.bag + " محصول",
  orderStatus: "وضعیت",
  orderTotalPrice: e.wallet + " قیمت اولیه",
  orderDiscount: e.gift + " تخفیف",
  orderWalletUsed: e.card + " کیف پول",
  orderFinalPrice: e.confirm + " قیمت نهایی",
  orderCreatedAt: e.date + " تاریخ ثبت",
  orderDeliveredAt: e.date + " تاریخ تحویل",
  orderScheduledTime: e.time + " زمان‌بندی",
  orderNotes: e.note + " یادداشت",

  // Order Delivery Info
  orderDeliveryInfo: "اطلاعات تحویل",
  orderDeliveryCode: "کد",
  orderDeliveryEmail: "ایمیل",
  orderDeliveryLink: "لینک",
  orderDeliveryInstructions: "دستورالعمل",
  orderDeliveryInfoNotProvided: "اطلاعات تحویل ثبت نشده است.",

  // Order Statuses
  orderStatus_pending_payment: "در انتظار تایید پرداخت",
  orderStatus_paid: "پرداخت شده",
  orderStatus_pending_admin: "در انتظار بررسی",
  orderStatus_waiting_schedule: "نیاز به انتخاب زمان",
  orderStatus_scheduled: "زمان‌بندی شده",
  orderStatus_reminder_sent: "یادآوری ارسال شد",
  orderStatus_waiting_user_online: "در انتظار حضور شما",
  orderStatus_user_not_responding: "پاسخ داده نشده",
  orderStatus_waiting_invite: "در انتظار ارسال دعوتنامه",
  orderStatus_invite_sent: "دعوتنامه ارسال شد",
  orderStatus_waiting_user_action: "نیاز به اقدام شما",
  orderStatus_join_link_sent: "لینک Join ارسال شد",
  orderStatus_in_queue: "در صف انتظار",
  orderStatus_in_progress: "در حال انجام",
  orderStatus_active: "فعال",
  orderStatus_expiring_soon: "نزدیک به پایان",
  orderStatus_completed: "تکمیل شده",
  orderStatus_cancelled: "لغو شده",
  orderStatus_refunded: "بازگشت وجه",
  orderStatus_failed: "ناموفق",
  orderStatus_rescheduled: "زمان تغییر کرد",
  orderStatus_unknown: (data: { status: string }) => data.status,

  // Order Buttons
  btnOrderOpenTicket: `باز کردن تیکت`,
  btnOrderRenew: `تمدید`,
  btnOrderReschedule: `تغییر زمان`,
  btnOrderReportProblem: `گزارش مشکل`,
  btnBackToOrders: `بازگشت به سفارشات`,

  // Order Actions
  orderNotFound: "سفارش پیدا نشد",
  orderAccessDenied: "دسترسی به این سفارش مجاز نیست",
  orderTicketComingSoon: "سیستم تیکت به‌زودی فعال می‌شه",
  orderNotRenewable: "این محصول قابل تمدید نیست",
  orderRenewComingSoon: "امکان تمدید به‌زودی فعال می‌شه",
  orderCannotReschedule: "این سفارش قابل تغییر زمان نیست",
  orderRescheduleComingSoon: "امکان تغییر زمان به‌زودی فعال می‌شه",
  orderReportComingSoon: "سیستم گزارش مشکل به‌زودی فعال می‌شه",
  errorFetchingOrders: `❌ خطا در دریافت سفارشات`,
  errorFetchingOrderDetails: `❌ خطا در دریافت جزئیات سفارش`,
  errorReschedulingOrder: `❌ خطا در تغییر زمان`,
  errorRenewingOrder: `❌ خطا در تمدید سفارش`,
  renewScreenTitle: "🔄 تمدید سرویس",
  renewWalletSuccess: (data: {
    orderId: number;
    productName: string;
    remainingBalance: string;
  }) =>
    `${e.confirm} <b>تمدید با موفقیت انجام شد!</b>\n\n` +
    `${e.bag} ${data.productName}\n` +
    `${e.ticket} شماره سفارش: #${data.orderId}\n\n` +
    `${e.wallet} موجودی باقی‌مانده: ${data.remainingBalance} تومان`,
  errorOpeningTicket: `❌ خطا در باز کردن تیکت`,
  errorReportingProblem: `❌ خطا در گزارش مشکل`,

  // Support & Tickets
  supportMenuText:
    `${e.chat} <b>مرکز پشتیبانی</b>\n\nچطور می‌تونم کمکت کنم؟\n\n` +
    `• ارسال تیکت پشتیبانی\n` +
    `• گزارش مشکل\n` +
    `• مشاهده تیکت‌ها`,

  btnNewSupportTicket: `تیکت جدید`,
  btnNewReportTicket: `گزارش مشکل`,
  btnMyTickets: `تیکت‌های من`,
  btnViewMyTickets: `مشاهده تیکت‌ها`,
  btnBackToMain: `منوی اصلی`,
  btnReplyToTicket: `پاسخ`,
  btnViewMessages: `مشاهده پیام‌ها`,
  btnBackToTickets: `بازگشت به تیکت‌ها`,
  btnViewTicket: `مشاهده تیکت`,
  btnViewOrder: `مشاهده سفارش`,

  // Ticket Creation
  ticketSupportPrompt:
    `${e.chat} <b>تیکت پشتیبانی جدید</b>\n\n` +
    `سوال یا مشکلت رو کامل توضیح بده.\n` +
    `تیم ما در اسرع وقت جواب می‌ده.`,

  ticketOrderPrompt:
    `${e.chat} <b>مشکل سفارش</b>\n\n` +
    `مشکل مربوط به سفارشت رو کامل توضیح بده.`,

  ticketReportPrompt:
    `${e.warning} <b>گزارش مشکل</b>\n\n` +
    `مشکلی که باهاش مواجه شدی رو کامل توضیح بده.`,

  ticketMessageTooShort: `${e.reject} لطفاً بیشتر توضیح بده (حداقل ۱۰ کاراکتر)`,
  ticketMessageEmpty: `${e.reject} پیام نمی‌تونه خالی باشه`,

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    `${e.checkBold} <b>تیکت ایجاد شد!</b>\n\nشماره تیکت: <b>${data.ticketNumber}</b>\n\nتیم پشتیبانی ما مطلع شدن و به‌زودی جواب می‌دن.`,

  ticketCreateError: `❌ ایجاد تیکت با خطا مواجه شد. دوباره امتحان کن یا مستقیم با پشتیبانی تماس بگیر.`,

  ticketOrderNotFound: `❌ سفارش پیدا نشد`,

  // Ticket List
  ticketListTitle: `${e.clipboard} <b>تیکت‌های تو</b>`,
  ticketListEmpty: `${e.chat} هنوز هیچ تیکتی نداری — نگرانی؟ تیکت باز کن!\nبرای تیکت زدن به بخش <b>سفارشات من</b> برو و برای سفارشت مورد نظرت تیکت به پشتیبانی بزن`,
  ticketListShowingFirst10: "نمایش ۱۰ تیکت اول",
  ticketListError: `❌ بارگذاری تیکت‌ها با خطا مواجه شد. دوباره تلاش کن.`,

  // Ticket Details
  ticketNotFound: `❌ تیکت پیدا نشد`,
  ticketNotYours: `❌ این تیکت مال تو نیست`,
  ticketAlreadyClosed: `🔒 این تیکت بسته‌ست`,
  waitForAdminReply: `صبر کنید تا ادمین به تیکت قبلی شما پاسخ بدهد`,
  ticketLoadError: `❌ بارگذاری تیکت با خطا مواجه شد. دوباره تلاش کن.`,

  status: "وضعیت",
  created: "تاریخ ایجاد",
  order: "سفارش",
  messages: "پیام‌ها",
  lastMessage: "آخرین پیام",

  // Ticket Statuses
  ticketStatus_open: `${e.active} باز`,
  ticketStatus_waiting_user: `${e.pending} در انتظار پاسخ تو`,
  ticketStatus_waiting_support: `${e.admin} در انتظار پشتیبانی`,
  ticketStatus_in_progress: `${e.pending} در حال بررسی`,
  ticketStatus_resolved: `${e.checkBold} حل شده`,
  ticketStatus_closed: `${e.lock} بسته شده`,
  ticketStatus_blocked: `${e.failed} مسدود شده`,

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    `${e.chat} <b>پاسخ به ${data.ticketNumber}</b>\n\nپیامت رو تایپ کن:`,

  ticketReplySent: `${e.checkBold} پیامت ارسال شد!\n\nوقتی جواب بیاد بهت اطلاع می‌دم.`,

  ticketReplyError: `❌ ارسال پیام با خطا مواجه شد. دوباره تلاش کن.`,

  ticketCreationCancelled: `${e.reject} ایجاد تیکت لغو شد`,

  // Ticket Messages
  ticketMessages: "پیام‌ها",
  ticketNoMessages: "هنوز پیامی در این تیکت نیست",
  ticketMessagesError: `⚠️ بارگذاری پیام‌ها با خطا مواجه شد`,
  ticketShowingLast5Messages: "نمایش ۵ پیام آخر",
  you: "تو",
  support: "پشتیبانی",

  // Purchase / Order Completion
  insufficientBalance: (data: { required: string; current: string }) =>
    `${e.failed} موجودی کافی نیست\n\nنیاز: ${data.required} تومان\nموجودی تو: ${data.current} تومان\n\nکیف پولت رو شارژ کن و دوباره تلاش کن.`,
  noConfigAvailable: `${e.reject} در حال حاضر کانفیگ VPN برای این پلن موجود نیست. با پشتیبانی تماس بگیر.`,
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
    `${e.diamond} مبلغ: <b>${data.amount}</b> تومان\n` +
    `${e.wallet} موجودی باقی: <b>${data.remainingBalance}</b> تومان\n` +
    `${e.id} سفارش: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `${e.key} <b>کانفیگ VPN تو</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `روی کانفیگ بالا تپ کن تا کپی بشه، بعد توی اپ VPN وارد کن.`,
  btnMyOrders2: `سفارشات من`,
  btnBackToMenu: `منوی اصلی`,

  // Discount code during order flow
  enterDiscountCodeForOrder: `${e.ticket} <b>افزودن کد تخفیف</b>\n\nکد تخفیفت رو وارد کن:\n\nمثال: <code>SUMMER2024</code>`,
  btnSkipDiscount: `بدون کد تخفیف ادامه بده`,
  btnRemoveDiscount: `حذف تخفیف`,
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `${e.checkBold} <b>کد تخفیف اعمال شد!</b>\n\n` +
    `${e.ticket} کد: <code>${data.code}</code>\n` +
    `${e.diamond} تخفیف: -<b>${data.discountAmount}</b> تومان\n` +
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
  discountNotApplicableForProduct: `${e.reject} این کد تخفیف برای این محصول معتبر نیست.`,
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `${e.reject} <b>موجودی کافی نیست</b>\n\nنیاز (بعد تخفیف): <b>${data.required}</b> تومان\nموجودی تو: <b>${data.current}</b> تومان\n\nکیف پولت رو شارژ کن.`,

  // Force Join Channels/Groups
  joinChannelRequired: `${e.flag_ir} <b>عضویت الزامی</b>\n\nبرای استفاده از ربات، اول توی کانال‌ها/گروه‌های زیر عضو بشو:`,
  btnIJoined: `عضو شدم — بررسی کن`,
  joinChannelNotJoinedAlert: `🔒 هنوز توی همه کانال‌های لازم عضو نشدی. عضو بشو و دوباره امتحان کن.`,

  // ── فلوی سفارش دستی / زمان‌بندی‌شده ──────────────────────────────────────
  manualOrderInfoRequired: `${e.clipboard} <b>اطلاعات مورد نیاز</b>\n\nبرای پردازش سفارشت، اطلاعات زیر رو وارد کن:`,
  manualOrderStep: (data: { current: number; total: number }) =>
    `${e.pin} مرحله ${data.current} از ${data.total}`,
  manualOrderEmailPrompt: `${e.mail} <b>آدرس ایمیل</b> اکانت رو وارد کن:`,
  manualOrderPasswordPrompt: `${e.lock} <b>رمز عبور</b> اکانت رو وارد کن:\n\n مطمئن شوید ایمیل رو رمز درست و معتبر باشند تا در فرایند سفارش مشکلی ایجاد نشود با تشکر.`,
  manualOrderLoginUsernamePrompt: `${e.user} <b>نام کاربری</b> اکانت رو وارد کن:`,
  manualOrderLoginPasswordPrompt: `${e.lock} <b>رمز عبور</b> اکانت رو وارد کن:`,
  manualOrderRegionPrompt: `${e.earth} <b>منطقه مورد نظر</b> رو وارد کن (مثلاً: US، EU، Asia):`,
  manualOrderNeedsLabel: "اطلاعات مورد نیاز",
  adminOrderEmail: `${e.mail} ایمیل`,
  adminOrderEmailPassword: `${e.key} رمز ایمیل`,
  adminOrderUsername: `${e.user} نام کاربری`,
  adminOrderLoginPassword: e.lock + " رمز عبور",
  adminOrderRegion: e.earth + " منطقه",
  adminOrderPayment: e.card + " پرداخت",
  adminOrderScheduled: e.date + " زمان‌بندی",
  selectRegion: `${e.earth} <b>انتخاب منطقه</b>\n\nمنطقه مورد نظرت رو انتخاب کن:`,
  selectedRegion: "منطقه انتخاب‌شده",
  orderInfoReviewTitle: `${e.clipboard} <b>بررسی اطلاعات سفارش</b>`,
  orderInfoReviewPrompt: "اطلاعات زیر رو تأیید کن یا ویرایش کن:",
  btnConfirmInfo: `تایید و ادامه`,
  paymentSummaryTitle: `${e.wallet} <b>پرداخت سفارش</b>`,
  paymentPrompt: "برای تکمیل خرید، روش پرداخت رو انتخاب کن:",
  paymentOriginalPrice: "قیمت اصلی",
  paymentDiscount: "تخفیف",
  paymentFinalPrice: "قیمت نهایی",
  paymentWalletBalance: "موجودی کیف پول",
  btnPayWallet: `پرداخت از کیف پول`,
  btnPayCard: `پرداخت با کارت`,
  btnPayZarinpal: `درگاه زرین‌پال`,
  btnPayCrypto: `پرداخت با USDT (کریپتو)`,
  payCardInstructions: (data: { amount: string }) =>
    `${e.card} <b>پرداخت با کارت بانکی</b>\n\n` +
    `${e.wallet} مبلغ: <b>${data.amount}</b> تومان\n\n` +
    `شماره کارت‌های زیر رو کپی کن و مبلغ رو واریز کن:`,
  payCardConfirmNote: `پس از واریز، دکمه «${e.confirm} واریز کردم» رو بزن.`,
  btnConfirmCardPayment: `واریز کردم`,
  payCardPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>سفارش ثبت شد!</b>\n\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.time} پس از تأیید واریز توسط ادمین، سفارشت پردازش می‌شه.\n` +
    `معمولاً ظرف <b>۱ تا ۲۴ ساعت</b> تأیید می‌شه.`,
  payCryptoConfirmNote: `پس از انجام تراکنش، دکمه «${e.confirm} پرداخت کردم» رو بزن.`,
  btnConfirmCryptoPayment: `پرداخت کردم`,
  payCryptoPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>سفارش ثبت شد!</b>\n\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.time} پس از تأیید تراکنش توسط ادمین، سفارشت پردازش می‌شه.\n` +
    `معمولاً ظرف <b>۳۰ دقیقه تا ۲ ساعت</b> تأیید می‌شه.`,
  btnCancelManualOrder: `لغو سفارش`,
  manualOrderCancelled: `${e.reject} سفارش لغو شد.`,
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
    `${e.diamond} مبلغ: <b>${data.amount}</b> تومان\n` +
    `${e.wallet} موجودی باقی: <b>${data.remainingBalance}</b> تومان\n` +
    `${e.id} سفارش: #${data.orderId}\n\n` +
    `${e.time} سفارشت به تیم ما رسید.\n` +
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
    `${e.date} <b>انتخاب بازه زمانی</b>\n\nیه بازه آزاد برای <b>${data.date}</b> انتخاب کن:\n\n${e.checkBold} = آزاد  |  ${e.reject} = پر`,
  scheduleSlotFree: "جای خالی",
  scheduleSlotFullAlert: `❌ این بازه پر شد. بازه دیگه‌ای انتخاب کن.`,
  scheduleNoSlotsToday:
    `${e.reject} <b>بازه‌ای موجود نیست</b>\n\n` +
    `متأسفم، امروز هیچ بازه زمانی آزادی برای این محصول وجود نداره.\n` +
    `فردا دوباره تلاش کن یا با پشتیبانی تماس بگیر.`,
  schedulePickDay: `${e.date} لطفاً روز هفته‌ای رو که می‌خوای انتخاب کن:`,
  schedulePickDayNoSlots: `${e.reject} متأسفم، هیچ روزی با بازه زمانی فعال وجود نداره.`,
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
    `${e.date} تاریخ: <b>${data.date}</b>\n` +
    `${e.clock} ساعت: <b>${data.timeSlot}</b>\n` +
    `${e.diamond} مبلغ: <b>${data.amount}</b> تومان\n` +
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

  // Blocked user
  userBlocked:
    `${e.failed} <b>دسترسی شما محدود شده</b>\n\n` +
    `حساب شما توسط مدیریت مسدود شده. در صورت وجود اشتباه با پشتیبانی تماس بگیرید.`,
  userBlockedWithReason: (reason: string) =>
    `${e.failed} <b>دسترسی شما محدود شده</b>\n\n` +
    `${e.note} دلیل: ${reason}\n\n` +
    `در صورت وجود اشتباه با پشتیبانی تماس بگیرید.`,

  // Maintenance mode
  botMaintenance:
    `${e.fixing} <b>ربات موقتاً در دسترس نیست</b>\n\n` +
    `در حال تعمیر یا بهروزرسانی هستیم. یکم کم برمیگردیم. ممنون صبرت هستیم ༉`,
  botMaintenanceCustom: (msg: string) => `${e.fixing} ${msg}`,

  // Feature disabled messages
  referralDisabled: `${e.lock} <b>سیستم رفرال غیرفعال است</b>\n\nدر حال حاضر برنامه دعوت از دوستان موقتاً غیرفعال شده است.`,
  shopDisabled: `${e.lock} <b>فروشگاه غیرفعال است</b>\n\nدر حال حاضر فروشگاه موقتاً غیرفعال شده است. لطفاً بعداً دوباره امتحان کنید.`,

  // ── Stock notification ──────────────────────────────────────────────────────
  stockSubscribed: `🔔 موجود شد بهت خبر می‌دیم!`,
  stockAlreadySubscribed: `✅ قبلاً ثبت‌نام کردی. وقتی موجود شه خبر می‌دیم.`,
  stockRestocked: (data: { productName: string }) =>
    `${e.party} <b>موجودی شارژ شد!</b>\n\n${e.bag} ${data.productName} دوباره موجوده.\n\n🛍 همین الان خرید کن!`,

  // ── Inventory order flow ──────────────────────────────────────────────────
  enterQuantityPrompt: (available: number) =>
    `${e.truck} تعداد موجود : ${available}\n` +
    `${e.trolley} تعداد موردنظر خودتون برای خرید رو به عدد وارد کنید:`,
  enterQuantityHint: `${e.warning} فقط عدد وارد کنید`,
  quantityInvalid: `${e.reject} تعداد وارد شده معتبر نیست. لطفاً یک عدد مثبت وارد کنید.`,
  quantityExceedsStock: (data: { stock: number }) =>
    `${e.reject} موجودی کافی نیست. موجودی فعلی: <b>${data.stock}</b> عدد`,
  quantityExceedsLimit: (data: { max: number }) =>
    `${e.reject} حداکثر <b>${data.max}</b> عدد در هر سفارش می‌توانید خریداری کنید.`,
  warrantyDays: (data: { days: number }) => `گارانتی: <b>${data.days} روز</b>`,
  termsTitle: `قوانین و شرایط`,
  btnChangeQuantity: `تغییر تعداد`,
  inventoryOrderSummary: (data: {
    productName: string;
    qty: number;
    unitPrice: string;
    total: string;
    currency: string;
  }) =>
    `${e.clipboard} <b>خلاصه سفارش</b>\n\n` +
    `${e.bag} محصول: <b>${data.productName}</b>\n` +
    `${e.trolley} تعداد: <b>${data.qty}</b>\n` +
    `${e.wallet} قیمت واحد: <b>${data.unitPrice} ${data.currency}</b>\n` +
    `${e.card} مبلغ نهایی: <b>${data.total} ${data.currency}</b>`,
  inventoryOrderSuccess: (data: {
    orderId: number;
    productName: string;
    qty: number;
    total: string;
    remainingBalance: string;
    currency: string;
  }) =>
    `${e.party} <b>سفارش با موفقیت انجام شد!</b>\n\n` +
    `${e.bag} محصول: <b>${data.productName}</b>\n` +
    `${e.trolley} تعداد: <b>${data.qty}</b>\n` +
    `${e.card} مبلغ پرداخت شده: <b>${data.total} ${data.currency}</b>\n` +
    `${e.wallet} موجودی باقی‌مانده: <b>${data.remainingBalance} ${data.currency}</b>\n` +
    `${e.id} شماره سفارش: #${data.orderId}`,
  inventoryDeliveryHeader: (data: { productName: string }) =>
    `${e.key} <b>تحویل: ${data.productName}</b>`,

  inventoryDeliveryItem: (data: { index: number; content: string }[]) =>
    `${e.fire} با تشکر از خرید شما دوست عزیز \n\n` +
    `${e.bag} سفارش شما آماده \n\n` +
    data.map((item) => `<b>#${item.index}</b>\n${item.content}`).join("\n\n") +
    `${e.truck} باز هم یه فروشگاه ما سر بزنید \n` +
    `${e.sparkles} مشتاقانه منتظر شما هستیم `,

  adminConfirmrechargeMsg: (
    userLabel: string,
    opts: any,
    formatNum: (num: number) => string,
    methodLabel: string,
  ) =>
    `${e.Toman} <b>درخواست شارژ کیف پول</b>\n\n` +
    `${e.user} کاربر: ${userLabel} (<code>${opts.userId}</code>)\n` +
    `${e.wallet} مبلغ: <b>${formatNum(opts.amount)}</b> تومان\n` +
    `${e.key} روش: ${methodLabel}\n`,
  regionNotFound: "ریجن پیدا نشد ❌",
  rechargeCardSaveFailed: e.warning + "خطا در ذخیره فایل",
  ticketWaitingAdmin: `❌ در انتظار پاسخ مدیر به آخرین پیام شما`,
  youCannotReplyToThisTicket: `❌ نمی‌تونی به این تیکت پاسخ بدی`,
} satisfies LanguageMap;
