import { Composer, InlineKeyboard } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { OrderRepository } from "../repositories/OrderRepository.ts";
import { ProductRepository } from "../repositories/ProductRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import {
  ordersListKeyboard,
  orderDetailsKeyboard,
  backToOrdersKeyboard,
} from "../shared/keyboards/index.ts";
import { mainMenuKeyboard } from "../shared/keyboards/main-menu.ts";

/**
 * دریافت emoji و رنگ برای هر وضعیت سفارش
 */
function getOrderStatusInfo(status: string) {
  const statusMap: Record<
    string,
    { emoji: string; text: string; color: string }
  > = {
    pending_payment: { emoji: "⏳", text: "در انتظار پرداخت", color: "🟡" },
    paid: { emoji: "✅", text: "پرداخت شده", color: "🟢" },
    pending_admin: { emoji: "👨‍💼", text: "در انتظار بررسی", color: "🟡" },
    waiting_schedule: {
      emoji: "📅",
      text: "نیاز به انتخاب زمان",
      color: "🟠",
    },
    scheduled: { emoji: "🗓️", text: "زمان‌بندی شده", color: "🔵" },
    reminder_sent: { emoji: "🔔", text: "یادآوری ارسال شد", color: "🔵" },
    waiting_user_online: {
      emoji: "👤",
      text: "در انتظار حضور شما",
      color: "🟡",
    },
    user_not_responding: {
      emoji: "⚠️",
      text: "پاسخ داده نشده",
      color: "🟠",
    },
    waiting_invite: {
      emoji: "📨",
      text: "در انتظار ارسال دعوتنامه",
      color: "🔵",
    },
    invite_sent: { emoji: "📧", text: "دعوتنامه ارسال شد", color: "🟢" },
    waiting_user_action: {
      emoji: "🔄",
      text: "نیاز به اقدام شما",
      color: "🟡",
    },
    join_link_sent: { emoji: "🔗", text: "لینک Join ارسال شد", color: "🟢" },
    in_queue: { emoji: "⏰", text: "در صف انتظار", color: "🟡" },
    in_progress: { emoji: "🔄", text: "در حال انجام", color: "🔵" },
    active: { emoji: "✨", text: "فعال", color: "🟢" },
    expiring_soon: { emoji: "⚡", text: "نزدیک به پایان", color: "🟠" },
    completed: { emoji: "✅", text: "تکمیل شده", color: "🟢" },
    cancelled: { emoji: "❌", text: "لغو شده", color: "🔴" },
    refunded: { emoji: "💰", text: "بازگشت وجه", color: "🟣" },
    failed: { emoji: "⛔", text: "ناموفق", color: "🔴" },
    rescheduled: { emoji: "🔄", text: "زمان تغییر کرد", color: "🔵" },
  };

  return statusMap[status] || { emoji: "❓", text: status, color: "⚪" };
}

/**
 * فرمت کردن تاریخ
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * فرمت کردن قیمت
 */
function formatPrice(price: string | number): string {
  return Number(price).toLocaleString("fa-IR");
}

export const ordersComposer = new Composer()
  .extend(composer)

  /**
   * نمایش لیست سفارشات
   */
  .callbackQuery("my_orders", async (context) => {
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
  })

  /**
   * فیلتر سفارشات - فعال
   */
  .callbackQuery("orders_filter_active", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) return;

    const t = i18n.buildT(user.languageCode || "fa");

    try {
      const orders = await OrderRepository.findByUserId(userId);
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
        const statusInfo = getOrderStatusInfo(order.status);

        message += `${statusInfo.color} سفارش #${order.id}\n`;
        message += `📦 ${product?.name || "محصول"}\n`;
        message += `${statusInfo.emoji} ${statusInfo.text}\n`;
        message += `📅 ${formatDate(order.createdAt)}\n`;
        message += `💰 ${formatPrice(order.finalPrice)} تومان\n`;
        message += `\n`;
      }

      message += `\n${t("ordersSelectOne")}`;

      // ایجاد دکمه‌های سفارشات
      const keyboard = ordersListKeyboard(t);
      for (const order of activeOrders.slice(0, 10)) {
        keyboard.text(`📦 سفارش #${order.id}`, `order_${order.id}`).row();
      }

      await context.editText(message, {
        reply_markup: keyboard,
      });

      await context.answerCallbackQuery();
    } catch (error) {
      console.error("[ORDERS] Error filtering active orders:", error);
      await context.answerCallbackQuery({
        text: "❌ خطا در دریافت سفارشات",
        show_alert: true,
      });
    }
  })

  /**
   * فیلتر سفارشات - تکمیل شده
   */
  .callbackQuery("orders_filter_completed", async (context) => {
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
        keyboard.text(`📦 سفارش #${order.id}`, `order_${order.id}`).row();
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
  })

  /**
   * فیلتر سفارشات - همه
   */
  .callbackQuery("orders_filter_all", async (context) => {
    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) return;

    const t = i18n.buildT(user.languageCode || "fa");

    try {
      const orders = await OrderRepository.findByUserId(userId);

      if (orders.length === 0) {
        await context.answerCallbackQuery({
          text: t("ordersEmpty"),
          show_alert: true,
        });
        return;
      }

      let message = `${t("ordersAllTitle")}\n\n`;

      for (const order of orders.slice(0, 10)) {
        const product = await ProductRepository.findById(order.productId);
        const statusInfo = getOrderStatusInfo(order.status);

        message += `${statusInfo.color} سفارش #${order.id}\n`;
        message += `📦 ${product?.name || "محصول"}\n`;
        message += `${statusInfo.emoji} ${statusInfo.text}\n`;
        message += `📅 ${formatDate(order.createdAt)}\n`;
        message += `💰 ${formatPrice(order.finalPrice)} تومان\n`;
        message += `\n`;
      }

      message += `\n${t("ordersSelectOne")}`;

      // ایجاد دکمه‌های سفارشات
      const keyboard = ordersListKeyboard(t);
      for (const order of orders.slice(0, 10)) {
        keyboard.text(`📦 سفارش #${order.id}`, `order_${order.id}`).row();
      }

      await context.editText(message, {
        reply_markup: keyboard,
      });

      await context.answerCallbackQuery();
    } catch (error) {
      console.error("[ORDERS] Error filtering all orders:", error);
      await context.answerCallbackQuery({
        text: "❌ خطا در دریافت سفارشات",
        show_alert: true,
      });
    }
  })

  /**
   * نمایش جزئیات سفارش
   */
  .callbackQuery(/^order_(\d+)$/, async (context) => {
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
        parse_mode: "Markdown",
        reply_markup: orderDetailsKeyboard(t, order, product),
      });

      await context.answerCallbackQuery();
    } catch (error) {
      console.error("[ORDERS] Error fetching order details:", error);
      await context.answerCallbackQuery({
        text: "❌ خطا در دریافت جزئیات سفارش",
        show_alert: true,
      });
    }
  })

  /**
   * بازگشت به لیست سفارشات
   */
  .callbackQuery("back_to_orders", async (context) => {
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
  })

  /**
   * باز کردن تیکت برای سفارش
   */
  .callbackQuery(/^order_open_ticket_(\d+)$/, async (context) => {
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

      // Trigger ticket creation flow
      await context.answerCallbackQuery();
      // The callback is already registered in ticket-scenes.ts
    } catch (error) {
      console.error("[ORDERS] Error opening ticket:", error);
      await context.answerCallbackQuery({
        text: "❌ خطا در باز کردن تیکت",
        show_alert: true,
      });
    }
  })

  /**
   * تمدید اشتراک
   */
  .callbackQuery(/^order_renew_(\d+)$/, async (context) => {
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
  })

  /**
   * تغییر زمان سفارش
   */
  .callbackQuery(/^order_reschedule_(\d+)$/, async (context) => {
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

      if (!["waiting_schedule", "scheduled"].includes(order.status)) {
        await context.answerCallbackQuery({
          text: t("orderCannotReschedule"),
          show_alert: true,
        });
        return;
      }

      // TODO: پیاده‌سازی سیستم تغییر زمان
      await context.answerCallbackQuery({
        text: t("orderRescheduleComingSoon"),
        show_alert: true,
      });
    } catch (error) {
      console.error("[ORDERS] Error rescheduling order:", error);
      await context.answerCallbackQuery({
        text: "❌ خطا در تغییر زمان",
        show_alert: true,
      });
    }
  })

  /**
   * گزارش مشکل
   */
  .callbackQuery(/^order_report_problem_(\d+)$/, async (context) => {
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
  });
