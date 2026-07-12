import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { ordersListKeyboard } from "../../../shared/keyboards/index.ts";

export async function OrderFilterActiveCallback(
  context: Context,
  getOrderStatusInfo: any,
  formatDate: any,
  formatPrice: any,
) {
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const orders = await OrderRepository.findByUserId(userId);
    const activeOrders = orders.filter((o) =>
      [
        "pending_payment",
        "paid",
        "pending_admin",
        "waiting_schedule",
        "scheduled",
        "in_progress",
        "active",
        "waiting_invite",
        "invite_sent",
        "waiting_user_action",
        "join_link_sent",
        "in_queue",
      ].includes(o.status),
    );

    if (activeOrders.length === 0) {
      await context.answerCallbackQuery({
        text: t("ordersNoActive"),
        show_alert: true,
      });
      return;
    }

    let message = `${t("ordersActiveTitle")}\n\n`;

    for (const order of activeOrders.slice(0, 10)) {
      const product = await ProductRepository.findById(order.productId);
      const statusInfo = getOrderStatusInfo(order.status, t);

      message += `${statusInfo.color} ${t("ordersOrderLabel", { orderId: order.id })}\n`;
      message += `📦 ${product?.name || t("ordersProductFallback")}\n`;
      message += `${statusInfo.emoji} ${statusInfo.text}\n`;
      message += `📅 ${formatDate(order.createdAt)}\n`;
      message += `💰 ${formatPrice(order.finalPrice)}\n`;
      message += `\n`;
    }

    message += `\n${t("ordersSelectOne")}`;

    // ایجاد دکمه‌های سفارشات
    const keyboard = ordersListKeyboard(t);
    for (const order of activeOrders.slice(0, 10)) {
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
    console.error("[ORDERS] Error filtering active orders:", error);
    await context.answerCallbackQuery({
      text: t("errorFetchingOrders"),
      show_alert: true,
    });
  }
}
