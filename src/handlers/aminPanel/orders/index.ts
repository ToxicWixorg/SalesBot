import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import {
	OrderRepository,
	ProductRepository,
	ProductPlanRepository,
	UserRepository,
} from "../../../repositories/index.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import { getLocalizedName } from "../../../shared/utils/localizedFields.ts";
import {
	ORDER_CODE_TO_STATUS,
	orderManageKeyboard,
	ordersAdminMenuKeyboard,
	ordersListKeyboard,
	statusLabel,
} from "../../../shared/keyboards/adminPanel/orders.ts";

const PAGE = 8;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function gate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !(await AdminService.hasPermission(userId, "orders"))) {
		await ctx.answerCallbackQuery({
			text: "⛔ شما به این بخش دسترسی ندارید.",
			show_alert: true,
		});
		return false;
	}
	return true;
}

function formatMoney(v: string | number | null | undefined): string {
	return Number.parseFloat(String(v ?? "0")).toLocaleString("en-US");
}

function shortDate(d: Date | null | undefined): string {
	if (!d) return "—";
	const date = new Date(d);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

async function show(ctx: any, text: string, keyboard: InlineKeyboard) {
	try {
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	} catch {
		await ctx.send(text, { parse_mode: "HTML", reply_markup: keyboard });
	}
}

async function renderMenu(ctx: any) {
	const [all, pp, pd, pa, ip, cp, cn, rf] = await Promise.all([
		OrderRepository.countAll(),
		OrderRepository.countByStatus("pending_payment"),
		OrderRepository.countByStatus("paid"),
		OrderRepository.countByStatus("pending_admin"),
		OrderRepository.countByStatus("in_progress"),
		OrderRepository.countByStatus("completed"),
		OrderRepository.countByStatus("cancelled"),
		OrderRepository.countByStatus("refunded"),
	]);
	const counts = { all, pp, pd, pa, ip, cp, cn, rf };

	await show(
		ctx,
		`📦 <b>مدیریت سفارش‌ها</b>\n\n` +
			`تعداد کل سفارش‌ها: <b>${all}</b>\n\n` +
			`برای مشاهده، یک وضعیت را انتخاب کنید:`,
		ordersAdminMenuKeyboard(counts),
	);
}

async function renderList(ctx: any, filterCode: string, page: number) {
	const status = ORDER_CODE_TO_STATUS[filterCode];
	const total =
		filterCode === "all"
			? await OrderRepository.countAll()
			: await OrderRepository.countByStatus(status ?? "");
	const totalPages = Math.max(1, Math.ceil(total / PAGE));
	const safePage = Math.min(Math.max(0, page), totalPages - 1);

	const orders =
		filterCode === "all"
			? await OrderRepository.getRecent(PAGE, safePage * PAGE)
			: await OrderRepository.getByStatus(status ?? "", PAGE, safePage * PAGE);

	const title =
		filterCode === "all" ? "همه سفارش‌ها" : statusLabel(status);

	await show(
		ctx,
		`📦 <b>${title}</b>\n\nتعداد: <b>${total}</b>\nروی هر سفارش بزنید تا جزئیات را ببینید.`,
		ordersListKeyboard(orders, filterCode, safePage, totalPages),
	);
}

async function renderOrder(ctx: any, filterCode: string, orderId: number) {
	const order = await OrderRepository.findById(orderId);
	if (!order) {
		await ctx.answerCallbackQuery({ text: "سفارش یافت نشد", show_alert: true });
		return;
	}

	const [user, product, plan] = await Promise.all([
		UserRepository.findById(Number(order.userId)),
		ProductRepository.findById(order.productId),
		ProductPlanRepository.findById(order.planId),
	]);

	const userLabel = user
		? `${[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}${user.username ? ` (@${user.username})` : ""}`
		: "—";

	const productName = product ? getLocalizedName(product, "fa") : `#${order.productId}`;
	const planName = plan ? getLocalizedName(plan, "fa") : `#${order.planId}`;

	// Delivery content (if any)
	let deliveryText = "";
	const delivery = order.delivery as { items?: string[] } | null;
	if (delivery?.items && delivery.items.length > 0) {
		deliveryText = `\n\n📤 <b>تحویل:</b>\n<code>${delivery.items.join("\n")}</code>`;
	}

	const text =
		`📦 <b>سفارش #${order.id}</b>\n\n` +
		`وضعیت: <b>${statusLabel(order.status)}</b>\n` +
		`👤 کاربر: ${userLabel}\n` +
		`🆔 <code>${order.userId}</code>\n\n` +
		`🛍️ محصول: <b>${productName}</b>\n` +
		`📋 پلن: <b>${planName}</b>\n` +
		`🔢 تعداد: <b>${order.quantity ?? 1}</b>\n\n` +
		`💵 مبلغ کل: <b>${formatMoney(order.totalPrice)}</b>\n` +
		`🎟 تخفیف: <b>${formatMoney(order.discountAmount)}</b>\n` +
		`💳 مبلغ نهایی: <b>${formatMoney(order.finalPrice)}</b>\n` +
		`💰 روش پرداخت: <b>${order.paymentMethod ?? "—"}</b>\n\n` +
		`📅 ثبت: ${shortDate(order.createdAt)}\n` +
		`📤 تحویل: ${shortDate(order.deliveredAt)}` +
		(order.notes ? `\n📝 یادداشت: ${order.notes}` : "") +
		deliveryText;

	await show(ctx, text, orderManageKeyboard(order, filterCode));
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminOrdersHandlers(bot: AnyBot) {
	// ── منوی اصلی سفارش‌ها ────────────────────────────────────
	bot.callbackQuery("panel_orders", async (ctx) => {
		if (!(await gate(ctx))) return;
		await renderMenu(ctx);
	});

	// ── لیست حسب فیلتر + صفحه‌بندی ─────────────────────────────
	bot.callbackQuery(/^oadm_list_([a-z]+)_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const [, code, page] = ctx.queryData as [string, string, string];
		await renderList(ctx, code, Number(page));
	});

	// ── نمایش جزئیات سفارش ─────────────────────────────────────
	bot.callbackQuery(/^oadm_view_([a-z]+)_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const [, code, orderId] = ctx.queryData as [string, string, string];
		await renderOrder(ctx, code, Number(orderId));
	});

	// ── تغییر دستی وضعیت سفارش ─────────────────────────────────
	bot.callbackQuery(/^oadm_setst_([a-z]+)_(\d+)_([a-z]+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const [, filterCode, orderIdStr, stCode] = ctx.queryData as [
			string,
			string,
			string,
			string,
		];
		const status = ORDER_CODE_TO_STATUS[stCode];
		if (!status) {
			await ctx.answerCallbackQuery({ text: "وضعیت نامعتبر", show_alert: true });
			return;
		}

		const order = await OrderRepository.findById(Number(orderIdStr));
		if (!order) {
			await ctx.answerCallbackQuery({ text: "سفارش یافت نشد", show_alert: true });
			return;
		}

		await OrderRepository.updateStatus(order.id, status);
		await ctx.answerCallbackQuery({
			text: `✅ وضعیت به «${statusLabel(status)}» تغییر کرد.`,
		});
		await renderOrder(ctx, filterCode, order.id);
	});
}
