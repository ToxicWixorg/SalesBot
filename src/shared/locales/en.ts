import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { e } from "./emojies";
import type { fa } from "./fa";

export const en = {
  // Language Selection
  selectLanguage: `${e.earth} <b>Select your language:</b>`,
  languageSelected: (lang: string) =>
    `${e.checkBold} Language changed to <b>${lang}</b>`,

  // Greeting & Welcome
  greeting: (name: string) => `Hello <b>${name}</b>! ${e.sparkles}`,
  welcome: (name: string) =>
    `${e.crown} Hello <b>${name}</b>, welcome!\n\n` +
    `${e.gem} Find the best digital services at the best prices here.\n`,

  // Main Menu
  mainMenu: `${e.home} Main Menu`,
  chooseAction: "",
  main_menu: (name: string) =>
    `${e.crown} Hello <b>${name}</b>!\n\n` +
    `${e.sparkles} Welcome to our digital store!\n\n` +
    `${e.gem} Premium subscriptions, AI accounts and digital services — all at the best prices.\n\n` +
    `Choose an option:`,

  // Buttons
  btnProducts: `🛍️ Products`,
  btnMyOrders: `📦 My Orders`,
  btnWallet: `💰 Wallet`,
  btnInviteFriends: `👥 Invite Friends`,
  btnDiscountCode: `🎁 Discount Code`,
  btnSupport: `💬 Support`,
  btnSettings: `⚙️ Settings`,
  btnBack: `🔙 Back`,
  btnCancel: `❌ Cancel`,
  btnMainMenu: `🏠 Main Menu`,
  btnChangeLanguage: `🌐 Change Language`,
  btnNotifications: `🔔 Notifications`,
  btnYes: `✅ Yes`,
  btnNo: `❌ No`,
  btnConfirm: `✅ Confirm`,

  // Products
  btnBuyProduct: `🛍️ Buy`,
  btnNotifyStock: `🔔 Notify Stock`,
  btnConfirmOrder: `✅ Confirm Order`,
  btnAddDiscountCode: `🎫 Add Discount Code`,
  productsTitle: `${e.bag} Products`,
  selectCategory: `${e.tag} Select a category:`,
  categoryProducts: (category: string) => `Products in <b>${category}</b>:`,
  noProducts: `${e.cross} No products available in this category.`,
  productDetails: `${e.box} Product Details`,
  price: `${e.wallet} Price:`,
  stock: `${e.box} Stock:`,
  available: `${e.checkBold} Available`,
  outOfStock: `${e.cross} Out of Stock`,
  productNotFound: `${e.cross} Product not found`,
  planNotFound: `${e.cross} Plan not found`,
  categoryNotFound: `${e.cross} Category not found`,
  noPlansAvailable: `${e.cross} No plans available`,
  insufficientBalanceAlert: `${e.cross} Insufficient balance`,
  deliveryTime: `${e.clock} Delivery Time:`,
  deliveryType: `${e.truck} Delivery Type:`,
  deliveryAutomatic: `${e.zap} Instant (Automatic)`,
  deliveryManual: `${e.person} Manual (1-24 hours)`,
  deliveryCoordination: `${e.calendar} Requires Coordination`,
  selectPlan: `${e.clipboard} Select your plan:`,
  orderSummary: `${e.clipboard} Order Summary:`,
  total: `${e.wallet} Total:`,
  currency: "USD",
  oneTime: "One-time",
  duration_day: "day(s)",
  duration_month: "month(s)",
  duration_year: "year(s)",

  // Wallet
  walletTitle: `${e.wallet} Wallet`,
  walletBalance: (balance: string) => `Balance: <b>${balance}</b> USD`,
  walletEmpty: `${e.wallet} Your wallet is empty ${e.sparkles} Top it up and get started!`,
  btnRechargeWallet: `💳 Top Up Wallet`,
  btnTransactionHistory: `📊 Transaction History`,

  // Wallet Recharge
  rechargeWalletTitle: `${e.card} Top Up Wallet`,
  rechargeSelectMethod: `Select a top-up method:`,
  btnRechargeCrypto: `🪙 Crypto Payment (USDT)`,
  btnRechargeCard: `💳 Card Payment`,
  btnRechargeZarinpal: `💰 Zarinpal Gateway`,

  rechargeEnterAmount: `${e.wallet} Enter the top-up amount:`,
  rechargeEnterAmountUsdt: `${e.coin} Enter USDT amount:`,
  rechargeMinAmount: (amount: string) => `Minimum top-up: <b>${amount}</b> USD`,
  rechargeMaxAmount: (amount: string) => `Maximum top-up: <b>${amount}</b> USD`,
  rechargeMinAmountUsdt: (amount: string) =>
    `Minimum amount: <b>${amount}</b> USDT`,
  rechargeMaxAmountUsdt: (amount: string) =>
    `Maximum amount: <b>${amount}</b> USDT`,
  rechargeInvalidAmount: `${e.cross} Invalid amount entered`,
  rechargeTooLow: (min: string) =>
    `${e.cross} Top-up amount must be at least <b>${min}</b> USD`,
  rechargeTooHigh: (max: string) =>
    `${e.cross} Top-up amount cannot exceed <b>${max}</b> USD`,

  // Crypto Payment
  rechargeCryptoTitle: `${e.coin} Crypto Payment`,
  rechargeCryptoAddress: (address: string) =>
    `Wallet Address:\n\n<code>${address}</code>`,
  rechargeCryptoAmount: (amount: string) => `USDT Amount: <b>${amount}</b>`,
  rechargeCryptoNetwork: (network: string) => `Network: <b>${network}</b>`,
  rechargeCryptoInstructions:
    `${e.clipboard} <b>Payment Instructions:</b>\n\n` +
    `1. Send the USDT amount to the address above\n` +
    `2. Send the TxID (transaction ID)\n` +
    `3. Wait up to 30 minutes for confirmation`,
  rechargeCryptoSendTxId: `Send the TxID (transaction ID):`,
  rechargeCryptoTxIdReceived: `${e.checkBold} Transaction ID received\n\n${e.hourglass} Verifying payment...\nThis process may take up to 30 minutes.`,
  rechargeCryptoVerified: (amount: string) =>
    `${e.party} <b>Payment confirmed!</b>\n\n${e.gem} <b>${amount}</b> USD has been added to your wallet.`,
  rechargeCryptoFailed: `${e.cross} Payment verification failed. Please contact support.`,

  // Card/Zarinpal Payment
  rechargeCardTitle: `${e.card} Card Payment`,
  rechargeZarinpalTitle: `${e.wallet} Zarinpal Gateway`,
  rechargePaymentLink: (amount: string) =>
    `Amount: <b>${amount}</b>\n\nClick the button below to go to the payment gateway:`,
  btnPayNow: `💳 Pay Now`,
  rechargePaymentPending: `${e.hourglass} Waiting for payment...\n\nPlease complete the payment in your browser.`,
  rechargePaymentSuccess: (amount: string) =>
    `${e.party} <b>Payment successful!</b>\n\n${e.gem} <b>${amount}</b> has been added to your wallet.`,
  rechargePaymentFailed: `${e.cross} Payment failed. Please try again.`,
  rechargePaymentCancelled: `${e.warn} Payment was cancelled.`,

  // Transaction History
  transactionHistoryTitle: `${e.chart} Transaction History`,
  transactionHistoryEmpty: `${e.chart} No transactions yet — make your first purchase!`,
  transactionType: "Type:",
  transactionAmount: "Amount:",
  transactionDate: "Date:",
  transactionDescription: "Description:",

  // Transaction Types
  txTypeCredit: "Plus Credit",
  txTypeDebit: "Minus Debit",

  // Transaction Sources
  txSourcePurchase: `${e.bag} Purchase`,
  txSourceRecharge: `${e.card} Top-up`,
  txSourceRefund: `${e.bounce} Refund`,
  txSourceReferral: `${e.users} Referral Reward`,
  txSourceReward: `${e.gift} Reward`,
  txSourcePerk: `${e.target} Perk Reward`,
  txSourceAdminAdjustment: `${e.settings} Admin Adjustment`,

  // ── New wallet recharge keys ─────────────────────────────
  rechargeAmount: (amount: string) => `💰 Amount: <b>${amount}</b> Toman`,
  rechargeMethodSelectTitle: (amount: string) =>
    `${e.wallet} Amount: <b>${amount}</b> Toman\n\nSelect payment method:`,
  rechargeCardNumbers: `Card Numbers`,
  rechargeCardSendReceipt: `After transferring the amount, send a photo of your receipt here.`,
  rechargeCardExpectPhoto: `${e.cross} Please send a photo of your payment receipt (image, not text).`,
  rechargePendingApproval: `${e.checkBold} Your request has been submitted!\n\n${e.hourglass} Waiting for admin approval — usually within 30 minutes.`,
  rechargeApproved: (amount: string) =>
    `${e.party} <b>Recharge approved!</b>\n\n${e.gem} <b>${amount}</b> Toman has been added to your wallet.`,
  rechargeRejected: `${e.cross} <b>Recharge request rejected.</b>\n\nContact support if needed.`,
  rechargeSessionExpired: `${e.warn} Session expired. Please start again from the wallet.`,
  rechargeMethodDisabled: `${e.cross} This payment method is currently unavailable.`,
  rechargeNoMethodAvailable: `${e.cross} No payment methods are currently active. Try again later.`,
  rechargeUsdtRate: (rate: string) => `📈 Live rate: <b>${rate}</b> Toman/USDT`,
  rechargeRateUnavailable: `${e.cross} Live USDT rate is unavailable. Please wait and try again.`,
  rechargeCryptoInvalidTxId: `${e.cross} Invalid TxID (must be at least 10 characters). Please resend.`,
  rechargeZarinpalInstructions: `${e.clipboard} Click Pay, complete the payment, then click Verify Payment.`,
  btnVerifyPayment: `${e.checkBold} Verify Payment`,
  rechargeZarinpalVerifying: `${e.hourglass} Verifying payment...`,
  rechargeZarinpalSuccess: (amount: string) =>
    `${e.party} <b>Payment confirmed!</b>\n\n${e.gem} <b>${amount}</b> Toman has been added to your wallet.`,
  rechargeZarinpalFailed: `${e.cross} Payment not confirmed or not yet processed.`,
  rechargeZarinpalRetry: `Try paying again or check again.`,

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
    `${e.crown} <b>Invite Friends and Earn!</b>\n\n` +
    `${e.users} Successful Referrals: <b>${data.totalReferrals}</b>\n` +
    `${e.gem} Total Rewards: <b>${data.totalRewards}</b>\n\n` +
    `<b>Your Referral Link:</b>\n` +
    `<code>${data.referralLink}</code>\n\n` +
    `${e.sparkles} <b>How it works:</b>\n` +
    `1. Share the link with your friends\n` +
    `2. When they join, you get rewarded\n` +
    `3. Rewards are added directly to your wallet\n\n` +
    `${e.gem} Reward per referral: <b>10,000</b> Toman`,
  btnShareInviteLink: `📤 Share Link`,
  btnCopyLink: `📋 Copy Link`,
  btnViewReferrals: `👥 Referral List`,
  inviteShareText: `${e.gift} Join using this link and get a special discount!`,
  inviteLinkCopied: (link: string) =>
    `${e.checkBold} Link copied!\n\n<code>${link}</code>\n\nSend this link to your friends.`,
  noReferralsYet: `${e.users} You haven't invited anyone yet — start and earn!`,
  referralListTitle: `${e.users} <b>Referral List</b>`,
  andMore: (count: number) => `and <b>${count}</b> more...`,
  referralRewardNotification: (data: { userName: string; amount: string }) =>
    `${e.party} A new user (<b>${data.userName}</b>) joined through your referral link!\n` +
    `${e.gem} <b>${data.amount}</b> has been added to your account.`,

  // Discount Codes
  discountCodeInfo:
    `${e.gift} <b>Discount Code</b>\n\n` +
    `Use discount codes to get a lower price on your purchases.\n\n` +
    `You can enter a code during checkout or verify it here.`,
  btnEnterDiscountCode: `✏️ Enter Discount Code`,
  btnDiscountHistory: `📊 Usage History`,
  enterDiscountCodePrompt: `${e.pencil} Enter your discount code:\n\nExample: <code>SUMMER2024</code>`,
  btnTryAgain: `🔄 Try Again`,
  discountCodeValid: (data: {
    code: string;
    type: string;
    value: string;
    description: string;
  }) =>
    `${e.checkBold} <b>Valid discount code!</b>\n\n` +
    `${e.ticket} Code: <code>${data.code}</code>\n` +
    `${e.tag} Type: ${data.type}\n` +
    `${e.gem} Value: ${data.value}\n` +
    `${e.clipboard} Description: ${data.description}\n\n` +
    `Use this code during checkout.`,
  discountCodeInvalid: (reason: string) =>
    `${e.cross} <b>Invalid discount code</b>\n\n${reason}`,
  discountTypePercentage: "Percentage",
  discountTypeFixed: "Fixed Amount",
  noDescription: "No description",
  noDiscountHistory: `${e.chart} You haven't used any discount codes yet — start saving!`,
  discountHistoryTitle: `${e.chart} <b>Discount Code History</b>`,
  discountAmount: "Discount Amount",
  orderId: "Order Number",

  // Settings
  userNotFound: `${e.cross} User not found`,
  userIdentificationError: `${e.cross} Unable to identify user`,
  settingsTitle: `${e.settings} Settings`,
  settingsDescription: `${e.info} Manage your account from here.`,
  btnAccountInfo: `👤 Account Info`,
  btnNotificationSettings: `🔔 Notification Settings`,
  btnPrivacy: `🔒 Privacy`,
  btnAbout: `ℹ️ About`,

  // Account Info
  accountInfoTitle: `${e.person} Account Info`,
  accountInfoData: (data: {
    userId: string;
    username: string;
    firstName: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: string;
    totalReferrals: number;
  }) =>
    `${e.crown} <b>Your Account</b>\n\n` +
    `${e.id} ID: <code>${data.userId}</code>\n` +
    `${e.person} Username: ${data.username ? `@${data.username}` : "None"}\n` +
    `${e.tag} Name: ${data.firstName}\n` +
    `${e.calendar} Joined: ${data.joinDate}\n\n` +
    `${e.chart} <b>Stats:</b>\n` +
    `${e.bag} Purchases: <b>${data.totalOrders}</b>\n` +
    `${e.gem} Total Spent: <b>${data.totalSpent}</b>\n` +
    `${e.users} Referrals: <b>${data.totalReferrals}</b>`,

  // Notification Settings
  notificationSettingsTitle: `${e.bell} Notification Settings`,
  notificationSettingsDescription: `${e.info} Choose which notifications to receive:`,
  btnToggleOrderNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Order Notifications`,
  btnToggleWalletNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Wallet Notifications`,
  btnTogglePromotionNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Promotion Notifications`,
  btnToggleReferralNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Referral Notifications`,
  btnToggleStockNotifications: (enabled: boolean) =>
    `${enabled ? "✅" : "❌"} Stock Notifications`,
  notificationToggled: (type: string, enabled: boolean) =>
    `${enabled ? `${e.checkBold} Enabled` : `${e.cross} Disabled`}: ${type}`,
  allNotificationsEnabled: `${e.checkBold} All notifications are enabled`,
  allNotificationsDisabled: `${e.cross} All notifications are disabled`,

  // Privacy
  privacyTitle: `${e.lock} Privacy`,
  privacyDescription: `${e.shield} Manage your personal data:`,
  btnClearHistory: `🗑️ Clear History`,
  btnDeleteAccount: `❌ Delete Account`,
  btnExportData: `📤 Export My Data`,
  clearHistoryConfirm:
    `${e.warn} <b>Are you sure?</b>\n\n` +
    `Your history will be cleared — this action cannot be undone.`,
  clearHistorySuccess: `${e.checkBold} History cleared successfully.`,
  clearHistoryCancelled: `${e.cross} Action cancelled.`,
  deleteAccountConfirm:
    `${e.warn} <b>Warning!</b>\n\n` +
    `Are you sure you want to delete your account?\n\n` +
    `${e.cross} All of the following will be <b>permanently</b> deleted:\n` +
    `- Orders\n- Wallet\n- Referrals\n\n` +
    `This action is <b>irreversible</b>!`,
  deleteAccountSuccess: `${e.checkBold} Your account has been deleted.\n\nWe hope to see you again!`,
  deleteAccountCancelled: `${e.checkBold} Your account was not deleted.`,
  exportDataProcessing: ` Preparing your data...`,
  exportDataReady: `${e.checkBold} Your data is ready!`,

  // About
  aboutTitle: `${e.info} About`,
  aboutDescription:
    `${e.robot} <b>Digital Services Store Bot</b>\n\n` +
    `${e.gem} The best services at the best prices with the fastest delivery.\n\n` +
    `${e.mail} <b>Contact us:</b>\n` +
    `- Support: @TajEzat\n` +
    `- Channel: @ZendeBadParsi\n\n` +
    `${e.tag} Version: 1.0.0`,

  // Orders
  ordersTitle: `${e.box} My Orders`,
  ordersEmpty: `${e.box} You haven't placed any orders yet!\n\nBrowse products and make your first purchase.`,
  ordersTotal: `${e.chart} Total Orders`,
  ordersActive: `${e.blue} Active Orders`,
  ordersCompleted: `${e.green} Completed Orders`,
  ordersSelectFilter: `Choose a filter:`,

  // Orders Filter Buttons
  btnOrdersFilterActive: `🔵 Active`,
  btnOrdersFilterCompleted: `🟢 Completed`,
  btnOrdersFilterAll: `📋 All`,

  // Orders List
  ordersActiveTitle: `${e.blue} Active Orders`,
  ordersCompletedTitle: `${e.green} Completed Orders`,
  ordersAllTitle: `${e.clipboard} All Orders`,
  ordersSelectOne: `${e.pin} Click on an order to view details:`,
  ordersNoActive: `${e.info} You have no active orders`,
  ordersNoCompleted: `${e.info} You have no completed orders`,

  // Order Details
  orderDetailsTitle: `${e.box} Order Details`,
  orderNumber: "Order Number",
  orderProduct: "Product",
  orderStatus: "Status",
  orderTotalPrice: "Original Price",
  orderDiscount: "Discount",
  orderWalletUsed: "Wallet Used",
  orderFinalPrice: "Final Price",
  orderCreatedAt: "Created At",
  orderDeliveredAt: "Delivered At",
  orderScheduledTime: "Scheduled Time",
  orderNotes: "Notes",

  // Order Delivery Info
  orderDeliveryInfo: "Delivery Info",
  orderDeliveryCode: "Code",
  orderDeliveryEmail: "Email",
  orderDeliveryLink: "Link",
  orderDeliveryInstructions: "Instructions",

  // Order Buttons
  btnOrderOpenTicket: `💬 Open Ticket`,
  btnOrderRenew: `🔄 Renew`,
  btnOrderReschedule: `📅 Reschedule`,
  btnOrderReportProblem: `⚠️ Report Problem`,
  btnBackToOrders: `🔙 Back to Orders`,

  // Order Actions
  orderNotFound: "Order not found",
  orderAccessDenied: "Access to this order is not allowed",
  orderTicketComingSoon: "Ticket system coming soon",
  orderNotRenewable: "This product cannot be renewed",
  orderRenewComingSoon: "Renewal feature coming soon",
  renewScreenTitle: "🔄 Renew Service",
  renewWalletSuccess: (data: {
    orderId: number;
    productName: string;
    remainingBalance: string;
  }) =>
    `✅ <b>Renewal Successful!</b>\n\n` +
    `📦 ${data.productName}\n` +
    `🎫 Order #${data.orderId}\n\n` +
    `👛 Remaining balance: ${data.remainingBalance} Toman`,
  orderCannotReschedule: "This order cannot be rescheduled",
  orderRescheduleComingSoon: "Reschedule feature coming soon",
  orderReportComingSoon: "Problem report system coming soon",
  errorFetchingOrders: `${e.cross} Error fetching orders`,
  errorFetchingOrderDetails: `${e.cross} Error fetching order details`,
  errorReschedulingOrder: `${e.cross} Error rescheduling order`,
  errorRenewingOrder: `${e.cross} Error renewing order`,
  errorOpeningTicket: `${e.cross} Error opening ticket`,
  errorReportingProblem: `${e.cross} Error reporting problem`,

  // Support & Tickets
  supportMenuText:
    `${e.chat} <b>Support Center</b>\n\nHow can I help you?\n\n` +
    `- Submit a support ticket\n` +
    `- Report a problem\n` +
    `- View tickets`,

  btnNewSupportTicket: `🎫 New Ticket`,
  btnNewReportTicket: `⚠️ Report Problem`,
  btnMyTickets: `📋 My Tickets`,
  btnViewMyTickets: `👁️ View Tickets`,
  btnBackToMain: `🏠 Main Menu`,
  btnReplyToTicket: `💬 Reply`,
  btnViewMessages: `💬 View Messages`,
  btnBackToTickets: `🔙 Back to Tickets`,
  btnViewTicket: `👁️ View Ticket`,
  btnViewOrder: `📦 View Order`,

  // Ticket Creation
  ticketSupportPrompt:
    `${e.ticket} <b>New Support Ticket</b>\n\n` +
    `Describe your question or issue in detail.\n` +
    `Our team will respond as soon as possible.`,

  ticketOrderPrompt:
    `${e.box} <b>Order Problem</b>\n\n` +
    `Describe the issue with your order in detail.`,

  ticketReportPrompt:
    `${e.warn} <b>Report a Problem</b>\n\n` +
    `Describe the problem you encountered in detail.`,

  ticketMessageTooShort: `${e.cross} Please provide more detail (at least 10 characters)`,
  ticketMessageEmpty: `${e.cross} Message cannot be empty`,

  ticketCreatedSuccess: (data: { ticketNumber: string }) =>
    `${e.checkBold} <b>Ticket created!</b>\n\nTicket number: <b>${data.ticketNumber}</b>\n\nOur support team has been notified and will respond shortly.`,

  ticketCreateError: `${e.cross} Failed to create ticket. Try again or contact support directly.`,

  ticketOrderNotFound: `${e.cross} Order not found`,

  // Ticket List
  ticketListTitle: `${e.clipboard} <b>Your Tickets</b>`,
  ticketListEmpty: `${e.chat} You have no tickets yet — having a problem? Open a ticket!`,
  ticketListShowingFirst10: "Showing first 10 tickets",
  ticketListError: `${e.cross} Failed to load tickets. Please try again.`,

  // Ticket Details
  ticketNotFound: `${e.cross} Ticket not found`,
  ticketNotYours: `${e.cross} This ticket does not belong to you`,
  ticketAlreadyClosed: `${e.lock} This ticket is closed`,
  ticketLoadError: `${e.cross} Failed to load ticket. Please try again.`,

  status: "Status",
  created: "Created",
  order: "Order",
  messages: "Messages",
  lastMessage: "Last Message",

  // Ticket Statuses
  ticketStatus_open: `${e.green} Open`,
  ticketStatus_waiting_user: `${e.yellow} Waiting for your reply`,
  ticketStatus_waiting_support: `${e.orange} Waiting for support`,
  ticketStatus_in_progress: `${e.blue} In Progress`,
  ticketStatus_resolved: `${e.checkBold} Resolved`,
  ticketStatus_closed: `${e.lock} Closed`,
  ticketStatus_blocked: `${e.no} Blocked`,

  // Ticket Reply
  ticketReplyPrompt: (data: { ticketNumber: string }) =>
    `${e.chat} <b>Reply to ${data.ticketNumber}</b>\n\nType your message:`,

  ticketReplySent: `${e.checkBold} Message sent!\n\nI'll notify you when a reply arrives.`,

  ticketReplyError: `${e.cross} Failed to send message. Please try again.`,

  ticketCreationCancelled: `${e.cross} Ticket creation cancelled`,

  // Ticket Messages
  ticketMessages: "Messages",
  ticketNoMessages: "No messages in this ticket yet",
  ticketMessagesError: `${e.cross} Failed to load messages`,
  ticketShowingLast5Messages: "Showing last 5 messages",
  you: "You",
  support: "Support",

  // Purchase / Order Completion
  insufficientBalance: (data: { required: string; current: string }) =>
    `${e.cross} <b>Insufficient balance</b>\n\nRequired: <b>${data.required}</b>\nYour balance: <b>${data.current}</b>\n\nTop up your wallet and try again.`,
  noConfigAvailable: `${e.cross} No VPN config available for this plan at the moment. Please contact support.`,
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
    `${e.gem} Amount: <b>${data.amount}</b>\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance}</b>\n` +
    `${e.id} Order: #${data.orderId}`,
  vpnConfigMessage: (data: { configData: string; label?: string }) =>
    `${e.key} <b>Your VPN Config</b>${data.label ? ` (${data.label})` : ""}\n\n` +
    `<code>${data.configData}</code>\n\n` +
    `Tap the config above to copy it, then paste it into your VPN app.`,
  btnMyOrders2: `📦 My Orders`,
  btnBackToMenu: `🏠 Main Menu`,

  // Discount code during order flow
  enterDiscountCodeForOrder: `${e.ticket} <b>Add Discount Code</b>\n\nEnter your discount code:\n\nExample: <code>SUMMER2024</code>`,
  btnSkipDiscount: `⚡ Continue without discount`,
  btnRemoveDiscount: `🗑️ Remove Discount`,
  discountCodeAppliedToOrder: (data: {
    code: string;
    discountAmount: string;
    finalPrice: string;
  }) =>
    `${e.checkBold} <b>Discount code applied!</b>\n\n` +
    `${e.ticket} Code: <code>${data.code}</code>\n` +
    `${e.gem} Discount: -<b>${data.discountAmount}</b>\n` +
    `${e.wallet} New Total: <b>${data.finalPrice}</b>`,
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
    `\n${e.wallet} Original Price: <b>${data.originalPrice}</b>\n` +
    `${e.ticket} Discount (${data.code}): -<b>${data.discountAmount}</b>\n` +
    `${e.checkBold} Final Price: <b>${data.finalPrice}</b>`,
  discountNotApplicableForProduct: `${e.cross} This discount code is not valid for this product.`,
  discountInsufficientBalanceWithDiscount: (data: {
    required: string;
    current: string;
  }) =>
    `${e.cross} <b>Insufficient balance</b>\n\nRequired (after discount): <b>${data.required}</b>\nYour balance: <b>${data.current}</b>\n\nPlease top up your wallet.`,

  // Force Join Channels/Groups
  joinChannelRequired: `${e.flag_en} <b>Membership Required</b>\n\nTo use the bot, please join the following channels/groups first:`,
  btnIJoined: `✅ I've joined — check`,
  joinChannelNotJoinedAlert: `You haven't joined all required channels yet. Join them and try again.`,

  // Manual / Scheduled Order Flow
  manualOrderInfoRequired: `${e.clipboard} <b>Required Information</b>\n\nPlease enter the following details to process your order:`,
  manualOrderStep: (data: { current: number; total: number }) =>
    `${e.pin} Step ${data.current} of ${data.total}`,
  manualOrderEmailPrompt: `${e.mail} Enter the account <b>email address</b>:`,
  manualOrderPasswordPrompt: `${e.lock} <b>رمز عبور</b> اکانت رو وارد کن:\n\n مطمئن شوید ایمیل رو رمز درست و معتبر باشند تا در فرایند سفارش مشکلی ایجاد نشود با تشکر.`,
  manualOrderLoginUsernamePrompt: `${e.person} Enter the account <b>username</b>:`,
  manualOrderLoginPasswordPrompt: `${e.lock} Enter the account <b>password</b>:`,
  manualOrderRegionPrompt: `${e.earth} Enter the desired <b>region</b> (e.g. US, EU, Asia):`,
  manualOrderNeedsLabel: "Required Information",
  adminOrderEmail: "📧 Email",
  adminOrderEmailPassword: "🔑 Email Password",
  adminOrderUsername: "👤 Username",
  adminOrderLoginPassword: "🔐 Password",
  adminOrderRegion: "🌍 Region",
  adminOrderPayment: "💳 Payment",
  adminOrderScheduled: "📅 Scheduled",
  selectRegion: `${e.earth} <b>Select Region</b>\n\nChoose your desired region:`,
  selectedRegion: "Selected Region",
  orderInfoReviewTitle: `${e.clipboard} <b>Review Order Info</b>`,
  orderInfoReviewPrompt: "Confirm the details below or edit them:",
  btnConfirmInfo: `${e.checkBold} Confirm & Continue`,
  paymentSummaryTitle: `${e.wallet} <b>Order Payment</b>`,
  paymentPrompt: "Choose a payment method to complete your order:",
  paymentOriginalPrice: "Original Price",
  paymentDiscount: "Discount",
  paymentFinalPrice: "Final Price",
  paymentWalletBalance: "Wallet Balance",
  btnPayWallet: `${e.wallet} Pay from Wallet`,
  btnPayCard: `💳 Pay by Card`,
  btnPayZarinpal: `🟢 ZarinPal Gateway`,
  btnPayCrypto: `🪙 Pay with USDT (Crypto)`,
  payCardInstructions: (data: { amount: string }) =>
    `💳 <b>Card Payment</b>\n\n` +
    `💰 Amount: <b>${data.amount}</b> Toman\n\n` +
    `Copy one of the card numbers below and transfer the amount:`,
  payCardConfirmNote: `After transferring, tap "✅ I've transferred" button.`,
  btnConfirmCardPayment: `✅ I've transferred`,
  payCardPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Order placed!</b>\n\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.hourglass} Your order will be processed after admin confirms the transfer.\n` +
    `Usually confirmed within <b>1–24 hours</b>.`,
  payCryptoConfirmNote: `After completing the transaction, tap "✅ I've paid" button.`,
  btnConfirmCryptoPayment: `✅ I've paid`,
  payCryptoPending: (data: { orderId: number }) =>
    `${e.checkBold} <b>Order placed!</b>\n\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.hourglass} Your order will be processed after admin verifies the transaction.\n` +
    `Usually confirmed within <b>30 minutes – 2 hours</b>.`,
  btnCancelManualOrder: `❌ Cancel Order`,
  manualOrderCancelled: `${e.cross} Order cancelled.`,
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
    `${e.gem} Amount: <b>${data.amount}</b>\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance}</b>\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.hourglass} Your order has been received by our team.\n` +
    `It will be processed and delivered within <b>1-24 hours</b>.`,
  orderDeliveredNotification: (data: {
    orderId: number;
    productName: string;
  }) =>
    `${e.party} <b>Your order is ready!</b>\n\n` +
    `${e.bag} Product: ${data.productName}\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `Access details are available in My Orders then Order Details.`,

  // Time Slot Selection
  schedulePickSlot: (data: { date: string }) =>
    `${e.calendar} <b>Select a Time Slot</b>\n\nChoose an available slot for <b>${data.date}</b>:\n\n${e.checkBold} = Available  |  ${e.cross} = Taken`,
  scheduleSlotFree: "Available",
  scheduleSlotFullAlert: `${e.cross} This slot is full. Please choose another.`,
  scheduleNoSlotsToday:
    `${e.cross} <b>No slots available</b>\n\n` +
    `Sorry, there are no available time slots for this product today.\n` +
    `Please try again tomorrow or contact support.`,
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
    `${e.calendar} Date: <b>${data.date}</b>\n` +
    `${e.clock} Time: <b>${data.timeSlot}</b>\n` +
    `${e.gem} Amount: <b>${data.amount}</b>\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance}</b>\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.bell} I'll remind you <b>${e.clock} 15 minutes</b> before the session starts.\n` +
    `Track your session status in <b>My Orders</b>.`,
  scheduleReminderNotification: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.bell} <b>Session Reminder!</b>\n\n` +
    `Your <b>${data.productName}</b> session starts in <b>15 minutes</b>.\n` +
    `${e.clock} Time: <b>${data.timeSlot}</b>\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.rocket} Get ready — our team will contact you soon.`,
  sessionStartedUser: (data: {
    orderId: number;
    productName: string;
    timeSlot: string;
  }) =>
    `${e.rocket} <b>Your session has started!</b>\n\n` +
    `${e.bag} Product: <b>${data.productName}</b>\n` +
    `${e.clock} Slot: <b>${data.timeSlot}</b>\n` +
    `${e.id} Order: #${data.orderId}\n\n` +
    `${e.key} The admin will send you the login details in this chat.\n` +
    `${e.sparkles} Ready? Let's go!`,

  // ── Stock notification ──────────────────────────────────────────────────────
  stockSubscribed: `🔔 We'll notify you when it's back in stock!`,
  stockAlreadySubscribed: `✅ You're already subscribed. We'll let you know when it's available.`,
  stockRestocked: (data: { productName: string }) =>
    `🎉 <b>Back in stock!</b>\n\n📦 <b>${data.productName}</b> is available again.\n\n🛍 Buy now before it sells out!`,

  // ── Inventory order flow ──────────────────────────────────────────────────
  enterQuantityPrompt: `📦 Enter the desired quantity:`,
  enterQuantityHint: `⚠️ Please enter a number only`,
  quantityInvalid: `${e.cross} Invalid quantity. Please enter a positive whole number.`,
  quantityExceedsStock: (data: { stock: number }) =>
    `${e.cross} Not enough stock. Available: <b>${data.stock}</b>`,
  quantityExceedsLimit: (data: { max: number }) =>
    `${e.cross} You can purchase a maximum of <b>${data.max}</b> items per order.`,
  warrantyDays: (data: { days: number }) =>
    `Warranty: <b>${data.days} days</b>`,
  termsTitle: `Terms & Conditions`,
  btnChangeQuantity: `✏️ Change Quantity`,
  inventoryOrderSummary: (data: {
    productName: string;
    qty: number;
    unitPrice: string;
    total: string;
    currency: string;
  }) =>
    `${e.clipboard} <b>Order Summary</b>\n\n` +
    `📦 Product: <b>${data.productName}</b>\n` +
    `🔢 Quantity: <b>${data.qty}</b>\n` +
    `💰 Unit price: <b>${data.unitPrice} ${data.currency}</b>\n` +
    `💵 Total: <b>${data.total} ${data.currency}</b>`,
  inventoryOrderSuccess: (data: {
    orderId: number;
    productName: string;
    qty: number;
    total: string;
    remainingBalance: string;
    currency: string;
  }) =>
    `${e.party} <b>Order completed!</b>\n\n` +
    `📦 Product: <b>${data.productName}</b>\n` +
    `🔢 Quantity: <b>${data.qty}</b>\n` +
    `💵 Amount paid: <b>${data.total} ${data.currency}</b>\n` +
    `${e.wallet} Remaining balance: <b>${data.remainingBalance} ${data.currency}</b>\n` +
    `${e.id} Order: #${data.orderId}`,
  inventoryDeliveryHeader: (data: { productName: string }) =>
    `${e.key} <b>Delivery: ${data.productName}</b>`,
  inventoryDeliveryItem: (data: { index: number; content: string }[]) =>
    `${e.fire} با تشکر از خرید شما دوست عزیز \n\n` +
    `${e.bag} سفارش شما آماده \n\n` +
    data.map((item) => `<b>#${item.index}</b>\n${item.content}`).join("\n\n") +
    "\n\n\n" +
    `${e.truck} باز هم یه فروشگاه ما سر بزنید \n` +
    `${e.sparkles} مشتاقانه منتظر شما هستیم `,

  // Blocked user
  userBlocked:
    `⛔ <b>Your access has been restricted</b>\n\n` +
    `Your account has been suspended by administration. If you believe this is a mistake, please contact support.`,
  userBlockedWithReason: (reason: string) =>
    `⛔ <b>Your access has been restricted</b>\n\n` +
    `📝 Reason: ${reason}\n\n` +
    `If you believe this is a mistake, please contact support.`,

  // Maintenance mode
  botMaintenance:
    `🔧 <b>Bot is temporarily unavailable</b>\n\n` +
    `We are performing maintenance or updates. We'll be back shortly. Thank you for your patience ༉`,
  botMaintenanceCustom: (msg: string) => `🔧 ${msg}`,

  // Feature disabled messages
  referralDisabled: `🔒 <b>Referral System Unavailable</b>\n\nThe referral program is temporarily disabled.`,
  shopDisabled: `🔒 <b>Shop Unavailable</b>\n\nThe shop is temporarily disabled. Please try again later.`,
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
  regionNotFound: "region not found ❌",
} satisfies ShouldFollowLanguageStrict<typeof fa>;
