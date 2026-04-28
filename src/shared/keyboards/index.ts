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
