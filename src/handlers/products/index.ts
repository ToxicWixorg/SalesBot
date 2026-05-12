import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { i18n } from "../../shared/locales/index.ts";
import { UserRepository } from "../../repositories/UserRepository.ts";
import { InventoryRepository } from "../../repositories/InventoryRepository.ts";
import { backToMainKeyboard } from "../../shared/keyboards/index.ts";
import { ConfirmOrderCallback } from "./callbacks/ConfirmOrderCallback.ts";
import { ProductsCallback } from "./callbacks/ProductsCallback.ts";
import { CategoriesCallback } from "./callbacks/CategoriesCallback.ts";
import { CategoryCallback } from "./callbacks/CategoryCallback.ts";
import { ProductCallback } from "./callbacks/ProductCallback.ts";
import { BuyProductCallback } from "./callbacks/BuyProductCallback.ts";
import { SelectPlanCallback } from "./callbacks/SelectPlanCallback.ts";
import { SelectRegionCallback } from "./callbacks/SelectRegionCallback.ts";
import { AddDiscountCallback } from "./callbacks/AddDiscountCallback.ts";
import { NotifyStockCallback } from "./callbacks/NotifyStockCallback.ts";

async function getEffectiveStock(product: {
  id: number;
  stock: number | null;
}): Promise<number> {
  const inventoryStock = await InventoryRepository.countAvailable(product.id);
  if (inventoryStock > 0) return inventoryStock;
  return product.stock ?? 0;
}

export const productsComposer = new Composer()
  .extend(composer)
  .callbackQuery("products", async (context) => {
    return await ProductsCallback(context);
  })
  .callbackQuery("categories", async (context) => {
    return await CategoriesCallback(context);
  })
  .callbackQuery(/^category_(\d+)$/, async (context) => {
    return await CategoryCallback(context);
  })
  .callbackQuery(/^product_(\d+)$/, async (context) => {
    return await ProductCallback(context, getEffectiveStock);
  })
  .callbackQuery(/^buy_product_(\d+)$/, async (context) => {
    return await BuyProductCallback(context, getEffectiveStock);
  })
  .callbackQuery(/^select_plan_(\d+)$/, async (context) => {
    return await SelectPlanCallback(context);
  })
  .callbackQuery(/^select_region_(\d+)_(\d+)$/, async (context) => {
    return await SelectRegionCallback(context);
  })
  .callbackQuery(/^confirm_order_(\d+)$/, async (context) => {
    if (!context.from || !context.queryData) return;
    return await ConfirmOrderCallback(context);
  })
  .callbackQuery(/^add_discount_(\d+)$/, async (context) => {
    return await AddDiscountCallback(context);
  })
  .callbackQuery(/^notify_stock_(\d+)$/, async (context) => {
    return await NotifyStockCallback(context);
  })
  .callbackQuery("cancel_order", async (context) => {
    if (!context.from) return;

    const user = await UserRepository.findById(context.from.id);
    const t = i18n.buildT(user?.languageCode ?? "fa");

    await context.editText(t("mainMenu"), {
      parse_mode: "HTML",
      reply_markup: backToMainKeyboard(t),
    });
  });
