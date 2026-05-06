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

export async function OrderRescheduleCallback(context: Context) {
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
        parse_mode: "HTML",
        show_alert: true,
      });
      return;
    }

    if (!["waiting_schedule", "scheduled"].includes(order.status)) {
      await context.answerCallbackQuery({
        text: t("orderCannotReschedule"),
        parse_mode: "HTML",
        show_alert: true,
      });
      return;
    }

    // TODO: پیاده‌سازی سیستم تغییر زمان
    await context.answerCallbackQuery({
      text: t("orderRescheduleComingSoon"),
        parse_mode: "HTML",
      show_alert: true,
    });
  } catch (error) {
    console.error("[ORDERS] Error rescheduling order:", error);
    await context.answerCallbackQuery({
      text: "❌ خطا در تغییر زمان",
        parse_mode: "HTML",
      show_alert: true,
    });
  }
}
