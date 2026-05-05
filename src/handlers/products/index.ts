import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { ProductCallback } from "./callbacks/Products.ts";
import { ProductCallback as ProductDetailCallback } from "./callbacks/Product.ts";
import { CategoriesCallback } from "./callbacks/Categories.ts";
import { CategoryCallBack } from "./callbacks/Category.ts";
import { BuyProductCallback } from "./callbacks/BuyProduct.ts";
import { SelectPlanCallback } from "./callbacks/SelectPlan.ts";
import { NotifyStockCallback } from "./callbacks/NotifyStock.ts";
import { CancelOrderCallback } from "./callbacks/CancelOrder.ts";
import { ConfirmOrderCallback } from "./callbacks/ConfirmOrder.ts";
import { AddDiscountCallback } from "./callbacks/AddDiscount.ts";

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
  .callbackQuery(/^confirm_order_(\d+)$/, async (context) => {
    return await ConfirmOrderCallback(context);
  })
  .callbackQuery(/^notify_stock_(\d+)$/, async (context) => {
    return await NotifyStockCallback(context);
  })
  .callbackQuery("cancel_order", async (context) => {
    return await CancelOrderCallback(context);
  })
  .callbackQuery(/^add_discount_(\d+)$/, async (context) => {
    return await AddDiscountCallback(context);
  });
