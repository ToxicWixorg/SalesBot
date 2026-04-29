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
export { settingsKeyboard } from "./settings.ts";

// Invite (Referral) Keyboards
export { inviteKeyboard, referralListKeyboard } from "./invite.ts";

// Discount Code Keyboards
export {
  discountMainKeyboard,
  discountEnterKeyboard,
  discountValidKeyboard,
  discountInvalidKeyboard,
  discountHistoryKeyboard,
} from "./discount.ts";

// Pagination & List Keyboards
export { paginationKeyboard, listItemKeyboard } from "./pagination.ts";

// Products Keyboards
export {
  categoriesKeyboard,
  productsListKeyboard,
  productDetailsKeyboard,
  productPlansKeyboard,
  orderConfirmationKeyboard,
} from "./products.ts";

// Wallet Keyboards

export {
  walletKeyboard,
  walletRechargeKeyboard,
  walletHistoryKeyboard,
  rechargeCryptoKeyboard,
  rechargeCardKeyboard,
  rechargeZarinpalKeyboard,
} from "./wallet.ts";
