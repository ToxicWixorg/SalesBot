import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";

import { DiscountCallback } from "./callbacks/Discount.ts";
import { EnterDiscountCodeCallback } from "./callbacks/EnterDiscountCode.ts";
import { DiscountHistoryCallback } from "./callbacks/DiscountHistory.ts";

export const discountComposer = new Composer()
  .extend(composer)
  .callbackQuery("discount", async (context) => {
    return await DiscountCallback(context);
  })
  .callbackQuery("enter_discount_code", async (context) => {
    return await EnterDiscountCodeCallback(context);
  })
  .callbackQuery("discount_history", async (context) => {
    return await DiscountHistoryCallback(context);
  });
