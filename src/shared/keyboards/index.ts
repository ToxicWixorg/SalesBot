/**
 * Centralized keyboard definitions for the bot
 * Import keyboards from this file to maintain consistency
 */

// Main Menu Keyboards
export { mainMenuKeyboard } from "./main-menu.ts";

// Navigation Keyboards
export { backKeyboard, cancelKeyboard, backToMainKeyboard } from "./back.ts";

// Confirmation Keyboards
export {
  confirmationKeyboard,
  confirmWithCancelKeyboard,
} from "./confirmation.ts";

// Settings Keyboards
export { settingsKeyboard } from "./settings/settings.ts";
export { notificationSettingsKeyboard } from "./settings/notifications.ts";
export { privacySettingsKeyboard } from "./settings/privacy.ts";
export { settingsConfirmationKeyboard } from "./settings/settingsConfirmation.ts";

// Invite (Referral) Keyboards
export { inviteKeyboard } from "./invite/invite.ts";
export { referralListKeyboard } from "./invite/referralList.ts";

// Discount Code Keyboards
export { discountMainKeyboard } from "./discount/main.ts";
export { discountEnterKeyboard } from "./discount/Enter.ts";
export { discountValidKeyboard } from "./discount/Valid.ts";
export { discountInvalidKeyboard } from "./discount/invalid.ts";
export { discountHistoryKeyboard } from "./discount/history.ts";

// Pagination & List Keyboards
export { paginationKeyboard } from "./pagination/pagination.ts";
export { listItemKeyboard } from "./pagination/listItem.ts";

// Products Keyboards
export { premiumCategoriesKeyboard } from "./products/categories.ts";
export { premiumProductsListKeyboard } from "./products/list.ts";
export { productDetailsKeyboard } from "./products/details.ts";
export { productPlansKeyboard } from "./products/plans.ts";
export { orderConfirmationKeyboard } from "./products/confirmation.ts";
export {
  enterQuantityKeyboard,
  inventoryOrderSummaryKeyboard,
} from "./products/inventoryOrder.ts";

// Wallet Keyboards
export { walletKeyboard } from "./wallet/wallet.ts";
export { walletRechargeKeyboard } from "./wallet/recharge.ts";
export { walletHistoryKeyboard } from "./wallet/history.ts";
export { rechargeCryptoKeyboard } from "./wallet/crypto.ts";
export { rechargeCardKeyboard } from "./wallet/card.ts";
export { rechargeZarinpalKeyboard } from "./wallet/zarinpal.ts";

// Orders Keyboards
export { ordersListKeyboard } from "./orders/list.ts";
export { orderDetailsKeyboard } from "./orders/details.ts";
export { backToOrdersKeyboard } from "./orders/backToOrders.ts";

// Support Keyboards
export { supportKeyboard } from "./support/support.ts";

// Ticket & Forum group Keyboards
export { ticketKeyboard } from "./forumGroup/ticket.ts";

export { newRefKeyboard } from "./notifications.ts/newRef.ts";

export { mainKeyboard } from "./adminPanel/mainKeyboard.ts";
export {
  adminPanelCategoriesKeyboard,
  adminPanelCategoryKeyboard,
  adminPanelProductsListKeyboard,
  adminPanelProductDetailsKeyboard,
  adminPanelProductPlansKeyboard,
  adminPanelPlanKeyboard,
} from "./adminPanel/products.ts";
