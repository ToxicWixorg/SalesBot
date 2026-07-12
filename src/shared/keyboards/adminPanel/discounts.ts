import { InlineKeyboard } from "gramio";
import type { DiscountCode } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { formatUsd } from "../../utils/currency.ts";

function codeLabel(c: DiscountCode): string {
	const status = c.isActive ? "" : "🚫 ";
	const value =
		c.type === "percentage"
			? `${Number.parseFloat(c.value)}٪`
			: formatUsd(c.value);
	return `${status}${c.code} — ${value}`;
}

// ─── منوی اصلی تخفیف‌ها ──────────────────────────────────────
export function discountsMenuKeyboard(
	codes: DiscountCode[],
	page: number,
	totalPages: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	keyboard.text("➕ ساخت کد تخفیف", "disc_create", { style: "success" }).row();

	for (const c of codes) {
		keyboard.text(codeLabel(c), `disc_view_${c.id}`).row();
	}

	if (codes.length === 0) {
		keyboard.text("هنوز کدی ساخته نشده", "usr_noop").row();
	}

	if (totalPages > 1) {
		if (page > 0) keyboard.text("◀️", `disc_list_${page - 1}`);
		keyboard.text(`${page + 1}/${totalPages}`, "usr_noop");
		if (page < totalPages - 1) keyboard.text("▶️", `disc_list_${page + 1}`);
		keyboard.row();
	}

	keyboard.text("بازگشت", "admin_panel", {
		icon_custom_emoji_id: emojiIds.back,
	});

	return keyboard;
}

// ─── انتخاب نوع کد ───────────────────────────────────────────
export function discountTypeKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("٪ درصدی", "disc_new_percentage", { style: "primary" })
		.text("💵 مبلغی", "disc_new_fixed", { style: "primary" })
		.row()
		.text("لغو", "panel_discounts", { icon_custom_emoji_id: emojiIds.back });
}

// ─── مدیریت یک کد ────────────────────────────────────────────
export function discountManageKeyboard(code: DiscountCode): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			code.isActive ? "🔴 غیرفعال کردن" : "🟢 فعال کردن",
			`disc_toggle_${code.id}`,
			{ style: code.isActive ? "danger" : "success" },
		)
		.row()
		.text("🗑 حذف کد", `disc_del_${code.id}`, { style: "danger" })
		.row()
		.text("بازگشت", "panel_discounts", {
			icon_custom_emoji_id: emojiIds.back,
		});
}
