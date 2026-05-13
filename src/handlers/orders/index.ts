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
import type { TFunction } from "../../shared/locales/index.ts";

function getOrderStatusInfo(status: string, t: TFunction) {
  const statusMap: Record<
    string,
    { emoji: string; text: string; color: string }
  > = {
    pending_payment: {
      emoji: e.time,
      text: t("orderStatus_pending_payment"),
      color: e.pending,
    },
    paid: { emoji: e.confirm, text: t("orderStatus_paid"), color: e.confirm },
    pending_admin: {
      emoji: e.admin,
      text: t("orderStatus_pending_admin"),
      color: e.pending,
    },
    waiting_schedule: {
      emoji: e.date,
      text: t("orderStatus_waiting_schedule"),
      color: e.needData,
    },
    scheduled: { emoji: e.date, text: t("orderStatus_scheduled"), color: e.active },
    reminder_sent: {
      emoji: e.bell,
      text: t("orderStatus_reminder_sent"),
      color: e.active,
    },
    waiting_user_online: {
      emoji: e.user,
      text: t("orderStatus_waiting_user_online"),
      color: e.pending,
    },
    user_not_responding: {
      emoji: e.warning,
      text: t("orderStatus_user_not_responding"),
      color: e.needData,
    },
    waiting_invite: {
      emoji: e.incoming,
      text: t("orderStatus_waiting_invite"),
      color: e.active,
    },
    invite_sent: {
      emoji: "📧",
      text: t("orderStatus_invite_sent"),
      color: e.complete,
    },
    waiting_user_action: {
      emoji: "🔄",
      text: t("orderStatus_waiting_user_action"),
      color: e.pending,
    },
    join_link_sent: {
      emoji: "🔗",
      text: t("orderStatus_join_link_sent"),
      color: "🟢",
    },
    in_queue: { emoji: "⏰", text: t("orderStatus_in_queue"), color: "🟡" },
    in_progress: {
      emoji: "🔄",
      text: t("orderStatus_in_progress"),
      color: e.active,
    },
    active: { emoji: e.sparkles, text: t("orderStatus_active"), color: e.active },
    expiring_soon: {
      emoji: "⚡",
      text: t("orderStatus_expiring_soon"),
      color: e.needData,
    },
    completed: {
      emoji: e.confirm,
      text: t("orderStatus_completed"),
      color: e.complete,
    },
    cancelled: { emoji: e.reject, text: t("orderStatus_cancelled"), color: "🔴" },
    refunded: { emoji: e.wallet, text: t("orderStatus_refunded"), color: "🟣" },
    failed: { emoji: e.failed, text: t("orderStatus_failed"), color: "🔴" },
    rescheduled: { emoji: "🔄", text: t("orderStatus_rescheduled"), color: "🔵" },
  };

  return (
    statusMap[status] || {
      emoji: "❓",
      text: t("orderStatus_unknown", { status }),
      color: "⚪",
    }
  );
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
