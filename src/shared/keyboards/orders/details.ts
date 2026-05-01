import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { Order, Product } from "../../../db/schema.ts";

export function orderDetailsKeyboard(
  t: TFunction,
  order: Order,
  product?: Product | null,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // دکمه باز کردن تیکت
  keyboard.text(t("btnOrderOpenTicket"), `order_open_ticket_${order.id}`);

  // دکمه تمدید (فقط برای محصولات قابل تمدید و سفارشات تکمیل شده یا نزدیک به پایان)
  if (
    product?.isRenewable &&
    ["completed", "active", "expiring_soon"].includes(order.status)
  ) {
    keyboard.text(t("btnOrderRenew"), `order_renew_${order.id}`);
  }

  keyboard.row();

  // دکمه تغییر زمان (فقط برای سفارشات منتظر یا زمان‌بندی شده)
  if (["waiting_schedule", "scheduled"].includes(order.status)) {
    keyboard.text(t("btnOrderReschedule"), `order_reschedule_${order.id}`);
  }

  // دکمه گزارش مشکل (فقط برای سفارشات تکمیل شده یا فعال)
  if (["completed", "active"].includes(order.status)) {
    keyboard
      .text(t("btnOrderReportProblem"), `order_report_problem_${order.id}`)
      .row();
  }

  // دکمه بازگشت
  keyboard.text(t("btnBackToOrders"), "back_to_orders").row();
  keyboard.text(t("btnMainMenu"), "main_menu");

  return keyboard;
}
