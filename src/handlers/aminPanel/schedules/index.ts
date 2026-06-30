import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import type { TimeSlotTemplate } from "../../../db/schema.ts";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import {
	dayNames,
	daysPickerKeyboard,
	schedulesMenuKeyboard,
	templateManageKeyboard,
} from "../../../shared/keyboards/adminPanel/schedules.ts";

// ─────────────────────────────────────────────────────────────
// State machine ساخت بازه زمانی
// ─────────────────────────────────────────────────────────────

interface TemplateDraft {
	step: "name" | "start" | "end" | "capacity" | "days";
	name?: string;
	startTime?: string;
	endTime?: string;
	capacity?: number;
	daysOfWeek: number[];
}

const schedInput = new Map<number, TemplateDraft>();

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const cancelTo = (cb: string) => new InlineKeyboard().text("لغو", cb);

/** فقط بررسی دسترسی (وضعیت ساخت را پاک نمی‌کند تا روزها قابل انتخاب بمانند). */
async function gate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !(await AdminService.hasPermission(userId, "schedules"))) {
		await ctx.answerCallbackQuery({
			text: "⛔ شما به این بخش دسترسی ندارید.",
			show_alert: true,
		});
		return false;
	}
	return true;
}

function digits(s: string): string {
	return s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

function normalizeTime(text: string): string | null {
	const m = digits(text)
		.trim()
		.match(/^(\d{1,2}):(\d{2})$/);
	if (!m) return null;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (h > 23 || min > 59) return null;
	return `${String(h).padStart(2, "0")}:${m[2]}`;
}

function renderTemplate(t: TimeSlotTemplate): string {
	const products = t.productIds
		? `${(t.productIds as number[]).length} محصول`
		: "همه محصولات";
	return (
		`⏰ <b>${t.name}</b>\n\n` +
		`🕐 ساعت: <b>${t.startTime} - ${t.endTime}</b>\n` +
		`👥 ظرفیت روزانه: <b>${t.capacity}</b>\n` +
		`📅 روزها: <b>${dayNames(t.daysOfWeek as number[])}</b>\n` +
		`🛍 محصولات: <b>${products}</b>\n` +
		`🚦 وضعیت: <b>${t.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`
	);
}

async function renderMenu(ctx: any) {
	const templates = await ScheduleRepository.getAllTemplates();
	await ctx.editText(
		`⏰ <b>مدیریت بازه‌های زمانی</b>\n\n` +
			`این بازه‌ها هنگام خرید محصولات نیازمند زمان‌بندی به کاربر نمایش داده می‌شوند.\n\n` +
			`تعداد: <b>${templates.length}</b>`,
		{
			parse_mode: "HTML",
			reply_markup: schedulesMenuKeyboard(templates),
		},
	);
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminSchedulesHandlers(bot: AnyBot) {
	// ── منوی اصلی ─────────────────────────────────────────────
	bot.callbackQuery("panel_schedules", async (ctx) => {
		if (!(await gate(ctx))) return;
		schedInput.delete(ctx.from.id);
		await renderMenu(ctx);
	});

	// ── جزئیات یک بازه ────────────────────────────────────────
	bot.callbackQuery(/^sch_view_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		schedInput.delete(ctx.from.id);
		const t = await ScheduleRepository.findTemplateById(
			Number(ctx.queryData[1]),
		);
		if (!t) {
			await ctx.answerCallbackQuery({ text: "یافت نشد", show_alert: true });
			return;
		}
		await ctx.editText(renderTemplate(t), {
			parse_mode: "HTML",
			reply_markup: templateManageKeyboard(t),
		});
	});

	bot.callbackQuery(/^sch_toggle_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const t = await ScheduleRepository.findTemplateById(id);
		if (!t) {
			await ctx.answerCallbackQuery({ text: "یافت نشد", show_alert: true });
			return;
		}
		const updated = await ScheduleRepository.setTemplateActive(id, !t.isActive);
		await ctx.editText(renderTemplate(updated), {
			parse_mode: "HTML",
			reply_markup: templateManageKeyboard(updated),
		});
	});

	bot.callbackQuery(/^sch_del_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		await ScheduleRepository.deleteTemplate(Number(ctx.queryData[1]));
		await ctx.answerCallbackQuery({ text: "🗑 بازه حذف شد" });
		await renderMenu(ctx);
	});

	// ── شروع ساخت ─────────────────────────────────────────────
	bot.callbackQuery("sch_create", async (ctx) => {
		if (!(await gate(ctx))) return;
		schedInput.set(ctx.from.id, { step: "name", daysOfWeek: [] });
		await ctx.editText(
			"⏰ <b>ساخت بازه زمانی</b>\n\n📝 <b>نام بازه</b> را بفرستید (مثلاً «نوبت صبح»):",
			{ parse_mode: "HTML", reply_markup: cancelTo("panel_schedules") },
		);
	});

	// ── انتخاب روز (چندانتخابی) ───────────────────────────────
	bot.callbackQuery(/^sch_day_(\d)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = schedInput.get(ctx.from.id);
		if (!draft || draft.step !== "days") {
			await ctx.answerCallbackQuery({
				text: "جلسه منقضی شده. دوباره شروع کنید.",
				show_alert: true,
			});
			return;
		}
		const day = Number(ctx.queryData[1]);
		const idx = draft.daysOfWeek.indexOf(day);
		if (idx >= 0) draft.daysOfWeek.splice(idx, 1);
		else draft.daysOfWeek.push(day);
		schedInput.set(ctx.from.id, draft);
		await ctx.answerCallbackQuery();
		await ctx.editReplyMarkup(daysPickerKeyboard(draft.daysOfWeek));
	});

	bot.callbackQuery("sch_days_all", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = schedInput.get(ctx.from.id);
		if (!draft || draft.step !== "days") {
			await ctx.answerCallbackQuery({
				text: "جلسه منقضی شده. دوباره شروع کنید.",
				show_alert: true,
			});
			return;
		}
		draft.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
		schedInput.set(ctx.from.id, draft);
		await ctx.answerCallbackQuery();
		await ctx.editReplyMarkup(daysPickerKeyboard(draft.daysOfWeek));
	});

	// ── ذخیره بازه ────────────────────────────────────────────
	bot.callbackQuery("sch_save", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = schedInput.get(ctx.from.id);
		if (!draft || draft.step !== "days") {
			await ctx.answerCallbackQuery({
				text: "جلسه منقضی شده. دوباره شروع کنید.",
				show_alert: true,
			});
			return;
		}
		if (draft.daysOfWeek.length === 0) {
			await ctx.answerCallbackQuery({
				text: "حداقل یک روز را انتخاب کنید.",
				show_alert: true,
			});
			return;
		}

		schedInput.delete(ctx.from.id);
		const created = await ScheduleRepository.createTemplate({
			name: draft.name!,
			startTime: draft.startTime!,
			endTime: draft.endTime!,
			capacity: draft.capacity!,
			daysOfWeek: [...draft.daysOfWeek].sort((a, b) => a - b),
			productIds: null, // null = همه محصولات
			isActive: true,
		});

		await ctx.answerCallbackQuery({ text: "✅ بازه ساخته شد" });
		await ctx.editText(
			`✅ بازه زمانی ساخته شد.\n\n${renderTemplate(created)}`,
			{
				parse_mode: "HTML",
				reply_markup: templateManageKeyboard(created),
			},
		);
	});

	// ── ورودی متنی ────────────────────────────────────────────
	bot.on("message", async (ctx, next) => {
		const userId = ctx.from?.id;
		if (!userId) return next?.();

		const draft = schedInput.get(userId);
		if (!draft) return next?.();
		if ((ctx as any).scene?.current) return next?.();
		if (!(await AdminService.hasPermission(userId, "schedules"))) {
			schedInput.delete(userId);
			return next?.();
		}

		const text = (ctx.text ?? "").trim();
		if (!text) return;

		// مرحله‌ی روزها با دکمه انجام می‌شود، نه متن
		if (draft.step === "days") return;

		if (draft.step === "name") {
			draft.name = text.slice(0, 40);
			draft.step = "start";
			schedInput.set(userId, draft);
			await ctx.send(
				"🕐 <b>ساعت شروع</b> را به فرمت <code>HH:MM</code> بفرستید (مثلاً <code>09:00</code>):",
				{ parse_mode: "HTML" },
			);
			return;
		}

		if (draft.step === "start") {
			const time = normalizeTime(text);
			if (!time) {
				await ctx.send("❌ فرمت ساعت نامعتبر است. مثال: <code>09:00</code>", {
					parse_mode: "HTML",
				});
				return;
			}
			draft.startTime = time;
			draft.step = "end";
			schedInput.set(userId, draft);
			await ctx.send(
				"🕐 <b>ساعت پایان</b> را به فرمت <code>HH:MM</code> بفرستید (مثلاً <code>10:00</code>):",
				{ parse_mode: "HTML" },
			);
			return;
		}

		if (draft.step === "end") {
			const time = normalizeTime(text);
			if (!time) {
				await ctx.send("❌ فرمت ساعت نامعتبر است. مثال: <code>10:00</code>", {
					parse_mode: "HTML",
				});
				return;
			}
			if (time <= draft.startTime!) {
				await ctx.send("❌ ساعت پایان باید بعد از ساعت شروع باشد.");
				return;
			}
			draft.endTime = time;
			draft.step = "capacity";
			schedInput.set(userId, draft);
			await ctx.send(
				"👥 <b>ظرفیت روزانه</b> (تعداد نوبت در هر روز) را بفرستید:",
				{ parse_mode: "HTML" },
			);
			return;
		}

		if (draft.step === "capacity") {
			const n = Number.parseInt(digits(text), 10);
			if (Number.isNaN(n) || n <= 0) {
				await ctx.send("❌ عدد نامعتبر است. یک عدد مثبت بفرستید.");
				return;
			}
			draft.capacity = n;
			draft.step = "days";
			schedInput.set(userId, draft);
			await ctx.send(
				"📅 <b>روزهای فعال</b> این بازه را انتخاب کنید، سپس «ذخیره بازه» را بزنید:",
				{
					parse_mode: "HTML",
					reply_markup: daysPickerKeyboard(draft.daysOfWeek),
				},
			);
			return;
		}
	});
}
