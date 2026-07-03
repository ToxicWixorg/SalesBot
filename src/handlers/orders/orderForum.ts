import type { AnyBot } from "gramio";
import { getForumConfig } from "../../services/forumConfig.ts";
import { OrderRepository, UserRepository } from "../../repositories/index.ts";
import {
  cancelRefundOrderAction,
  deliverOrderAction,
  messageBuyerAction,
} from "../../services/bot/orderActions.ts";

/**
 * Pending "message buyer" state, keyed by the staff member's Telegram id.
 * Set when an admin taps "✉️ پیام به خریدار" in the Orders topic; the next
 * text message that admin sends in the support group is relayed to the buyer.
 */
const orderReplyState = new Map<number, { orderId: number; buyerId: number }>();

async function isSupportGroup(
  chatId: number | string | undefined,
): Promise<boolean> {
  const { groupId } = await getForumConfig();
  return !!groupId && String(chatId) === String(groupId);
}

/**
 * Register the Orders-topic management handlers:
 *  - inline buttons (message buyer / mark delivered / cancel & refund / profile)
 *  - a group message relay that forwards a staff reply to the buyer
 *
 * Must be called after the Bot instance is created (in bot.ts).
 */
export function setupOrderForumHandlers(bot: AnyBot): void {
  // ── ✉️ Start "message buyer" flow ──────────────────────────────────────────
  bot.callbackQuery(/^ord_reply_(\d+)$/, async (ctx) => {
    const orderId = parseInt(ctx.queryData[1], 10);
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      await ctx.answerCallbackQuery({
        text: "❌ سفارش پیدا نشد",
        show_alert: true,
      });
      return;
    }

    orderReplyState.set(ctx.from.id, {
      orderId,
      buyerId: Number(order.userId),
    });

    const forum = await getForumConfig();
    await ctx.answerCallbackQuery();
    await ctx.send(
      `✍️ پیام خود را برای خریدار سفارش #${orderId} بنویسید.\n` +
        `پیام بعدی شما به کاربر ارسال می‌شود. (برای لغو /cancel)`,
      {
        message_thread_id: forum.topics.order,
        parse_mode: "HTML",
      } as any,
    );
  });

  // ── ✅ Mark as delivered ────────────────────────────────────────────────────
  bot.callbackQuery(/^ord_deliver_(\d+)$/, async (ctx) => {
    const orderId = parseInt(ctx.queryData[1], 10);
    const result = await deliverOrderAction(bot.api as any, orderId);
    await ctx.answerCallbackQuery({ text: result.message, show_alert: true });
  });

  // ── ❌ Cancel & refund ──────────────────────────────────────────────────────
  bot.callbackQuery(/^ord_cancel_(\d+)$/, async (ctx) => {
    const orderId = parseInt(ctx.queryData[1], 10);
    const result = await cancelRefundOrderAction(bot.api as any, orderId);
    await ctx.answerCallbackQuery({ text: result.message, show_alert: true });
  });

  // ── 👤 Buyer profile ────────────────────────────────────────────────────────
  bot.callbackQuery(/^ord_user_(\d+)$/, async (ctx) => {
    const userId = parseInt(ctx.queryData[1], 10);
    const user = await UserRepository.findById(userId);
    if (!user) {
      await ctx.answerCallbackQuery({
        text: "❌ کاربر پیدا نشد",
        show_alert: true,
      });
      return;
    }

    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
    const username = user.username ? `@${user.username}` : "—";
    const balance = Number(user.walletBalance ?? 0).toLocaleString();

    await ctx.answerCallbackQuery({
      text:
        `👤 ${fullName}\n` +
        `🔖 ${username}\n` +
        `🆔 ${user.id}\n` +
        `💰 موجودی: ${balance} تومان`,
      show_alert: true,
    });
  });

  // ── Relay a staff reply (typed in the group) to the buyer ───────────────────
  bot.on("message", async (ctx, next) => {
    if (!ctx.text) return next?.();
    if (!(await isSupportGroup(ctx.chat?.id))) return next?.();

    const adminId = ctx.from?.id;
    if (!adminId) return next?.();

    const state = orderReplyState.get(adminId);
    if (!state) return next?.();

    const forum = await getForumConfig();

    // Allow cancelling the pending reply
    if (ctx.text.trim() === "/cancel") {
      orderReplyState.delete(adminId);
      await ctx.send("✅ ارسال پیام لغو شد.", {
        message_thread_id: forum.topics.order,
      } as any);
      return;
    }

    orderReplyState.delete(adminId);

    const sent = await messageBuyerAction(
      bot.api as any,
      state.orderId,
      state.buyerId,
      ctx.text,
    );
    await ctx.send(
      sent
        ? `✅ پیام برای خریدار سفارش #${state.orderId} ارسال شد.`
        : "❌ ارسال پیام به خریدار ناموفق بود.",
      { message_thread_id: forum.topics.order } as any,
    );
  });
}
