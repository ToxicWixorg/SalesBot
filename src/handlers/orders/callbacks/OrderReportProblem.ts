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

export async function OrderReportPeroblemCallback(context: Context) {
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

    // TODO: پیاده‌سازی سیستم گزارش مشکل
    await context.answerCallbackQuery({
      text: t("orderReportComingSoon"),
      show_alert: true,
    });
  } catch (error) {
    console.error("[ORDERS] Error reporting problem:", error);
    await context.answerCallbackQuery({
      text: "❌ خطا در گزارش مشکل",
      show_alert: true,
    });
  }
}
