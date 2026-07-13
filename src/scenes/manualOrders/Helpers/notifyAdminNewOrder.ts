import type { AnyBot } from "gramio";
import type {
	InfoStep,
	RequiredInputField,
} from "../../../handlers/products/pendingOrderInfoState";
import { TicketService } from "../../../services/bot";
import { getForumConfig } from "../../../services/forumConfig";
import { i18n } from "../../../shared/locales";
import { formatToman, formatUsd } from "../../../shared/utils/currency";

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
		/**
		 * For card-to-card ("card") orders: the Toman amount the user was told to
		 * transfer. When present, the admin review shows Toman (card is a Toman
		 * transfer); `finalPrice` remains the canonical USD amount.
		 */
		tomanAmount?: number;
		/** Units purchased (manual products); shown when > 1 */
		quantity?: number;
		collected: Record<InfoStep, string>;
		steps: RequiredInputField[];
		deliveryType: string;
		paymentMethod?: string;
		scheduledSlot?: string;
		paymentReceiptFileId?: string;
		/** Transaction hash / tracking code the user submitted (crypto / zarinpal) */
		paymentHash?: string;
	},
) {
	const t = i18n.buildT("fa");
	const userLabel = data.username
		? `@${data.username}`
		: data.firstName || "User";

	// Card-to-card is verified in Toman; other methods keep the canonical USD.
	const amountLabel =
		data.paymentMethod === "card" && data.tomanAmount != null
			? `${formatToman(data.tomanAmount)} تومان`
			: formatUsd(data.finalPrice);

	let description =
		`🆔 Order: #${data.orderId}\n` +
		`👤 User: ${userLabel} (${data.userId})\n` +
		`📦 Product: ${data.productName}\n` +
		`📋 Plan: ${data.planName}\n` +
		(data.quantity && data.quantity > 1
			? `🔢 Quantity: ${data.quantity}\n`
			: "") +
		`🚚 Delivery: ${data.deliveryType}\n` +
		`💰 Amount: ${amountLabel}\n`;

	if (data.paymentMethod)
		description += `${t("adminOrderPayment")}: ${data.paymentMethod}\n`;
	if (data.paymentHash) description += `🔗 TxID/Ref: ${data.paymentHash}\n`;
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
		// Forward the payment proof (receipt photo and/or tx hash) to the order
		// topic so admins can manually review card / crypto / zarinpal payments.
		const hasProof =
			data.paymentMethod === "card" ||
			data.paymentMethod === "crypto" ||
			data.paymentMethod === "zarinpal";

		if (
			hasProof &&
			forum.groupId &&
			(data.paymentReceiptFileId || data.paymentHash)
		) {
			const methodLabel =
				data.paymentMethod === "card"
					? "Card Receipt"
					: data.paymentMethod === "crypto"
						? "Crypto Payment"
						: "ZarinPal Payment";

			let caption =
				`🧾 <b>Order ${methodLabel}</b>\n` +
				`🎫 <b>Ticket:</b> <code>${ticket.ticketNumber}</code>\n` +
				`🆔 <b>Order:</b> #${data.orderId}\n` +
				`👤 <b>User:</b> ${userLabel} (<code>${data.userId}</code>)\n` +
				`💰 <b>Amount:</b> ${amountLabel}`;
			if (data.paymentHash)
				caption += `\n🔗 <b>TxID/Ref:</b> <code>${data.paymentHash}</code>`;

			if (data.paymentReceiptFileId) {
				await (bot.api as any).sendPhoto({
					chat_id: Number(forum.groupId),
					message_thread_id: forum.topics.order,
					photo: data.paymentReceiptFileId,
					caption,
					parse_mode: "HTML",
				});
			} else {
				await (bot.api as any).sendMessage({
					chat_id: Number(forum.groupId),
					message_thread_id: forum.topics.order,
					text: caption,
					parse_mode: "HTML",
				});
			}
		}
	} catch (err) {
		console.error("[MANUAL-ORDER] Failed to create order ticket:", err);
	}
}
