import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { i18n } from "../../shared/locales/index.ts";
import { UserRepository } from "../../repositories/UserRepository.ts";
import { mainCallback } from "./callbacks/mainCallback.ts";
import { AdminService } from "../../services/bot/admin/Service.ts";
import {
  adminPanelProductsCallback,
  adminCategoryCallback,
  adminCategoryProductsCallback,
  adminProductCallback,
  adminProductPlansCallback,
  adminPlanCallback,
  adminCreateCategoryCallback,
  adminCreateProductCallback,
  adminCreatePlanCallback,
  adminEditCategoryCallback,
  adminEditCategoryEmojiCallback,
  adminEditProductCallback,
  adminEditProductEmojiCallback,
  adminEditPlanCallback,
  adminEditPlanEmojiCallback,
  adminEditPlanPriceCallback,
  adminDeleteCategoryCallback,
  adminDeleteProductCallback,
  adminDeletePlanCallback,
  adminPlanDeliveryCallback,
  adminPlanSetDeliveryCallback,
  adminPlanRequirementsCallback,
  adminPlanAddFieldCallback,
  adminPlanDeleteFieldCallback,
  adminPlanToggleActiveCallback,
  adminEditPlanDescCallback,
  adminEditPlanDurationCallback,
  adminEditPlanOrderCallback,
  adminPlanInventoryCallback,
  adminPlanAddStockCallback,
  adminPlanClearStockCallback,
  adminPlanItemsCallback,
  adminInventoryItemCallback,
  adminInventoryDeleteItemCallback,
} from "./callbacks/products.ts";

export const adminPanelComposer = new Composer()
  .extend(composer)
  .callbackQuery("admin_panel", async (context) => {
    const userId = context.from?.id;
    if (!userId) {
      return context.answerCallbackQuery("❌ Unable to identify user.");
    }

    const isAdmin = await AdminService.isAdmin(userId);
    if (!isAdmin) {
      return context.answerCallbackQuery("⛔ Staff only");
    }

    await mainCallback(context);
  })
  .callbackQuery("panel_products", async (context) => {
    return await adminPanelProductsCallback(context);
  })
  .callbackQuery(/^admin_category_(\d+)$/, async (context) => {
    return await adminCategoryCallback(context);
  })
  .callbackQuery(/^admin_category_products_(\d+)$/, async (context) => {
    return await adminCategoryProductsCallback(context);
  })
  .callbackQuery(/^admin_product_(\d+)$/, async (context) => {
    return await adminProductCallback(context);
  })
  .callbackQuery(/^admin_product_plans_(\d+)$/, async (context) => {
    return await adminProductPlansCallback(context);
  })
  .callbackQuery(/^admin_plan_(\d+)$/, async (context) => {
    return await adminPlanCallback(context);
  })
  .callbackQuery("admin_create_category", async (context) => {
    return await adminCreateCategoryCallback(context);
  })
  .callbackQuery(/^admin_create_product_(\d+)$/, async (context) => {
    return await adminCreateProductCallback(context);
  })
  .callbackQuery(/^admin_create_plan_(\d+)$/, async (context) => {
    return await adminCreatePlanCallback(context);
  })
  .callbackQuery(/^admin_edit_category_(\d+)$/, async (context) => {
    return await adminEditCategoryCallback(context);
  })
  .callbackQuery(/^admin_edit_category_emoji_(\d+)$/, async (context) => {
    return await adminEditCategoryEmojiCallback(context);
  })
  .callbackQuery(/^admin_edit_product_(\d+)$/, async (context) => {
    return await adminEditProductCallback(context);
  })
  .callbackQuery(/^admin_edit_product_emoji_(\d+)$/, async (context) => {
    return await adminEditProductEmojiCallback(context);
  })
  .callbackQuery(/^admin_edit_plan_price_(\d+)$/, async (context) => {
    return await adminEditPlanPriceCallback(context);
  })
  .callbackQuery(/^admin_edit_plan_(\d+)$/, async (context) => {
    return await adminEditPlanCallback(context);
  })
  .callbackQuery(/^admin_edit_plan_emoji_(\d+)$/, async (context) => {
    return await adminEditPlanEmojiCallback(context);
  })
  .callbackQuery(/^admin_delete_category_(\d+)$/, async (context) => {
    return await adminDeleteCategoryCallback(context);
  })
  .callbackQuery(/^admin_delete_product_(\d+)$/, async (context) => {
    return await adminDeleteProductCallback(context);
  })
  .callbackQuery(/^admin_delete_plan_(\d+)$/, async (context) => {
    return await adminDeletePlanCallback(context);
  })
  .callbackQuery(
    /^admin_plan_setdelivery_(\d+)_([a-z_]+)$/,
    async (context) => {
      return await adminPlanSetDeliveryCallback(context);
    },
  )
  .callbackQuery(/^admin_plan_delivery_(\d+)$/, async (context) => {
    return await adminPlanDeliveryCallback(context);
  })
  .callbackQuery(/^admin_plan_addfield_(\d+)$/, async (context) => {
    return await adminPlanAddFieldCallback(context);
  })
  .callbackQuery(/^admin_plan_delfield_(\d+)_(\d+)$/, async (context) => {
    return await adminPlanDeleteFieldCallback(context);
  })
  .callbackQuery(/^admin_plan_reqs_(\d+)$/, async (context) => {
    return await adminPlanRequirementsCallback(context);
  })
  .callbackQuery(/^admin_plan_toggleactive_(\d+)$/, async (context) => {
    return await adminPlanToggleActiveCallback(context);
  })
  .callbackQuery(/^admin_plan_desc_(\d+)$/, async (context) => {
    return await adminEditPlanDescCallback(context);
  })
  .callbackQuery(/^admin_plan_duration_(\d+)$/, async (context) => {
    return await adminEditPlanDurationCallback(context);
  })
  .callbackQuery(/^admin_plan_order_(\d+)$/, async (context) => {
    return await adminEditPlanOrderCallback(context);
  })
  .callbackQuery(/^admin_plan_inventory_(\d+)$/, async (context) => {
    return await adminPlanInventoryCallback(context);
  })
  .callbackQuery(/^admin_plan_addstock_(\d+)$/, async (context) => {
    return await adminPlanAddStockCallback(context);
  })
  .callbackQuery(/^admin_plan_clearstock_(\d+)$/, async (context) => {
    return await adminPlanClearStockCallback(context);
  })
  .callbackQuery(/^admin_plan_items_(\d+)(?:_(\d+))?$/, async (context) => {
    return await adminPlanItemsCallback(context);
  })
  .callbackQuery(/^admin_inv_item_(\d+)_(\d+)$/, async (context) => {
    return await adminInventoryItemCallback(context);
  })
  .callbackQuery(/^admin_inv_del_(\d+)_(\d+)$/, async (context) => {
    return await adminInventoryDeleteItemCallback(context);
  });

//   .callbackQuery("admin_panel", async (context) => {
//   if (!context.from) {
//     return context.answerCallbackQuery("❌ Unable to identify user.");
//   }

//   const userId = context.from.id;

//   let user = await UserRepository.findById(userId);
//   const t = i18n.buildT(user.languageCode || "en");
//   if (!user) {
//     return context.answerCallbackQuery("❌ Unable to identify user.");
//   }

//   if (user.role === "customer") {
//     await context.editReplyMarkup(mainMenuKeyboard(t, user.role));
//     return context.answerCallbackQuery("⛔ Staff only");
//   }

//   const keyboard = new InlineKeyboard()
//     .url(t("adminpanelBtnUrl"), config.ADMIN_PANEL_URL, {
//       style: "success",
//       icon_custom_emoji_id: "5258096772776991776",
//     })
//     .row()
//     .text(t("adminpanelBtnEmojies"), "get_custom_emoji", {
//       icon_custom_emoji_id: "6136464120779638846",
//     });

//   await context.send(t("adminpanelText", userId, user.role), {
//     parse_mode: "HTML",
//     reply_markup: keyboard,
//   });
// })
