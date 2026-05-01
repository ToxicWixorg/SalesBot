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

      message += `✅ سفارش #${order.id}\n`;
      message += `📦 ${product?.name || "محصول"}\n`;
      message += `📅 ${formatDate(order.createdAt)}\n`;
      message += `✨ تحویل: ${order.deliveredAt ? formatDate(order.deliveredAt) : "-"}\n`;
      message += `💰 ${formatPrice(order.finalPrice)} تومان\n`;
      message += `\n`;
    }

    message += `\n${t("ordersSelectOne")}`;

    // ایجاد دکمه‌های سفارشات
    const keyboard = ordersListKeyboard(t);
    for (const order of orders.slice(0, 10)) {
      keyboard.row().text(`📦 سفارش #${order.id}`, `order_${order.id}`);
    }

    await context.editText(message, {
      reply_markup: keyboard,
    });

    await context.answerCallbackQuery();
  } catch (error) {
    console.error("[ORDERS] Error filtering completed orders:", error);
    await context.answerCallbackQuery({
      text: "❌ خطا در دریافت سفارشات",
      show_alert: true,
    });
  }
}
