import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { ordersListKeyboard } from "../../../shared/keyboards/index.ts";

export async function MyOrderCallback(context: Context) {
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) {
    return context.answerCallbackQuery({
      text: "❌ کاربر یافت نشد",
    });
  }

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const orders = await OrderRepository.findByUserId(userId);

    if (orders.length === 0) {
      await context.editText(t("ordersEmpty"), {
        reply_markup: new InlineKeyboard()
          .text(t("btnProducts"), "products")
          .row()
          .text(t("btnMainMenu"), "main_menu"),
      });
      return;
    }

    // گروه‌بندی سفارشات بر اساس وضعیت
    const activeOrders = orders.filter((o) =>
      [
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

    const completedOrders = orders.filter((o) => o.status === "completed");
    const otherOrders = orders.filter(
      (o) => !activeOrders.includes(o) && !completedOrders.includes(o),
    );

    let message = `${t("ordersTitle")}\n\n`;
    message += `${t("ordersTotal")}: ${orders.length}\n`;
    message += `${t("ordersActive")}: ${activeOrders.length}\n`;
    message += `${t("ordersCompleted")}: ${completedOrders.length}\n\n`;
    message += t("ordersSelectFilter");

    await context.editText(message, {
      reply_markup: ordersListKeyboard(t),
    });

    await context.answerCallbackQuery();
  } catch (error) {
    console.error("[ORDERS] Error fetching orders:", error);
    await context.answerCallbackQuery({
      text: "❌ خطا در دریافت سفارشات",
      show_alert: true,
    });
  }
}
