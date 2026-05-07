import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { ProductCallback } from "./callbacks/Products.ts";
import { ProductCallback as ProductDetailCallback } from "./callbacks/Product.ts";
import { CategoriesCallback } from "./callbacks/Categories.ts";
import { CategoryCallBack } from "./callbacks/Category.ts";
import { BuyProductCallback } from "./callbacks/BuyProduct.ts";
import { SelectPlanCallback } from "./callbacks/SelectPlan.ts";
import { SelectRegionCallback } from "./callbacks/SelectRegion.ts";
import { CancelOrderCallback } from "./callbacks/CancelOrder.ts";
import { ConfirmOrderCallback } from "./callbacks/ConfirmOrder.ts";
import { AddDiscountCallback } from "./callbacks/AddDiscount.ts";
import { ConfirmInventoryOrderCallback } from "./callbacks/ConfirmInventoryOrder.ts";
import { NotifyStockCallback } from "./callbacks/NotifyStock.ts";
import { pendingQuantityState } from "./quantityOrderState.ts";
import { UserRepository } from "../../repositories/UserRepository.ts";
import { InventoryRepository } from "../../repositories/InventoryRepository.ts";
import { i18n } from "../../shared/locales/index.ts";
import { enterQuantityKeyboard } from "../../shared/keyboards/index.ts";

export const productsComposer = new Composer()
  .extend(composer)
  .callbackQuery("products", async (context) => {
    return await ProductCallback(context);
  })
  .callbackQuery("categories", async (context) => {
    return await CategoriesCallback(context);
  })
  .callbackQuery(/^category_(\d+)$/, async (context) => {
    return await CategoryCallBack(context);
  })
  .callbackQuery(/^product_(\d+)$/, async (context) => {
    return await ProductDetailCallback(context);
  })
  .callbackQuery(/^buy_product_(\d+)$/, async (context) => {
    return await BuyProductCallback(context);
  })
  .callbackQuery(/^select_plan_(\d+)$/, async (context) => {
    return await SelectPlanCallback(context);
  })
  .callbackQuery(/^select_region_(\d+)_(\d+)$/, async (context) => {
    return await SelectRegionCallback(context);
  })
  .callbackQuery(/^confirm_order_(\d+)$/, async (context) => {
    return await ConfirmOrderCallback(context);
  })
  .callbackQuery("cancel_order", async (context) => {
    return await CancelOrderCallback(context);
  })
  .callbackQuery(/^add_discount_(\d+)$/, async (context) => {
    return await AddDiscountCallback(context);
  })
  // Inventory order: confirm after quantity selected
  .callbackQuery(/^confirm_inv_(\d+)_(\d+)$/, async (context) => {
    return await ConfirmInventoryOrderCallback(context);
  })
  // Inventory order: user wants to change the quantity
  .callbackQuery(/^change_qty_(\d+)$/, async (context) => {
    await context.answerCallbackQuery();
    const userId = context.from?.id;
    if (!userId) return;

    const state = pendingQuantityState.get(userId);
    if (!state) return;

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");
    const liveStock = await InventoryRepository.countAvailable(state.productId);

    pendingQuantityState.set(userId, { ...state, availableStock: liveStock });

    await context.editText(
      `${t("enterQuantityPrompt")}\n${t("enterQuantityHint")}`,
      {
        parse_mode: "HTML",
        reply_markup: enterQuantityKeyboard(t, state.productId),
      },
    );
  })
  // Stock notification subscription
  .callbackQuery(/^notify_stock_(\d+)$/, async (context) => {
    return await NotifyStockCallback(context);
  });
