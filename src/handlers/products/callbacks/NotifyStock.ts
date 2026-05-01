import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  CategoryRepository,
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import {
  categoriesKeyboard,
  productsListKeyboard,
  productDetailsKeyboard,
  productPlansKeyboard,
  orderConfirmationKeyboard,
  backToMainKeyboard,
} from "../../../shared/keyboards/index.ts";

export async function NotifyStockCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  // TODO: Implement stock notification system
  await context.answerCallbackQuery(
    "✅ You will be notified when this product is available",
  );
}
