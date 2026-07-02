import { InlineKeyboard } from "gramio";
import { getForumConfig } from "../../forumConfig.ts";
import type { Order, User } from "../../../db/schema.ts";

type BotApi = any;

export interface NewOrderNotificationData {
  order: Order;
  user: User;
  productName: string;
  planName?: string | null;
  /** Delivered content lines (for auto-delivered inventory orders) */
  deliveryLines?: string[];
}

/**
 * Inline keyboard shown under an order notification in the Orders topic.
 * Lets the staff manage the order and message the buyer.
 */
export function orderForumKeyboard(order: Order, userId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("✉️ پیام به خریدار", `ord_reply_${order.id}`)
    .row()
    .text("✅ تحویل شد", `ord_deliver_${order.id}`)
    .text("❌ لغو و بازگشت وجه", `ord_cancel_${order.id}`)
    .row()
    .text("👤 پروفایل کاربر", `ord_user_${userId}`);
}

/**
 * Post a full order summary to the Orders topic of the support forum group,
 * together with management buttons.
 */
export async function sendNewOrderNotification(
  botApi: BotApi,
  data: NewOrderNotificationData,
) {
  const forum = await getForumConfig();
  if (!forum.groupId || !forum.topics.order) {
    console.warn("[FORUM] SUPPORT_GROUP_ID or ORDERS_TOPIC_ID not configured");
    return;
  }

  const { order, user } = data;

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const username = user.username ? `@${user.username}` : "—";

  const finalPrice = Number(order.finalPrice ?? 0).toLocaleString();
  const totalPrice = Number(order.totalPrice ?? 0).toLocaleString();
  const discount = Number(order.discountAmount ?? 0);

  let message =
    `🛒 <b>New Order</b>\n\n` +
    `🆔 <b>Order:</b> #${order.id}\n` +
    `📊 <b>Status:</b> ${order.status}\n\n` +
    `👤 <b>Buyer:</b> ${fullName}\n` +
    `🔖 <b>Username:</b> ${username}\n` +
    `🆔 <b>User ID:</b> <code>${user.id}</code>\n\n` +
    `📦 <b>Product:</b> ${data.productName}\n`;

  if (data.planName) message += `📋 <b>Plan:</b> ${data.planName}\n`;
  message += `🔢 <b>Quantity:</b> ${order.quantity ?? 1}\n`;
  message += `💵 <b>Total:</b> ${totalPrice} ${"تومان"}\n`;
  if (discount > 0) {
    message += `🎁 <b>Discount:</b> ${discount.toLocaleString()} تومان\n`;
  }
  message += `💰 <b>Final:</b> ${finalPrice} تومان\n`;
  if (order.paymentMethod) {
    message += `💳 <b>Payment:</b> ${order.paymentMethod}\n`;
  }

  if (data.deliveryLines && data.deliveryLines.length > 0) {
    message += `\n━━━━━━━━━━━━━━━━\n`;
    message += `🚚 <b>Delivered:</b>\n`;
    for (const line of data.deliveryLines) {
      message += `<code>${line}</code>\n`;
    }
  }

  message += `\n⏰ ${new Date(order.createdAt ?? new Date()).toLocaleString("en-GB", { timeZone: "UTC" })} (UTC)`;

  try {
    await botApi.sendMessage({
      chat_id: Number(forum.groupId),
      text: message,
      message_thread_id: forum.topics.order,
      parse_mode: "HTML",
      reply_markup: orderForumKeyboard(order, Number(user.id)),
    });
  } catch (error) {
    console.error("[FORUM] Failed to send new order notification:", error);
  }
}
