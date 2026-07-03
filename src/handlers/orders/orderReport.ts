import type { AnyBot } from "gramio";
import { getForumConfig } from "../../services/forumConfig.ts";
import {
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "../../repositories/index.ts";
import { i18n } from "../../shared/locales/index.ts";
import { getLocalizedName } from "../../shared/utils/localizedFields.ts";
import { orderForumKeyboard } from "../../services/bot/notifications/newOrder.ts";
import { orderReportState } from "./callbacks/OrderReportProblem.ts";

/**
 * Captures the buyer's problem description (after they tap "report problem")
 * and forwards it to the Reports topic of the forum group with the same
 * management buttons as an order notification (deliver / cancel+refund /
 * message buyer / profile).
 *
 * Registered in bot.ts via setupOrderReportHandler(bot).
 */
export function setupOrderReportHandler(bot: AnyBot): void {
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.text) return next?.();

    const state = orderReportState.get(userId);
    if (!state) return next?.();
    if ((ctx as any).scene?.current) return next?.();

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");
    const text = ctx.text.trim();

    if (text === "/cancel") {
      orderReportState.delete(userId);
      await ctx.send(t("orderReportCancelled"), { parse_mode: "HTML" });
      return;
    }

    orderReportState.delete(userId);

    const order = await OrderRepository.findById(state.orderId);
    if (!order || Number(order.userId) !== userId) {
      await ctx.send(t("orderNotFound"), { parse_mode: "HTML" });
      return;
    }

    // Forward the report to the Reports topic of the forum group.
    const forum = await getForumConfig();
    if (forum.groupId && forum.topics.report) {
      const product = await ProductRepository.findById(order.productId);
      const productName = product
        ? getLocalizedName(product, "fa")
        : `#${order.productId}`;
      const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";
      const username = user?.username ? ` (@${user.username})` : "";

      const reportText =
        `⚠️ <b>گزارش مشکل سفارش #${order.id}</b>\n\n` +
        `👤 ${fullName}${username}\n` +
        `🆔 <code>${userId}</code>\n` +
        `🛍️ محصول: <b>${productName}</b>\n` +
        `📦 وضعیت سفارش: <b>${order.status ?? "—"}</b>\n\n` +
        `📝 <b>شرح مشکل:</b>\n${text}`;

      try {
        await bot.api.sendMessage({
          chat_id: forum.groupId,
          message_thread_id: forum.topics.report,
          text: reportText,
          parse_mode: "HTML",
          reply_markup: orderForumKeyboard(order, Number(order.userId)),
        } as any);
      } catch (error) {
        console.error("[ORDER-REPORT] Failed to post report to group:", error);
      }
    }

    await ctx.send(t("orderReportSent"), { parse_mode: "HTML" });
  });
}
