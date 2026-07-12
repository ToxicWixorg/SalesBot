import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { orderDetailsKeyboard } from "../../../shared/keyboards/index.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function OrderCallback(
  context: Context,
  getOrderStatusInfo: any,
  formatDate: any,
  formatPrice: any,
) {
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

    if (Number(order.userId) !== userId) {
      await context.answerCallbackQuery({
        text: t("orderAccessDenied"),
        show_alert: true,
      });
      return;
    }

    const product = await ProductRepository.findById(order.productId);
    const statusInfo = getOrderStatusInfo(order.status, t);

    let message = `${t("orderDetailsTitle")}\n\n`;
    message += `${t("orderNumber")}: #${order.id}\n`;
    message += `${t("orderProduct")}: ${product?.name || "-"}\n`;
    message += `${statusInfo.color} ${t("orderStatus")}: ${statusInfo.emoji} ${statusInfo.text}\n`;
    message += `\n`;
    message += `${t("orderTotalPrice")}: ${formatPrice(order.totalPrice)}\n`;

    if (Number(order.discountAmount) > 0) {
      message += `${t("orderDiscount")}: ${formatPrice(order.discountAmount)}\n`;
    }

    if (Number(order.walletUsed) > 0) {
      message += `${t("orderWalletUsed")}: ${formatPrice(order.walletUsed)}\n`;
    }

    message += `${t("orderFinalPrice")}: ${formatPrice(order.finalPrice)}\n`;
    message += `\n`;
    message += `${t("orderCreatedAt")}: ${formatDate(order.createdAt)}\n`;

    if (order.deliveredAt) {
      message += `${t("orderDeliveredAt")}: ${formatDate(order.deliveredAt)}\n`;
    }

    if (order.scheduledTime) {
      message += `${t("orderScheduledTime")}: ${formatDate(order.scheduledTime)}\n`;
    }

    if (order.delivery && order.status === "completed") {
      message += `\n━━━━━━━━━━━━━━━━\n`;
      message += `${t("orderDeliveryInfo")}\n\n`;

      const delivery = order.delivery as Record<string, unknown>;
      let hasDeliveryData = false;

      const addLine = (label: string, rawValue: string, asCode = false) => {
        const value = rawValue.trim();
        if (!value) return;
        hasDeliveryData = true;
        message += asCode
          ? `${label}: <code>${escapeHtml(value)}</code>\n`
          : `${label}: ${escapeHtml(value)}\n`;
      };

      const items = Array.isArray(delivery.items)
        ? delivery.items
            .map((v) => String(v ?? "").trim())
            .filter((v) => v.length > 0)
        : [];

      if (items.length > 0) {
        hasDeliveryData = true;
        message += `• ${t("items")}:\n`;
        for (const [idx, item] of items.entries()) {
          message += `${idx + 1}. <code>${escapeHtml(item)}</code>\n`;
        }
      }

      if (typeof delivery.code === "string") {
        addLine(t("orderDeliveryCode"), delivery.code, true);
      }
      if (typeof delivery.email === "string") {
        addLine(t("orderDeliveryEmail"), delivery.email);
      }
      if (typeof delivery.link === "string") {
        addLine(t("orderDeliveryLink"), delivery.link);
      }
      if (typeof delivery.instructions === "string") {
        const instructions = delivery.instructions.trim();
        if (instructions) {
          hasDeliveryData = true;
          message += `\n${t("orderDeliveryInstructions")}:\n${escapeHtml(instructions)}\n`;
        }
      }

      for (const [key, raw] of Object.entries(delivery)) {
        if (["items", "code", "email", "link", "instructions"].includes(key)) {
          continue;
        }

        if (raw === null || raw === undefined) continue;

        if (Array.isArray(raw)) {
          const values = raw
            .map((v) => String(v ?? "").trim())
            .filter((v) => v.length > 0);
          if (values.length > 0) {
            addLine(key, values.join(" | "));
          }
          continue;
        }

        if (typeof raw === "object") {
          addLine(key, JSON.stringify(raw));
          continue;
        }

        addLine(key, String(raw));
      }

      if (!hasDeliveryData) {
        message += `${t("orderDeliveryInfoNotProvided")}\n`;
      }
    }

    if (order.notes) {
      message += `\n${t("orderNotes")}: ${order.notes}\n`;
    }

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderDetailsKeyboard(t, order, product),
    });

    await context.answerCallbackQuery();
  } catch (error) {
    console.error("[ORDERS] Error fetching order details:", error);
    await context.answerCallbackQuery({
      text: t("errorFetchingOrderDetails"),
      show_alert: true,
    });
  }
}
