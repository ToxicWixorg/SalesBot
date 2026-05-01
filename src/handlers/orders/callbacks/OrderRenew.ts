import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  ordersListKeyboard,
  orderDetailsKeyboard,
  backToOrdersKeyboard,
  mainMenuKeyboard,
} from "../../../shared/keyboards/index.ts";

export async function OrderRenewCallback(context: Context) {
  const orderId = parseInt(context.queryData[1]);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const order = await OrderRepository.findById(orderId);

    if (!order || Number(order.userId) !== userId) {
      await context.answerCallbackQuery({
        text: t("orderNotFound"),
        show_alert: true,
      });
      return;
    }

    const product = await ProductRepository.findById(order.productId);

    if (!product?.isRenewable) {
      await context.answerCallbackQuery({
        text: t("orderNotRenewable"),
        show_alert: true,
      });
      return;
    }

    // TODO: پیاده‌سازی سیستم تمدید
    await context.answerCallbackQuery({
      text: t("orderRenewComingSoon"),
      show_alert: true,
    });
  } catch (error) {
    console.error("[ORDERS] Error renewing order:", error);
    await context.answerCallbackQuery({
      text: "❌ خطا در تمدید سفارش",
      show_alert: true,
    });
  }
}
