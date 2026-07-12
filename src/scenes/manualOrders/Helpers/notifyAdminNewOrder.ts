import { TicketService } from "../../../services/bot";
import {
  InfoStep,
  RequiredInputField,
} from "../../../handlers/products/pendingOrderInfoState";
import { AnyBot } from "gramio";
import { i18n } from "../../../shared/locales";
import { getForumConfig } from "../../../services/forumConfig";
import { formatUsd } from "../../../shared/utils/currency";

export async function notifyAdminNewOrder(
  bot: AnyBot,
  data: {
    orderId: number;
    userId: number;
    username: string | null;
    firstName: string | null;
    productName: string;
    planName: string;
    finalPrice: number;
    collected: Record<InfoStep, string>;
    steps: RequiredInputField[];
    deliveryType: string;
    paymentMethod?: string;
    scheduledSlot?: string;
    paymentReceiptFileId?: string;
  },
) {
  const t = i18n.buildT("fa");
  const userLabel = data.username
    ? `@${data.username}`
    : data.firstName || "User";

  let description =
    `🆔 Order: #${data.orderId}\n` +
    `👤 User: ${userLabel} (${data.userId})\n` +
    `📦 Product: ${data.productName}\n` +
    `📋 Plan: ${data.planName}\n` +
    `🚚 Delivery: ${data.deliveryType}\n` +
    `💰 Amount: ${formatUsd(data.finalPrice)}\n`;

  if (data.paymentMethod)
    description += `${t("adminOrderPayment")}: ${data.paymentMethod}\n`;
  for (const step of data.steps) {
    const value = data.collected[step.key];
    if (!value) continue;
    const shownValue = step.sensitive ? "••••••" : value;
    // نمایش متن مناسب با زبان (اینجا fa پیش‌فرض است)
    const label = step.textFA || step.textEN || step.textRU || step.key;
    description += `${label}: ${shownValue}\n`;
  }
  if (data.scheduledSlot)
    description += `${t("adminOrderScheduled")}: ${data.scheduledSlot}\n`;

  description += `\n⏰ ${new Date().toLocaleString("en-GB")}`;

  try {
    const ticketService = new TicketService(bot.api);
    const ticket = await ticketService.createTicket({
      userId: data.userId,
      type: "order",
      title: `Order #${data.orderId} — ${data.productName} (${data.planName})`,
      description,
      orderId: data.orderId,
      priority: "high",
    });

    const forum = await getForumConfig();
    if (
      data.paymentMethod === "card" &&
      data.paymentReceiptFileId &&
      forum.groupId
    ) {
      const receiptCaption =
        `🧾 <b>Order Card Receipt</b>\n` +
        `🎫 <b>Ticket:</b> <code>${ticket.ticketNumber}</code>\n` +
        `🆔 <b>Order:</b> #${data.orderId}\n` +
        `👤 <b>User:</b> ${userLabel} (<code>${data.userId}</code>)\n` +
        `💰 <b>Amount:</b> ${formatUsd(data.finalPrice)}`;

      await (bot.api as any).sendPhoto({
        chat_id: Number(forum.groupId),
        message_thread_id: forum.topics.order,
        photo: data.paymentReceiptFileId,
        caption: receiptCaption,
        parse_mode: "HTML",
      });
    }
  } catch (err) {
    console.error("[MANUAL-ORDER] Failed to create order ticket:", err);
  }
}
