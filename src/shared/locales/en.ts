import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { e } from "./emojies";
import type { fa } from "./fa";

export const en = {
  // Language Selection
  selectLanguage: `${e.earth} <b>Select your preferred language:</b>`,
  languageSelected: (lang: string) =>
    `${e.checkBold} Language changed to <b>${lang}</b>`,

  btnAdminPanel: "Admin panel",

  adminpanelText: (userid: number, userRole: string) =>
    `${e.id} Your userid : <code>${userid}</code>\n` +
    `${e.user} Your Role : <b>${userRole === "super_admin" ? "Owner" : userRole === "admin" ? "Admin" : "Support"}</b>\n\n` +
    `${e.admin} Use bottons below:`,
  adminpanelBtnUrl: "Enter admin panel",
  adminpanelBtnEmojies: "Premium emoji id",
  // Greeting & Welcome
  greeting: (name: string) => `Hello <b>${name}</b>! ${e.sparkles}`,
  welcome: (name: string) =>
    `${e.crown} Hello <b>${name}</b>, welcome!\n\n` +
    `${e.diamond} Find the best digital services at the best prices here.\n`,

  // Main Menu
  mainMenu: `${e.home} Main Menu`,
  chooseAction: "",
  main_menu: (name: string) =>
    `${e.crown} Hello <b>${name}</b>!\n\n` +
    `${e.sparkles} Welcome to our digital store!\n\n` +
    `${e.diamond} Premium subscriptions, AI accounts, and digital services — all at the best prices.\n\n` +
    `Choose an option:`,

  // Buttons
  btnProducts: `Products`,
  btnMyOrders: `My Orders`,
  btnWallet: `Wallet`,
  btnInviteFriends: ` Invite Friends`,
  btnDiscountCode: ` Discount Code`,
  btnSupport: ` Support`,
  btnSettings: ` Settings`,
  btnBack: ` Back`,
  btnCancel: ` Cancel`,
  btnMainMenu: ` Main Menu`,
  btnChangeLanguage: ` Change Language`,
  btnNotifications: ` Notifications`,
  btnYes: ` Yes`,
  btnNo: ` No`,
  btnConfirm: ` Confirm`,

  // Products
  btnBuyProduct: ` Buy`,
  btnNotifyStock: ` Notify Me`,
  btnConfirmOrder: ` Confirm Order`,
  btnAddDiscountCode: ` Add Discount Code`,
  productsTitle: `${e.bag} Products`,
  selectCategory: `${e.tag} Select a category:`,
  categoryProducts: (category: string, emoji: string) =>
    emoji === ""
      ? e.bag
      : `<tg-emoji emoji-id="${emoji}">🛍️</tg-emoji> ` +
        `<b>${category}</b> products:`,
  noProducts: `${e.reject} No products available in this category.`,
  productDetails: `${e.bag} Product Details`,
  price: `${e.wallet} Price:`,
  stock: `${e.bag} Stock:`,
  available: `${e.checkBold} Available`,
  outOfStock: `❌ Out of Stock`,
  productNotFound: `❌ Product not found`,
  planNotFound: `❌ Plan not found`,
  categoryNotFound: `❌ Category not found`,
  noPlansAvailable: `❌ No plans available`,
  insufficientBalanceAlert: `❌ Insufficient balance`,
  deliveryTime: `${e.clock} Delivery Time:`,
  deliveryType: `${e.truck} Delivery Type:`,
  deliveryAutomatic: `${e.zap} Instant (Automatic)`,
  deliveryManual: `${e.user} Manual (1 to 24 hours)`,
  deliveryCoordination: `${e.date} Requires coordination`,
  selectPlan: `${e.clipboard} Select your preferred plan:`,
  orderSummary: `${e.clipboard} Order Summary:`,
  total: `${e.wallet} Total:`,
  currency: "Toman",
  oneTime: "One-time",
  duration_day: "Day",
  duration_month: "Month",
  duration_year: "Year",

  walletTitle: `${e.wallet} Wallet`,
  walletBalance: (balance: string) =>
    `Balance: <b>${balance}</b> Toman ` + e.Toman,
  walletEmpty: `${e.wallet} Your wallet is currently empty ${e.sparkles} Top it up and get started!`,
  btnRechargeWallet: ` Top Up Wallet`,
  btnTransactionHistory: ` Transaction History`,

  // Wallet Recharge
  rechargeWalletTitle: `${e.card} Wallet Top-up`,
  rechargeSelectMethod: `Choose a top-up method:`,
  btnRechargeCrypto: ` Crypto Payment (USDT)`,
  btnRechargeCard: ` Card Payment`,
  btnRechargeZarinpal: ` Zarinpal Gateway`,

  rechargeEnterAmount: `${e.wallet} Enter top-up amount:`,
  rechargeMinAmount: (amount: string) =>
    `Minimum top-up amount: <b>${amount}</b> Toman ` + e.Toman,
  rechargeMaxAmount: (amount: string) =>
    `Maximum top-up amount: <b>${amount}</b> Toman ` + e.Toman,
  rechargeInvalidAmount: `${e.reject} Invalid amount entered`,
  rechargeTooLow: (min: string) =>
    `${e.reject} Top-up amount must be at least <b>${min}</b> Toman ` + e.Toman,
  rechargeTooHigh: (max: string) =>
    `${e.reject} Top-up amount cannot be more than <b>${max}</b> Toman ` +
    e.Toman,

  // Crypto Payment
  rechargeCryptoTitle: `${e.wallet} Crypto Payment`,
  rechargeCryptoAddress: (address: string) =>
    `Wallet address:\n\n<code>${address}</code>`,
  rechargeCryptoAmount: (amount: string) => `USDT amount: <b>${amount}</b>`,
  rechargeCryptoNetwork: (network: string) => `Network: <b>${network}</b>`,
  rechargeCryptoInstructions:
    `${e.clipboard} <b>Payment instructions:</b>\n\n` +
    `1. Send the USDT amount to the address above\n` +
    `2. Send me the TxID (transaction hash)\n` +
    `3. Wait up to 30 minutes for confirmation`,
  rechargeCryptoSendTxId: `Send TxID (transaction hash):`,
  rechargeCryptoTxIdReceived: `${e.checkBold} Transaction ID received\n\n${e.time} Verifying payment...\nThis process may take up to 30 minutes.`,
  rechargeCryptoVerified: (amount: string) =>
    `${e.party} <b>Payment confirmed!</b>\n\n${e.diamond} <b>${amount}</b> Toman has been added to your wallet.`,
  rechargeCryptoFailed: `${e.reject} Payment verification failed. Please contact support.`,

  // Card/Zarinpal Payment
  rechargeCardTitle: `${e.card} Card Payment`,
  rechargeZarinpalTitle: `${e.wallet} Zarinpal Gateway`,
  rechargePaymentLink: (amount: string) =>
    `Amount: <b>${amount}</b> Toman\n\nClick the button below to continue to the payment gateway:`,
  btnPayNow: `Pay`,
  rechargePaymentPending: `${e.time} Waiting for payment...\n\nPlease complete the payment in your browser.`,
  rechargePaymentSuccess: (amount: string) =>
    `${e.party} <b>Payment successful!</b>\n\n${e.diamond} <b>${amount}</b> Toman has been added to your wallet.`,
  rechargePaymentFailed: `❌ Payment failed. Please try again.`,
  rechargePaymentCancelled: `⚠️ Payment cancelled.`,

  // Transaction History
  transactionHistoryTitle: `${e.chart} Transaction History`,
  transactionHistoryEmpty: `You don't have any transactions yet — place your first order!`,
  transactionType: "Type:",
  transactionAmount: "Amount:",
  transactionDate: "Date:",
  transactionDescription: "Description:",

  // Transaction Types
  txTypeCredit: " Credit",
  txTypeDebit: " Debit",

  // Transaction Sources
  txSourcePurchase: `${e.bag} Purchase`,
  txSourceRecharge: `${e.card} Top-up`,
  txSourceRefund: `${e.wallet} Refund`,
  txSourceReferral: `${e.gift} Referral Reward`,
  txSourceReward: `${e.gift} Reward`,
  txSourcePerk: `${e.target} پاداش Perk`,
  txSourceAdminAdjustment: `${e.settings} Admin Adjustment`,

  // ── کلیدهای جدید شارژ کیف پول ──────────────────────────
  rechargeAmount: (amount: string) =>
    `${e.wallet} Amount: <b>${amount}</b> Toman ` + e.Toman,
  rechargeMethodSelectTitle: (amount: string) =>
    `${e.wallet} Amount <b>${amount}</b> Toman ${e.Toman}\n\nSelect a payment method:`,
  rechargeCardNumbers: `Card Numbers`,
  rechargeCardSendReceipt: `After transferring the amount, send your payment receipt image here.`,
  rechargeCardExpectPhoto: `${e.reject} Please send a photo of the payment receipt (image only, not text).`,
  rechargePendingApproval: `${e.checkBold} Your request has been registered!\n\n${e.time} Please wait for admin approval — usually under 30 minutes.`,
  rechargeApproved: (amount: string) =>
    `${e.party} <b>Top-up approved!</b>\n\n${e.diamond} <b>${amount}</b> Toman has been added to your wallet.`,
  rechargeRejected: `${e.reject} <b>Top-up request rejected.</b>\n\nContact support if needed.`,
  rechargeSessionExpired: `⚠️ Session expired. Please start again from wallet section.`,
  rechargeMethodDisabled: `❌ This payment method is currently disabled.`,
  rechargeNoMethodAvailable: `❌ No payment method is currently available. Please try again later.`,
  rechargeUsdtRate: (rate: string) => `📈 Live rate: <b>${rate}</b> Toman/USDT`,
  rechargeRateUnavailable: `❌ Live USDT rate is unavailable. Please wait and try again.`,
  rechargeCryptoInvalidTxId: `❌ Invalid TxID (must be at least 10 characters). Please send it again.`,
  rechargeZarinpalInstructions: `${e.clipboard} Click "Pay", complete the payment, then click "Verify Payment".`,
  btnVerifyPayment: `Verify Payment`,
  rechargeZarinpalVerifying: `⌛ Verifying payment...`,
  rechargeZarinpalSuccess: (amount: string) =>
    `${e.party} <b>Payment confirmed!</b>\n\n${e.diamond} <b>${amount}</b> Toman has been added to your wallet.`,
  rechargeZarinpalFailed: `${e.reject} Payment is not confirmed or has not been recorded yet.`,
  rechargeZarinpalRetry: `Try paying again or verify again.`,

  // Language Names
  langEnglish: `${e.flag_en} English`,
  langPersian: `${e.flag_ir} Persian`,
  langRussian: `${e.flag_ru} Russian`,

  // Invite Friends (Referral)
  inviteBanner: (data: {
    totalReferrals: number;
    totalRewards: string;
    referralLink: string;
  }) =>
    `${e.crown} <b>Invite friends and earn rewards!</b>\n\n` +
    `${e.user} Successful referrals: <b>${data.totalReferrals}</b>\n` +
    `${e.diamond} Total rewards: <b>${data.totalRewards}</b> Toman\n\n` +
    `🔗 <b>Your personal link:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `${e.sparkles} <b>How it works:</b>\n` +
    `1. Send your link to your friends\n` +
    `2. When they join, you earn rewards\n` +
    `3. Rewards are added directly to your wallet\n\n` +
    `${e.diamond} Reward per referral: <b>10,000</b> Toman`,
  btnShareInviteLink: ` Share Link`,
  btnCopyLink: ` Copy Link`,
  btnViewReferrals: ` Referred Users`,
  inviteShareText: `${e.gift} Join using this link and get a special discount!`,
  inviteLinkCopied: (link: string) =>
    `✅ Link copied!\n\nSend this link to your friends.`,
  noReferralsYet: `${e.user} You haven't referred anyone yet — start now and earn rewards!`,
  referralListTitle: `${e.user} <b>Referred Users</b>`,
  andMore: (count: number) => `and <b>${count}</b> more...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `${e.party} A new user (<b>${data.userName}</b>) joined via your referral link!\n` +
    `${e.diamond} <b>${data.amount}</b> Toman has been added to your wallet.`,

  // Discount Codes
  discountCodeInfo:
    `${e.gift} <b>Discount Code</b>\n\n` +
    `Use discount codes to reduce your purchase price.\n\n` +
    `You can apply a code during checkout or validate it here.`,
  btnEnterDiscountCode: ` Enter Discount Code`,
  btnDiscountHistory: ` Usage History`,
  enterDiscountCodePrompt: `${e.pencil} Enter your discount code:\n\nExample: <code>SUMMER2024</code>`,
  btnTryAgain: ` Try Again`,
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `${e.checkBold} <b>Discount code is valid!</b>\n\n` +
    `${e.ticket} Code: <code>${data.code}</code>\n` +
    `${e.tag} Type: ${data.type}\n` +
    `${e.diamond} Value: ${data.value}\n` +
    `${e.clipboard} Description: ${data.description}\n\n` +
    `Use this code during checkout.`,
  discountCodeInvalid: (reason: string) =>
    `${e.reject} <b>Invalid discount code</b>\n\n${reason}`,
  discountTypePercentage: "Percentage",
  discountTypeFixed: "Fixed amount",
  noDescription: "No description",
  noDiscountHistory: `📅 You haven't used any discount codes yet — make your first one count!`,
  discountHistoryTitle: `${e.chart} <b>Discount Code History</b>`,
  discountAmount: "Discount amount",
  orderId: "Order ID",

  // Settings
  userNotFound: `❌ User not found`,
  userIdentificationError: `❌ Error identifying user`,
  settingsTitle: `${e.settings} Settings`,
  settingsDescription: `${e.info} Manage your account from here.`,
  btnAccountInfo: `Account Info`,
  btnNotificationSettings: `Notification Settings`,
  btnPrivacy: ` Privacy`,
  btnAbout: `ℹ About Us`,

  // Account Info
  accountInfoTitle: `${e.user} Account Info`,
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `${e.crown} <b>Your Account Information</b>\n\n` +
    `${e.id} ID: <code>${data.userId}</code>\n` +
    `${e.user} Username: ${data.username ? `@${data.username}` : "Not set"}\n` +
    `${e.tag} Name: ${data.firstName}\n` +
    `${e.date} Joined: ${data.joinDate}\n\n` +
    `${e.chart} <b>Stats:</b>\n` +
    `${e.bag} Orders: <b>${data.totalOrders}</b>\n` +
    `${e.diamond} Total spent: <b>${data.totalSpent}</b> Toman\n` +
    `${e.user} Referrals: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: `${e.bell} Notification Settings`,
  notificationSettingsDescription: `${e.info} Choose which notifications you want to receive:`,
  btnToggleOrderNotifications: (enabled: boolean) => `Order notifications`,
  btnToggleWalletNotifications: (enabled: boolean) => ` Wallet notifications`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `Promotion notifications`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `Referral notifications`,
  btnToggleStockNotifications: (enabled: boolean) =>
    ` Product stock notifications`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? `${e.checkBold} Enabled` : `${e.reject} Disabled`}: ${type}`,
  allNotificationsEnabled: `${e.checkBold} All notifications are enabled`,
  allNotificationsDisabled: `${e.reject} All notifications are disabled`,

  // Privacy
  privacyTitle: `${e.lock} Privacy`,
  privacyDescription: `${e.shield} Manage your personal data:`,
  btnClearHistory: ` Clear History`,
  btnDeleteAccount: `Delete Account`,
  btnExportData: ` Export My Data`,
  clearHistoryConfirm:
    `${e.warning} <b>Are you sure?</b>\n\n` +
    `Your history will be deleted — this action cannot be undone.`,
  clearHistorySuccess: `${e.checkBold} History cleared successfully.`,
  clearHistoryCancelled: `${e.reject} Operation cancelled.`,
  deleteAccountConfirm:
    `${e.warning} <b>Warning!</b>\n\n` +
    `Are you sure you want to delete your account?\n\n` +
    `${e.reject} The following will be permanently deleted:\n` +
    `• Orders\n• Wallet\n• Referrals\n\n` +
    `This action is <b>irreversible</b>!`,
  deleteAccountSuccess: `${e.checkBold} Your account has been deleted.\n\nWe hope to see you again!`,
  deleteAccountCancelled: `${e.checkBold} Your account was not deleted.`,
  exportDataProcessing: `Preparing your data...`,
  exportDataReady: `${e.checkBold} Your data is ready!`,

  // About
  aboutTitle: `${e.info} About Us`,
  aboutDescription:
    `${e.robot} <b>Digital Services Sales Bot</b>\n\n` +
    `${e.diamond} Best services, best prices, and fastest delivery.\n\n` +
    `${e.mail} <b>Contact us:</b>\n` +
    `• Support: @r4m_m\n` +
    `${e.tag} Version: 2.3.5`,

  ordersTitle: `${e.bag} My Orders`,
  ordersEmpty: `${e.bag} You haven't placed any orders yet!\n\nBrowse products and make your first purchase.`,
  ordersTotal: `${e.chart} Total orders`,
  ordersActive: `${e.active} Active orders`,
  ordersCompleted: `${e.complete} Completed orders`,
  ordersSelectFilter: `Choose a filter:`,

  // Orders Filter Buttons
  btnOrdersFilterActive: `Active`,
  btnOrdersFilterCompleted: `Completed`,
  btnOrdersFilterAll: `All`,

  // Orders List
  ordersActiveTitle: `${e.active} Active Orders`,
  ordersCompletedTitle: `${e.complete} Completed Orders`,
  ordersAllTitle: `${e.clipboard} All Orders`,
  ordersSelectOne: `${e.pin} Tap an order to view details:`,
  ordersNoActive: `ℹ️ You have no active orders`,
  ordersNoCompleted: `ℹ️ You have no completed orders`,

  // Order Details
  orderDetailsTitle: `${e.clipboard} Order Details`,
  orderNumber: `${e.id} Order Number`,
  orderProduct: e.bag + " Product",
  orderStatus: "Status",
  orderTotalPrice: e.wallet + " Original Price",
  orderDiscount: e.gift + " Discount",
  orderWalletUsed: e.card + " Wallet",
  orderFinalPrice: e.confirm + " Final Price",
  orderCreatedAt: e.date + " Created At",
  orderDeliveredAt: e.date + " Delivered At",
  orderScheduledTime: e.time + " Scheduled Time",
  orderNotes: e.note + " Notes",

  // Order Delivery Info
  orderDeliveryInfo: "Delivery Info",
  orderDeliveryCode: "Code",
  orderDeliveryEmail: "Email",
  orderDeliveryLink: "Link",
  orderDeliveryInstructions: "Instructions",

  // Order Buttons
  btnOrderOpenTicket: `Open Ticket`,
  btnOrderRenew: `Renew`,
  btnOrderReschedule: `Reschedule`,
  btnOrderReportProblem: `Report Problem`,
  btnBackToOrders: `Back to Orders`,

  // Order Actions
  orderNotFound: "Order not found",
  orderAccessDenied: "You are not allowed to access this order",
  orderTicketComingSoon: "Ticket system will be available soon",
  orderNotRenewable: "This product cannot be renewed",
  orderRenewComingSoon: "Renewal will be available soon",
  orderCannotReschedule: "This order cannot be rescheduled",
  orderRescheduleComingSoon: "Rescheduling will be available soon",
  orderReportComingSoon: "Problem reporting will be available soon",
  errorFetchingOrders: `❌ Error fetching orders`,
  errorFetchingOrderDetails: `❌ Error fetching order details`,
  errorReschedulingOrder: `❌ Error rescheduling order`,
  errorRenewingOrder: `❌ Error renewing order`,
  renewScreenTitle: "🔄 Renew Service",
  renewWalletSuccess: (data: {
    orderId: number;
    productName: string;
    remainingBalance: string;
  }) =>
    `${e.confirm} <b>Renewal completed successfully!</b>\n\n` +
    `${e.bag} ${data.productName}\n` +
    `${e.ticket} Order number: #${data.orderId}\n\n` +
    `${e.wallet} Remaining balance: ${data.remainingBalance} Toman`,
  errorOpeningTicket: `❌ Error opening ticket`,
  errorReportingProblem: `❌ Error reporting problem`,

  // Support & Tickets
  supportMenuText:
    `${e.chat} <b>Support Center</b>\n\nHow can I help you?\n\n` +
    `• Submit a support ticket\n` +
    `• Report a problem\n` +
    `• View your tickets`,

  btnNewSupportTicket: `New Ticket`,
  btnNewReportTicket: `Report Problem`,
  btnMyTickets: `My Tickets`,
  btnViewMyTickets: `View Tickets`,
  btnBackToMain: `Main Menu`,
  btnReplyToTicket: `Reply`,
  btnViewMessages: `View Messages`,
  btnBackToTickets: `Back to Tickets`,
  btnViewTicket: `View Ticket`,
  btnViewOrder: `View Order`,

  // Ticket Creation
  ticketSupportPrompt:
    `${e.chat} <b>New Support Ticket</b>\n\n` +
    `Please describe your question or issue in detail.\n` +
    `Our team will respond as soon as possible.`,

  ticketOrderPrompt:
    `${e.chat} <b>Order Issue</b>\n\n` +
    `Please describe your order issue in detail.`,

  ticketReportPrompt:
    `${e.warning} <b>Problem Report</b>\n\n` +
    `Please describe the problem you faced in detail.`,

  ticketMessageTooShort: `${e.reject} Please provide more details (at least 10 characters)`,
  ticketMessageEmpty: `${e.reject} Message cannot be empty`,

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    `${e.checkBold} <b>Ticket created!</b>\n\nTicket number: <b>${data.ticketNumber}</b>\n\nOur support team has been notified and will reply soon.`,

  ticketCreateError: `❌ Failed to create ticket. Please try again or contact support directly.`,

  ticketOrderNotFound: `❌ Order not found`,

  // Ticket List
  ticketListTitle: `${e.clipboard} <b>Your Tickets</b>`,
  ticketListEmpty: `${e.chat} You don't have any tickets yet — need help? Open one!`,
  ticketListShowingFirst10: "Showing first 10 tickets",
  ticketListError: `❌ Failed to load tickets. Please try again.`,

  // Ticket Details
  ticketNotFound: `❌ Ticket not found`,
  ticketNotYours: `❌ This ticket does not belong to you`,
  ticketAlreadyClosed: `🔒 This ticket is closed`,
  waitForAdminReply: `Wait for admin to reply youe last ticket`,
  ticketLoadError: `❌ Failed to load ticket. Please try again.`,

  status: "Status",
  created: "Created",
  order: "Order",
  messages: "Messages",
  lastMessage: "Last message",

  // Ticket Statuses
  ticketStatus_open: `${e.active} Open`,
  ticketStatus_waiting_user: `${e.pending} Waiting for your reply`,
  ticketStatus_waiting_support: `${e.admin} Waiting for support`,
  ticketStatus_in_progress: `${e.pending} In progress`,
  ticketStatus_resolved: `${e.checkBold} Resolved`,
  ticketStatus_closed: `${e.lock} Closed`,
  ticketStatus_blocked: `${e.failed} Blocked`,

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    `${e.chat} <b>Reply to ${data.ticketNumber}</b>\n\nType your message:`,

  ticketReplySent: `${e.checkBold} Your message has been sent!\n\nI'll notify you when a reply arrives.`,

  ticketReplyError: `❌ Failed to send message. Please try again.`,

  ticketCreationCancelled: `${e.reject} Ticket creation cancelled`,

  // Ticket Messages
  ticketMessages: "Messages",
  ticketNoMessages: "There are no messages in this ticket yet",
  ticketMessagesError: `${e.reject} Failed to load messages`,
  ticketShowingLast5Messages: "Showing last 5 messages",
  you: "You",
  support: "Support",

  // Purchase / Order Completion
  insufficientBalance: (data: { required: string; current: string }) =>
    `${e.failed} Insufficient balance\n\nRequired: ${data.required} Toman\nYour balance: ${data.current} Toman\n\nTop up your wallet and try again.`,
  noConfigAvailable: `${e.reject} VPN config is not currently available for this plan. Please contact support.`,
  orderSuccess: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>Purchase successful!</b>\n\n` +
    `${e.bag} Product: ${data.productName}\n` +
    `${e.clipboard} Plan: ${data.planName}\n` +
    `${e.diamond} Amount: <b>${data.amount}</b> Toman\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance}</b> Toman\n` +
    `${e.id} Order: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `${e.key} <b>Your VPN Config</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `Tap the config above to copy it, then import it in your VPN app.`,
  btnMyOrders2: `My Orders`,
  btnBackToMenu: `Main Menu`,

  // Discount code during order flow
  enterDiscountCodeForOrder: `${e.ticket} <b>Add Discount Code</b>\n\nEnter your discount code:\n\nExample: <code>SUMMER2024</code>`,
  btnSkipDiscount: `Continue without discount code`,
  btnRemoveDiscount: `Remove discount`,
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `${e.checkBold} <b>Discount code applied!</b>\n\n` +
    `${e.ticket} Code: <code>${data.code}</code>\n` +
    `${e.diamond} Discount: -<b>${data.discountAmount}</b> Toman\n` +
    `${e.wallet} New amount: <b>${data.finalPrice}</b> Toman`,
  orderSummaryWithDiscount: (data: {
    productName: string;
    planName: string;
    duration: string;
    originalPrice: string;
    discountAmount: string;
    finalPrice: string;
    code: string;
  }) =>
    `${e.clipboard} <b>Order Summary</b>\n\n` +
    `${e.bag} Product: ${data.productName}\n` +
    `${e.tag} Plan: ${data.planName}\n` +
    (data.duration ? `${e.clock} Duration: ${data.duration}\n` : "") +
    `\n${e.wallet} Original price: <b>${data.originalPrice}</b> Toman\n` +
    `${e.ticket} Discount (${data.code}): -<b>${data.discountAmount}</b> Toman\n` +
    `${e.checkBold} Final price: <b>${data.finalPrice}</b> Toman`,
  discountNotApplicableForProduct: `${e.reject} This discount code is not valid for this product.`,
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `${e.reject} <b>Insufficient balance</b>\n\nRequired (after discount): <b>${data.required}</b> Toman\nYour balance: <b>${data.current}</b> Toman\n\nTop up your wallet.`,

  // Force Join Channels/Groups
  joinChannelRequired: `${e.flag_ir} <b>Required Membership</b>\n\nTo use this bot, first join the following channels/groups:`,
  btnIJoined: `I joined — Check`,
  joinChannelNotJoinedAlert: `🔒 You still haven’t joined all required channels. Join them and try again.`,

  // ── فلوی سفارش دستی / زمان‌بندی‌شده ──────────────────────────────────────
  manualOrderInfoRequired: `${e.clipboard} <b>Required Information</b>\n\nTo process your order, enter the following details:`,
  manualOrderStep: (data: { current: number; total: number }) =>
    `${e.pin} Step ${data.current} of ${data.total}`,
  manualOrderEmailPrompt: `${e.mail} <b>Enter account email address:</b>`,
  manualOrderPasswordPrompt: `${e.lock} <b>Enter account password:</b>\n\nPlease ensure your email and password are correct and valid to avoid order processing issues. Thank you.`,
  manualOrderLoginUsernamePrompt: `${e.user} <b>Enter account username:</b>`,
  manualOrderLoginPasswordPrompt: `${e.lock} <b>Enter account password:</b>`,
  manualOrderRegionPrompt: `${e.earth} <b>Enter preferred region</b> (e.g., US, EU, Asia):`,
  manualOrderNeedsLabel: "Required Information",
  adminOrderEmail: e.mail + " Email",
  adminOrderEmailPassword: e.key + " Email Password",
  adminOrderUsername: e.user + " Username",
  adminOrderLoginPassword: e.lock + "🔐 Password",
  adminOrderRegion: e.earth + " Region",
  adminOrderPayment: e.card + " Payment",
  adminOrderScheduled: e.date + " Schedule",
  selectRegion: `${e.earth} <b>Select Region</b>\n\nChoose your preferred region:`,
  selectedRegion: "Selected region",
  orderInfoReviewTitle: `${e.clipboard} <b>Review Order Information</b>`,
  orderInfoReviewPrompt: "Confirm or edit the details below:",
  btnConfirmInfo: `Confirm and Continue`,
  paymentSummaryTitle: `<b>Order Payment</b>`,
  paymentPrompt: "Choose a payment method to complete your order:",
  paymentOriginalPrice: "Original price",
  paymentDiscount: "Discount",
  paymentFinalPrice: "Final price",
  paymentWalletBalance: "Wallet balance",
  btnPayWallet: `Pay with Wallet`,
  btnPayCard: `Pay with Card`,
  btnPayZarinpal: `Zarinpal Gateway`,
  btnPayCrypto: `Pay with USDT (Crypto)`,
  payCardInstructions: (data: { amount: string }) =>
    `${e.card} <b>Card Payment</b>\n\n` +
    `${e.wallet} Amount: <b>${data.amount}</b> Toman\n\n` +
    `Copy one of the card numbers below and transfer the amount:`,
  payCardConfirmNote: `After transferring, click "${e.confirm} I Have Paid".`,
  btnConfirmCardPayment: `I Have Paid`,
  payCardPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Order placed!</b>\n\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.time} Your order will be processed after admin confirms your payment.\n` +
    `Usually confirmed within <b>1 to 24 hours</b>.`,
  payCryptoConfirmNote: `After making the transaction, click "${e.confirm} I Have Paid".`,
  btnConfirmCryptoPayment: `I Have Paid`,
  payCryptoPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Order placed!</b>\n\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.time} Your order will be processed after admin confirms the transaction.\n` +
    `Usually confirmed within <b>30 minutes to 2 hours</b>.`,
  btnCancelManualOrder: `Cancel Order`,
  manualOrderCancelled: `${e.reject} Order cancelled.`,
  manualOrderPending: (data: {
    orderId: number;
    productName: string;
    planName: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.checkBold} <b>Order placed!</b>\n\n` +
    `${e.bag} Product: ${data.productName}\n` +
    `${e.clipboard} Plan: ${data.planName}\n` +
    `${e.diamond} Amount: <b>${data.amount}</b> Toman\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance}</b> Toman\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.time} Your order has reached our team.\n` +
    `It will be processed and updated within <b>1 to 24 hours</b>.`,
  orderDeliveredNotification: (data: {
    orderId: number;
    productName: string;
  }) =>
    `${e.party} <b>Your order is ready!</b>\n\n` +
    `${e.bag} Product: ${data.productName}\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `Your access details are available in My Orders → Order Details.`,

  // ── انتخاب بازه زمانی ────────────────────────────────────────────────────
  schedulePickSlot: (data: { date: string }) =>
    `${e.date} <b>Select Time Slot</b>\n\nChoose an available slot for <b>${data.date}</b>:\n\n${e.checkBold} = available  |  ${e.reject} = full`,
  scheduleSlotFree: "Available",
  scheduleSlotFullAlert: `❌ This slot is full. Please choose another one.`,
  scheduleNoSlotsToday:
    `${e.reject} <b>No slots available</b>\n\n` +
    `Sorry, there are no available time slots for this product today.\n` +
    `Please try again tomorrow or contact support.`,
  schedulePickDay: `${e.date} Please choose your preferred day of the week:`,
  schedulePickDayNoSlots: `${e.reject} Sorry, no days with active time slots are available.`,
  scheduleBooked: (data: {
    orderId: number;
    productName: string;
    planName: string;
    timeSlot: string;
    date: string;
    amount: string;
    remainingBalance: string;
  }) =>
    `${e.party} <b>Time slot booked!</b>\n\n` +
    `${e.bag} Product: ${data.productName}\n` +
    `${e.clipboard} Plan: ${data.planName}\n` +
    `${e.date} Date: <b>${data.date}</b>\n` +
    `${e.clock} Time: <b>${data.timeSlot}</b>\n` +
    `${e.diamond} Amount: <b>${data.amount}</b> Toman\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance}</b> Toman\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.bell} <b>${e.clock} 15 minutes</b> before start, I’ll send you a reminder.\n` +
    `Track session status in <b>My Orders</b>.`,
  scheduleReminderNotification: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.bell} <b>Session Reminder!</b>\n\n` +
    `Your <b>${data.productName}</b> session starts in <b>15 minutes</b>.\n` +
    `${e.clock} Time: <b>${data.timeSlot}</b>\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.rocket} Be ready — our team will contact you shortly.`,
  sessionStartedUser: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.rocket} <b>Your session has started!</b>\n\n` +
    `${e.bag} Product: <b>${data.productName}</b>\n` +
    `${e.clock} Slot: <b>${data.timeSlot}</b>\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.key} The admin will send your login details in this chat.\n` +
    `${e.sparkles} Ready? Let’s go!`,

  // Blocked user
  userBlocked:
    `${e.failed} <b>Your access is restricted</b>\n\n` +
    `Your account has been blocked by management. If this is a mistake, contact support.`,
  userBlockedWithReason: (reason: string) =>
    `${e.failed} <b>Your access is restricted</b>\n\n` +
    `${e.note} Reason: ${reason}\n\n` +
    `If this is a mistake, contact support.`,

  // Maintenance mode
  botMaintenance:
    `${e.fixing} <b>Bot is temporarily unavailable</b>\n\n` +
    `We are under maintenance or updating. We’ll be back soon. Thanks for your patience ༉`,
  botMaintenanceCustom: (msg: string) => `${e.fixing} ${msg}`,

  // Feature disabled messages
  referralDisabled: `${e.lock} <b>Referral system is disabled</b>\n\nThe invite-friends program is currently temporarily disabled.`,
  shopDisabled: `${e.lock} <b>Shop is disabled</b>\n\nThe shop is currently temporarily disabled. Please try again later.`,

  // ── Stock notification ──────────────────────────────────────────────────────
  stockSubscribed: `🔔 Subscribed! We’ll notify you when it’s back in stock.`,
  stockAlreadySubscribed: `✅ You already subscribed. We’ll notify you once it’s in stock.`,
  stockRestocked: (data: { productName: string }) =>
    `${e.party} <b>Back in stock!</b>\n\n${e.bag} ${data.productName} is available again.\n\n🛍 Buy it now!`,

  // ── Inventory order flow ──────────────────────────────────────────────────
  enterQuantityPrompt: (available: number) =>
    `${e.truck} Stock : ${available}\n` +
    `${e.trolley}  Enter desired quantity:`,
  enterQuantityHint: `${e.warning} Enter numbers only`,
  quantityInvalid: `${e.reject} Invalid quantity entered. Please enter a positive number.`,
  quantityExceedsStock: (data: { stock: number }) =>
    `${e.reject} Not enough stock. Current stock: <b>${data.stock}</b> units`,
  quantityExceedsLimit: (data: { max: number }) =>
    `${e.reject} You can purchase a maximum of <b>${data.max}</b> units per order.`,
  warrantyDays: (data: { days: number }) =>
    `Warranty: <b>${data.days} days</b>`,
  termsTitle: `Terms and Conditions`,
  btnChangeQuantity: `Change Quantity`,
  inventoryOrderSummary: (data: {
    productName: string;
    qty: number;
    unitPrice: string;
    total: string;
    currency: string;
  }) =>
    `${e.clipboard} <b>Order Summary</b>\n\n` +
    `${e.bag} Product: <b>${data.productName}</b>\n` +
    `${e.trolley} Quantity: <b>${data.qty}</b>\n` +
    `${e.wallet} Unit price: <b>${data.unitPrice} ${data.currency}</b>\n` +
    `${e.card} Total amount: <b>${data.total} ${data.currency}</b>`,
  inventoryOrderSuccess: (data: {
    orderId: number;
    productName: string;
    qty: number;
    total: string;
    remainingBalance: string;
    currency: string;
  }) =>
    `${e.party} <b>Order placed successfully!</b>\n\n` +
    `${e.bag} Product: <b>${data.productName}</b>\n` +
    `${e.trolley} Quantity: <b>${data.qty}</b>\n` +
    `${e.card} Paid amount: <b>${data.total} ${data.currency}</b>\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance} ${data.currency}</b>\n` +
    `${e.id} Order ID: #${data.orderId}`,
  inventoryDeliveryHeader: (data: { productName: string }) =>
    `${e.key} <b>Delivery: ${data.productName}</b>`,

  inventoryDeliveryItem: (data: { index: number; content: string }[]) =>
    `${e.fire} Thank you for your purchase, dear customer \n\n` +
    `${e.bag} Your order is ready \n\n` +
    data.map((item) => `<b>#${item.index}</b>\n${item.content}`).join("\n\n") +
    `${e.truck} Visit our shop again \n` +
    `${e.sparkles} We look forward to seeing you again `,

  adminConfirmrechargeMsg: (
    userLabel: string,
    opts: any,
    formatNum: (num: number) => string,
    methodLabel: string,
  ) =>
    `${e.Toman} <b>Wallet Top-up Request</b>\n\n` +
    `${e.user} User: ${userLabel} (<code>${opts.userId}</code>)\n` +
    `${e.wallet} Amount: <b>${formatNum(opts.amount)}</b> Toman\n` +
    `${e.key} Method: ${methodLabel}\n`,
  regionNotFound: "Region not found ❌",
  rechargeCardSaveFailed: e.warning + "Failed to save file",
} satisfies ShouldFollowLanguageStrict<typeof fa>;
