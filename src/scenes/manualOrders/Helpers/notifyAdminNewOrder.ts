import { TicketService } from "../../../services/bot";
import { InfoStep } from "../../../handlers/products/pendingOrderInfoState";
import { AnyBot } from "gramio";
import { i18n } from "../../../shared/locales";

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
    collected: Partial<Record<InfoStep, string>>;
    deliveryType: string;
    paymentMethod?: string;
    scheduledSlot?: string;
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
    `💰 Amount: ${data.finalPrice.toLocaleString()} Toman\n`;

  if (data.paymentMethod)
    description += `${t("adminOrderPayment")}: ${data.paymentMethod}\n`;
  if (data.collected.email)
    description += `${t("adminOrderEmail")}: ${data.collected.email}\n`;
  if (data.collected.password)
    description += `${t("adminOrderEmailPassword")}: ${data.collected.password}\n`;
  if (data.collected.loginUsername)
    description += `${t("adminOrderUsername")}: ${data.collected.loginUsername}\n`;
  if (data.collected.loginPassword)
    description += `${t("adminOrderLoginPassword")}: ${data.collected.loginPassword}\n`;
  if (data.collected.region)
    description += `${t("adminOrderRegion")}: ${data.collected.region}\n`;
  if (data.scheduledSlot)
    description += `${t("adminOrderScheduled")}: ${data.scheduledSlot}\n`;

  description += `\n⏰ ${new Date().toLocaleString("en-GB")}`;

  try {
    const ticketService = new TicketService(bot.api);
    await ticketService.createTicket({
      userId: data.userId,
      type: "order",
      title: `Order #${data.orderId} — ${data.productName} (${data.planName})`,
      description,
      orderId: data.orderId,
      priority: "high",
    });
  } catch (err) {
    console.error("[MANUAL-ORDER] Failed to create order ticket:", err);
  }
}
