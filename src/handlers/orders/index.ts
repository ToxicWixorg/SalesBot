import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { MyOrderCallback } from "./callbacks/MyOrders.ts";
import { OrderFilterAllCallback } from "./callbacks/OrderFilterAll.ts";
import { OrderFilterCompletedCallback } from "./callbacks/OrderFilterCompleted.ts";
import { OrderCallback } from "./callbacks/Order.ts";
import { BackToOrdersCallback } from "./callbacks/BackToOrders.ts";
import { OrderOpenTicketCallback } from "./callbacks/OrderOpenTicket.ts";
import { OrderRenewCallback } from "./callbacks/OrderRenew.ts";
import { OrderRescheduleCallback } from "./callbacks/OrderReschedule.ts";
import { OrderReportPeroblemCallback } from "./callbacks/OrderReportProblem.ts";

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

function formatPrice(price: string | number): string {
  return Number(price).toLocaleString("fa-IR");
}

export const ordersComposer = new Composer()
  .extend(composer)
  .callbackQuery("my_orders", async (context) => {
    return await MyOrderCallback(context);
  })
  .callbackQuery("orders_filter_active", async (context) => {
    return await OrderFilterAllCallback(
      context,
      getOrderStatusInfo,
      formatDate,
      formatPrice,
    );
  })
  .callbackQuery("orders_filter_completed", async (context) => {
    return await OrderFilterCompletedCallback(context, formatDate, formatPrice);
  })
  .callbackQuery("orders_filter_all", async (context) => {
    return await OrderFilterAllCallback(
      context,
      getOrderStatusInfo,
      formatDate,
      formatPrice,
    );
  })
  .callbackQuery(/^order_(\d+)$/, async (context) => {
    return await OrderCallback(
      context,
      getOrderStatusInfo,
      formatDate,
      formatPrice,
    );
  })
  .callbackQuery("back_to_orders", async (context) => {
    return await BackToOrdersCallback(context);
  })
  .callbackQuery(/^order_open_ticket_(\d+)$/, async (context) => {
    return await OrderOpenTicketCallback(context);
  })
  .callbackQuery(/^order_renew_(\d+)$/, async (context) => {
    return await OrderRenewCallback(context);
  })
  .callbackQuery(/^order_reschedule_(\d+)$/, async (context) => {
    return await OrderRescheduleCallback(context);
  })
  .callbackQuery(/^order_report_problem_(\d+)$/, async (context) => {
    return await OrderReportPeroblemCallback(context);
  });
