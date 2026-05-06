import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { orderDetailsKeyboard } from "../../../shared/keyboards/index.ts";

export async function OrderCallback(
  context: Context,
  getOrderStatusInfo: any,
  formatDate: any,
  formatPrice: any,
) {
  const orderId = parseInt(context.queryData[1]);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const order = await OrderRepository.findById(orderId);

    if (!order) {
      await context.answerCallbackQuery({
        text: t("orderNotFound"),
        show_alert: true,
      });
      return;
    }

    // بررسی مالکیت سفارش
    if (Number(order.userId) !== userId) {
      await context.answerCallbackQuery({
        text: t("orderAccessDenied"),
        show_alert: true,
      });
      return;
    }

    const product = await ProductRepository.findById(order.productId);
    const statusInfo = getOrderStatusInfo(order.status);

    let message = `${t("orderDetailsTitle")}\n\n`;
    message += `🆔 ${t("orderNumber")}: #${order.id}\n`;
    message += `📦 ${t("orderProduct")}: ${product?.name || "-"}\n`;
    message += `${statusInfo.color} ${t("orderStatus")}: ${statusInfo.emoji} ${statusInfo.text}\n`;
    message += `\n`;
    message += `💰 ${t("orderTotalPrice")}: ${formatPrice(order.totalPrice)} تومان\n`;

    if (Number(order.discountAmount) > 0) {
      message += `🎁 ${t("orderDiscount")}: ${formatPrice(order.discountAmount)} تومان\n`;
    }

    if (Number(order.walletUsed) > 0) {
      message += `💳 ${t("orderWalletUsed")}: ${formatPrice(order.walletUsed)} تومان\n`;
    }

    message += `✅ ${t("orderFinalPrice")}: ${formatPrice(order.finalPrice)} تومان\n`;
    message += `\n`;
    message += `📅 ${t("orderCreatedAt")}: ${formatDate(order.createdAt)}\n`;

    if (order.deliveredAt) {
      message += `✨ ${t("orderDeliveredAt")}: ${formatDate(order.deliveredAt)}\n`;
    }

    if (order.scheduledTime) {
      message += `🗓️ ${t("orderScheduledTime")}: ${formatDate(order.scheduledTime)}\n`;
    }

    // نمایش اطلاعات تحویل
    if (order.delivery && order.status === "completed") {
      message += `\n━━━━━━━━━━━━━━━━\n`;
      message += `📬 ${t("orderDeliveryInfo")}\n\n`;

      const delivery = order.delivery as any;

      if (delivery.code) {
        message += `🔐 ${t("orderDeliveryCode")}: \`${delivery.code}\`\n`;
      }

      if (delivery.email) {
        message += `📧 ${t("orderDeliveryEmail")}: ${delivery.email}\n`;
      }

      if (delivery.link) {
        message += `🔗 ${t("orderDeliveryLink")}: ${delivery.link}\n`;
      }

      if (delivery.instructions) {
        message += `\n📝 ${t("orderDeliveryInstructions")}:\n${delivery.instructions}\n`;
      }
    }

    if (order.notes) {
      message += `\n📝 ${t("orderNotes")}: ${order.notes}\n`;
    }

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderDetailsKeyboard(t, order, product),
    });

    await context.answerCallbackQuery();
  } catch (error) {
    console.error("[ORDERS] Error fetching order details:", error);
    await context.answerCallbackQuery({
      text: t("errorFetchingOrderDetails"),
      show_alert: true,
    });
  }
}
