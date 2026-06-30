import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { i18n } from "../../shared/locales/index.ts";
import { UserRepository } from "../../repositories/UserRepository.ts";
import { InventoryRepository } from "../../repositories/InventoryRepository.ts";
import { backToMainKeyboard } from "../../shared/keyboards/index.ts";
import { ConfirmOrderCallback } from "./callbacks/ConfirmOrderCallback.ts";
import { PremiumCategoriesCallback } from "./callbacks/PremiumProducts/PremiumCategoriesCallback.ts";
import { PremiumCategoryCallback } from "./callbacks/PremiumProducts/PremiumCategoryCallback.ts";
import { SectionsCallback } from "./callbacks/SectionsCallback.ts";
import { BuyProductCallback } from "./callbacks/BuyProductCallback.ts";
import { SelectPlanCallback } from "./callbacks/SelectPlanCallback.ts";
import { SelectRegionCallback } from "./callbacks/SelectRegionCallback.ts";
import { AddDiscountCallback } from "./callbacks/AddDiscountCallback.ts";
import { NotifyStockCallback } from "./callbacks/NotifyStockCallback.ts";
import { PremiumProductsCallback } from "./callbacks/PremiumProducts/PremiumProductsCallback.ts";
import { PremiumProductCallback } from "./callbacks/PremiumProducts/PremiumProductCallback.ts";

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
  .command("products", async (context) => {
    return await SectionsCallback(context);
  })
  .callbackQuery("products", async (context) => {
    return await SectionsCallback(context);
  })
  .callbackQuery("premiumProducts", async (context) => {
    return await PremiumProductsCallback(context);
  })
  .callbackQuery("premiumCategories", async (context) => {
    return await PremiumCategoriesCallback(context);
  })
  .callbackQuery(/^premium_category_(\d+)$/, async (context) => {
    return await PremiumCategoryCallback(context);
  })
  .callbackQuery(/^premium_category_page_(\d+)_(\d+)$/, async (context) => {
    return await PremiumCategoryCallback(context);
  })
  .callbackQuery(/^product_(\d+)$/, async (context) => {
    return await PremiumProductCallback(context, getEffectiveStock);
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
  })
  .callbackQuery("noop", async (context) => {
    // No-op handler for non-interactive buttons (like page numbers)
    await context.answerCallbackQuery();
  });
