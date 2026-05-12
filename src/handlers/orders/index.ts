import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { MyOrderCallback } from "./callbacks/MyOrders.ts";
import { OrderFilterActiveCallback } from "./callbacks/OrderFilterActive.ts";
import { OrderFilterAllCallback } from "./callbacks/OrderFilterAll.ts";
import { OrderFilterCompletedCallback } from "./callbacks/OrderFilterCompleted.ts";
import { OrderCallback } from "./callbacks/Order.ts";
import { BackToOrdersCallback } from "./callbacks/BackToOrders.ts";
import { OrderOpenTicketCallback } from "./callbacks/OrderOpenTicket.ts";
import { OrderRenewCallback } from "./callbacks/OrderRenew.ts";
import { OrderRescheduleCallback } from "./callbacks/OrderReschedule.ts";
import { OrderReportPeroblemCallback } from "./callbacks/OrderReportProblem.ts";
import { e } from "../../shared/locales/emojies.ts";

function getOrderStatusInfo(status: string) {
  const statusMap: Record<
    string,
    { emoji: string; text: string; color: string }
  > = {
    pending_payment: {
      emoji: e.time,
      text: "در انتظار پرداخت",
      color: e.pending,
    },
    paid: { emoji: e.confirm, text: "پرداخت شده", color: e.confirm },
    pending_admin: {
      emoji: e.admin,
      text: "در انتظار بررسی",
      color: e.pending,
    },
    waiting_schedule: {
      emoji: e.date,
      text: "نیاز به انتخاب زمان",
      color: e.needData,
    },
    scheduled: { emoji: e.date, text: "زمان‌بندی شده", color: e.active },
    reminder_sent: { emoji: e.bell, text: "یادآوری ارسال شد", color: e.active },
    waiting_user_online: {
      emoji: e.user,
      text: "در انتظار حضور شما",
      color: e.pending,
    },
    user_not_responding: {
      emoji: e.warning,
      text: "پاسخ داده نشده",
      color: e.needData,
    },
    waiting_invite: {
      emoji: e.incoming,
      text: "در انتظار ارسال دعوتنامه",
      color: e.active,
    },
    invite_sent: { emoji: "📧", text: "دعوتنامه ارسال شد", color: e.complete },
    waiting_user_action: {
      emoji: "🔄",
      text: "نیاز به اقدام شما",
      color: e.pending,
    },
    join_link_sent: { emoji: "🔗", text: "لینک Join ارسال شد", color: "🟢" },
    in_queue: { emoji: "⏰", text: "در صف انتظار", color: "🟡" },
    in_progress: { emoji: "🔄", text: "در حال انجام", color: e.active },
    active: { emoji: e.sparkles, text: "فعال", color: e.active },
    expiring_soon: { emoji: "⚡", text: "نزدیک به پایان", color: e.needData },
    completed: { emoji: e.confirm, text: "تکمیل شده", color: e.complete },
    cancelled: { emoji: e.reject, text: "لغو شده", color: "🔴" },
    refunded: { emoji: e.wallet, text: "بازگشت وجه", color: "🟣" },
    failed: { emoji: e.failed, text: "ناموفق", color: "🔴" },
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
    return await OrderFilterActiveCallback(
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
