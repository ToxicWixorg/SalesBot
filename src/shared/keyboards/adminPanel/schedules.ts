import { InlineKeyboard } from "gramio";
import type { TimeSlotTemplate } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";

// روزهای هفته به ترتیب تقویم ایرانی (0=یکشنبه … 6=شنبه طبق getDay)
export const WEEK_DAYS = [
	{ n: 6, label: "شنبه" },
	{ n: 0, label: "یکشنبه" },
	{ n: 1, label: "دوشنبه" },
	{ n: 2, label: "سه‌شنبه" },
	{ n: 3, label: "چهارشنبه" },
	{ n: 4, label: "پنجشنبه" },
	{ n: 5, label: "جمعه" },
] as const;

export function dayNames(days: number[] | null | undefined): string {
	const set = new Set(days ?? []);
	const names = WEEK_DAYS.filter((d) => set.has(d.n)).map((d) => d.label);
	return names.length === 7
		? "همه روزها"
		: names.length === 0
			? "—"
			: names.join("، ");
}

// ─── منوی اصلی زمان‌بندی ─────────────────────────────────────
export function schedulesMenuKeyboard(
	templates: TimeSlotTemplate[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	keyboard.text("➕ ساخت بازه زمانی", "sch_create", { style: "success" }).row();

	for (const t of templates) {
		const status = t.isActive ? "" : "🚫 ";
		keyboard
			.text(
				`${status}${t.name} (${t.startTime}-${t.endTime})`,
				`sch_view_${t.id}`,
			)
			.row();
	}

	if (templates.length === 0) {
		keyboard.text("هنوز بازه‌ای ساخته نشده", "usr_noop").row();
	}

	keyboard.text("بازگشت", "admin_panel", {
		icon_custom_emoji_id: emojiIds.back,
	});

	return keyboard;
}

// ─── انتخاب روزهای هفته (چندانتخابی) ─────────────────────────
export function daysPickerKeyboard(selected: number[]): InlineKeyboard {
	const keyboard = new InlineKeyboard();
	const set = new Set(selected);

	WEEK_DAYS.forEach((d, i) => {
		const mark = set.has(d.n) ? "✅ " : "";
		keyboard.text(`${mark}${d.label}`, `sch_day_${d.n}`);
		if (i % 2 === 1) keyboard.row();
	});
	keyboard.row();

	keyboard
		.text("📅 همه روزها", "sch_days_all")
		.row()
		.text("💾 ذخیره بازه", "sch_save", { style: "success" })
		.row()
		.text("لغو", "panel_schedules", { icon_custom_emoji_id: emojiIds.back });

	return keyboard;
}

// ─── مدیریت یک بازه ──────────────────────────────────────────
export function templateManageKeyboard(
	template: TimeSlotTemplate,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			template.isActive ? "🔴 غیرفعال کردن" : "🟢 فعال کردن",
			`sch_toggle_${template.id}`,
			{ style: template.isActive ? "danger" : "success" },
		)
		.row()
		.text("🗑 حذف بازه", `sch_del_${template.id}`, { style: "danger" })
		.row()
		.text("بازگشت", "panel_schedules", {
			icon_custom_emoji_id: emojiIds.back,
		});
}
