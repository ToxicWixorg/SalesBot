import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { ordersListKeyboard } from "../../../shared/keyboards/index.ts";

export async function OrderFilterCompletedCallback(
  context: Context,
  formatDate: any,
  formatPrice: any,
) {
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const orders = await OrderRepository.findByUserIdAndStatus(
      userId,
      "completed",
    );

    if (orders.length === 0) {
      await context.answerCallbackQuery({
        text: t("ordersNoCompleted"),
        show_alert: true,
      });
      return;
    }

    let message = `${t("ordersCompletedTitle")}\n\n`;

    for (const order of orders.slice(0, 10)) {
      const product = await ProductRepository.findById(order.productId);

      message += `✅ ${t("ordersOrderLabel", { orderId: order.id })}\n`;
      message += `📦 ${product?.name || t("ordersProductFallback")}\n`;
      message += `📅 ${formatDate(order.createdAt)}\n`;
      message += `✨ ${t("ordersDeliveredLabel")}: ${order.deliveredAt ? formatDate(order.deliveredAt) : "-"}\n`;
      message += `💰 ${formatPrice(order.finalPrice)} ${t("currency")}\n`;
      message += `\n`;
    }

    message += `\n${t("ordersSelectOne")}`;

    // ایجاد دکمه‌های سفارشات
    const keyboard = ordersListKeyboard(t);
    for (const order of orders.slice(0, 10)) {
      keyboard
        .row()
        .text(
          `📦 ${t("ordersOrderLabel", { orderId: order.id })}`,
          `order_${order.id}`,
        );
    }

    await context.editText(message, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  } catch (error) {
    console.error("[ORDERS] Error filtering completed orders:", error);
    await context.answerCallbackQuery({
      text: t("errorFetchingOrders"),
      show_alert: true,
    });
  }
}
