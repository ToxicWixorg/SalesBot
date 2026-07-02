import { InlineKeyboard } from "gramio";
import type { Order } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";

// Order statuses (see ordersTable.status). Short codes are used in callback data
// because the raw status strings contain underscores, which would clash with the
// `_`-delimited callback parsing.
export const ORDER_STATUS_LABELS: Record<string, string> = {
	pending_payment: "⏳ در انتظار پرداخت",
	paid: "💰 پرداخت‌شده",
	pending_admin: "👤 در انتظار ادمین",
	waiting_schedule: "🗓 در انتظار زمان‌بندی",
	scheduled: "📅 زمان‌بندی‌شده",
	in_progress: "🔄 در حال انجام",
	completed: "✅ تکمیل‌شده",
	cancelled: "❌ لغوشده",
	refunded: "↩️ بازپرداخت‌شده",
};

/** short code → status */
export const ORDER_CODE_TO_STATUS: Record<string, string> = {
	pp: "pending_payment",
	pd: "paid",
	pa: "pending_admin",
	ws: "waiting_schedule",
	sc: "scheduled",
	ip: "in_progress",
	cp: "completed",
	cn: "cancelled",
	rf: "refunded",
};

/** status → short code */
export const ORDER_STATUS_TO_CODE: Record<string, string> = Object.fromEntries(
	Object.entries(ORDER_CODE_TO_STATUS).map(([code, status]) => [status, code]),
);

/** Filters shown on the menu, in display order. `all` means every order. */
const MENU_FILTERS: { code: string; label: string }[] = [
	{ code: "all", label: "📋 همه" },
	{ code: "pp", label: "⏳ در انتظار پرداخت" },
	{ code: "pd", label: "💰 پرداخت‌شده" },
	{ code: "pa", label: "👤 در انتظار ادمین" },
	{ code: "ip", label: "🔄 در حال انجام" },
	{ code: "cp", label: "✅ تکمیل‌شده" },
	{ code: "cn", label: "❌ لغوشده" },
	{ code: "rf", label: "↩️ بازپرداخت" },
];

export function statusLabel(status: string | null | undefined): string {
	if (!status) return "—";
	return ORDER_STATUS_LABELS[status] ?? status;
}

// ─── منوی اصلی سفارش‌ها ───────────────────────────────────────
export function ordersAdminMenuKeyboard(
	counts: Record<string, number>,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	MENU_FILTERS.forEach((f, i) => {
		const n = counts[f.code] ?? 0;
		keyboard.text(`${f.label} (${n})`, `oadm_list_${f.code}_0`);
		if (i % 2 === 1) keyboard.row();
	});

	keyboard.row();
	keyboard.text("بازگشت", "admin_panel", { icon_custom_emoji_id: emojiIds.back });
	return keyboard;
}

// ─── لیست سفارش‌ها ────────────────────────────────────────────
export function ordersListKeyboard(
	orders: Order[],
	filterCode: string,
	page: number,
	totalPages: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const order of orders) {
		const label =
			`#${order.id} • ${statusLabel(order.status)} • ` +
			`${Number.parseFloat(String(order.finalPrice ?? "0")).toLocaleString("en-US")}`;
		keyboard.text(label, `oadm_view_${filterCode}_${order.id}`).row();
	}

	if (orders.length === 0) {
		keyboard.text("سفارشی یافت نشد", "noop").row();
	}

	// Pagination
	if (totalPages > 1) {
		if (page > 0) {
			keyboard.text("« قبلی", `oadm_list_${filterCode}_${page - 1}`);
		}
		keyboard.text(`${page + 1}/${totalPages}`, "noop");
		if (page < totalPages - 1) {
			keyboard.text("بعدی »", `oadm_list_${filterCode}_${page + 1}`);
		}
		keyboard.row();
	}

	keyboard.text("بازگشت", "panel_orders", {
		icon_custom_emoji_id: emojiIds.back,
	});
	return keyboard;
}

// ─── مدیریت یک سفارش ──────────────────────────────────────────
export function orderManageKeyboard(
	order: Order,
	filterCode: string,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// Manual status transitions (updates the status field only — no side effects
	// like wallet refunds or re-delivery).
	const transitions: { code: string; label: string }[] = [
		{ code: "pa", label: "👤 در انتظار ادمین" },
		{ code: "ip", label: "🔄 در حال انجام" },
		{ code: "cp", label: "✅ تکمیل" },
		{ code: "cn", label: "❌ لغو" },
		{ code: "rf", label: "↩️ بازپرداخت" },
	];

	const currentCode = ORDER_STATUS_TO_CODE[order.status ?? ""] ?? "";
	transitions
		.filter((tr) => tr.code !== currentCode)
		.forEach((tr, i) => {
			keyboard.text(tr.label, `oadm_setst_${filterCode}_${order.id}_${tr.code}`);
			if (i % 2 === 1) keyboard.row();
		});

	keyboard.row();
	keyboard.text("بازگشت", `oadm_list_${filterCode}_0`, {
		icon_custom_emoji_id: emojiIds.back,
	});
	return keyboard;
}
