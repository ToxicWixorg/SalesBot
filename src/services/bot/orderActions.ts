import type { Order } from "../../db/schema.ts";
import {
	OrderRepository,
	UserRepository,
	WalletRepository,
} from "../../repositories/index.ts";

// Minimal shape of the Telegram API we need — keeps this service decoupled from
// the concrete Bot type so both the forum handlers and the admin panel can use it.
type BotApiLike = { sendMessage: (args: Record<string, unknown>) => Promise<unknown> };

export interface OrderActionResult {
	ok: boolean;
	order?: Order;
	/** Short admin-facing status text (shown as a callback alert). */
	message: string;
}

async function notifyBuyer(
	botApi: BotApiLike,
	userId: number,
	text: string,
): Promise<void> {
	try {
		await botApi.sendMessage({ chat_id: userId, text, parse_mode: "HTML" });
	} catch (err) {
		console.error("[ORDER-ACTION] Failed to notify buyer:", err);
	}
}

/**
 * Mark an order as delivered/completed and notify the buyer.
 * Shared by the Orders-topic forum buttons and the in-bot admin panel.
 */
export async function deliverOrderAction(
	botApi: BotApiLike,
	orderId: number,
): Promise<OrderActionResult> {
	const order = await OrderRepository.findById(orderId);
	if (!order) return { ok: false, message: "❌ سفارش پیدا نشد" };
	if (order.status === "completed") {
		return { ok: false, order, message: "ℹ️ این سفارش قبلاً تحویل شده است" };
	}

	const updated = await OrderRepository.updateStatus(orderId, "completed");
	await notifyBuyer(
		botApi,
		Number(order.userId),
		`✅ سفارش شما (#${orderId}) تحویل داده شد. از خرید شما متشکریم!`,
	);
	return {
		ok: true,
		order: updated,
		message: "✅ سفارش تحویل‌شده علامت‌گذاری شد",
	};
}

/**
 * Cancel an order, refund the wallet amount that was used (if any), and notify
 * the buyer. Sets status to "refunded" when a refund happened, else "cancelled".
 */
export async function cancelRefundOrderAction(
	botApi: BotApiLike,
	orderId: number,
): Promise<OrderActionResult> {
	const order = await OrderRepository.findById(orderId);
	if (!order) return { ok: false, message: "❌ سفارش پیدا نشد" };
	if (order.status === "cancelled" || order.status === "refunded") {
		return { ok: false, order, message: "ℹ️ این سفارش قبلاً لغو شده است" };
	}

	const refund = Number(order.walletUsed ?? 0);
	let refunded = false;
	if (refund > 0) {
		try {
			await UserRepository.updateWalletBalance(
				Number(order.userId),
				refund,
				"add",
			);
			await WalletRepository.addCredit(
				Number(order.userId),
				refund.toFixed(2),
				"refund",
				`بازگشت وجه سفارش #${orderId}`,
			);
			refunded = true;
		} catch (error) {
			console.error("[ORDER-ACTION] Refund failed:", error);
		}
	}

	const updated = await OrderRepository.updateStatus(
		orderId,
		refunded ? "refunded" : "cancelled",
	);
	await notifyBuyer(
		botApi,
		Number(order.userId),
		`❌ سفارش شما (#${orderId}) لغو شد.` +
			(refunded
				? `\n💰 مبلغ ${refund.toLocaleString()} تومان به کیف پول شما بازگردانده شد.`
				: ""),
	);
	return {
		ok: true,
		order: updated,
		message: refunded ? "✅ سفارش لغو و وجه بازگردانده شد" : "✅ سفارش لغو شد",
	};
}

/** Relay a free-text message from staff to the buyer of an order. */
export async function messageBuyerAction(
	botApi: BotApiLike,
	orderId: number,
	buyerId: number,
	text: string,
): Promise<boolean> {
	try {
		await botApi.sendMessage({
			chat_id: buyerId,
			text: `📩 <b>پیام پشتیبانی درباره سفارش #${orderId}:</b>\n\n${text}`,
			parse_mode: "HTML",
		});
		return true;
	} catch (error) {
		console.error("[ORDER-ACTION] Failed to relay message to buyer:", error);
		return false;
	}
}
