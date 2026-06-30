import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import type {
	BroadcastAudience,
	BroadcastLang,
} from "../../../repositories/index.ts";
import { UserAdminRepository } from "../../../repositories/index.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import {
	AUDIENCE_LABELS,
	broadcastAudienceKeyboard,
	broadcastConfirmKeyboard,
	broadcastLangKeyboard,
	broadcastMenuKeyboard,
	LANG_LABELS,
} from "../../../shared/keyboards/adminPanel/broadcast.ts";

// ─────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────

type BroadcastMessage =
	| { type: "text"; text: string }
	| { type: "photo"; fileId: string; caption?: string };

interface BroadcastDraft {
	awaitingMessage: boolean;
	message?: BroadcastMessage;
	lang: BroadcastLang;
	audience: BroadcastAudience;
}

const broadcastDraft = new Map<number, BroadcastDraft>();

const DELAY_MS = 50; // ~20 پیام در ثانیه

function getDraft(userId: number): BroadcastDraft {
	let d = broadcastDraft.get(userId);
	if (!d) {
		d = { awaitingMessage: false, lang: "all", audience: "all" };
		broadcastDraft.set(userId, d);
	}
	return d;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function gate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !(await AdminService.hasPermission(userId, "broadcast"))) {
		await ctx.answerCallbackQuery({
			text: "⛔ شما به این بخش دسترسی ندارید.",
			show_alert: true,
		});
		return false;
	}
	return true;
}

function messagePreview(message: BroadcastMessage | undefined): string {
	if (!message) return "—";
	if (message.type === "photo")
		return `🖼 عکس${message.caption ? ` + کپشن: ${message.caption.slice(0, 60)}` : ""}`;
	return `📝 ${message.text.slice(0, 80)}${message.text.length > 80 ? "…" : ""}`;
}

async function renderMenu(ctx: any, draft: BroadcastDraft) {
	const text =
		`📢 <b>ارسال پیام همگانی</b>\n\n` +
		`پیام: ${messagePreview(draft.message)}\n` +
		`🌐 زبان: <b>${LANG_LABELS[draft.lang]}</b>\n` +
		`🎯 مخاطب: <b>${AUDIENCE_LABELS[draft.audience]}</b>`;
	await ctx.editText(text, {
		parse_mode: "HTML",
		reply_markup: broadcastMenuKeyboard(
			!!draft.message,
			draft.lang,
			draft.audience,
		),
	});
}

/** اجرای ارسال در پس‌زمینه با throttle و گزارش نهایی به ادمین. */
async function runBroadcast(
	bot: AnyBot,
	adminId: number,
	ids: number[],
	message: BroadcastMessage,
) {
	let sent = 0;
	let failed = 0;

	for (const id of ids) {
		try {
			if (message.type === "photo") {
				await (bot.api as any).sendPhoto({
					chat_id: id,
					photo: message.fileId,
					caption: message.caption,
					parse_mode: "HTML",
				});
			} else {
				await (bot.api as any).sendMessage({
					chat_id: id,
					text: message.text,
					parse_mode: "HTML",
				});
			}
			sent++;
		} catch {
			failed++;
		}
		await sleep(DELAY_MS);
	}

	try {
		await (bot.api as any).sendMessage({
			chat_id: adminId,
			text:
				`📢 <b>ارسال همگانی تمام شد</b>\n\n` +
				`✅ موفق: <b>${sent}</b>\n` +
				`❌ ناموفق: <b>${failed}</b>\n` +
				`👥 کل: <b>${ids.length}</b>`,
			parse_mode: "HTML",
		});
	} catch {}
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminBroadcastHandlers(bot: AnyBot) {
	// ── منوی اصلی ─────────────────────────────────────────────
	bot.callbackQuery("panel_broadcast", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);
		draft.awaitingMessage = false;
		await renderMenu(ctx, draft);
	});

	// ── تنظیم پیام ────────────────────────────────────────────
	bot.callbackQuery("bc_setmsg", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);
		draft.awaitingMessage = true;
		await ctx.editText(
			"📝 <b>پیام همگانی</b> را بفرستید:\n\n" +
				"می‌توانید <b>متن</b> یا <b>عکس (با کپشن)</b> بفرستید.\n" +
				"فرمت‌دهی HTML پشتیبانی می‌شود.",
			{
				parse_mode: "HTML",
				reply_markup: new InlineKeyboard().text("لغو", "panel_broadcast"),
			},
		);
	});

	// ── فیلتر زبان ────────────────────────────────────────────
	bot.callbackQuery("bc_lang", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);
		await ctx.editText("🌐 <b>زبان گیرندگان</b> را انتخاب کنید:", {
			parse_mode: "HTML",
			reply_markup: broadcastLangKeyboard(draft.lang),
		});
	});

	bot.callbackQuery(/^bc_setlang_(all|fa|en|ru)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);
		draft.lang = ctx.queryData[1] as BroadcastLang;
		await renderMenu(ctx, draft);
	});

	// ── فیلتر مخاطب ───────────────────────────────────────────
	bot.callbackQuery("bc_aud", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);
		await ctx.editText("🎯 <b>مخاطبان</b> را انتخاب کنید:", {
			parse_mode: "HTML",
			reply_markup: broadcastAudienceKeyboard(draft.audience),
		});
	});

	bot.callbackQuery(
		/^bc_setaud_(all|active|blocked|customers|has_balance|buyers)$/,
		async (ctx) => {
			if (!(await gate(ctx))) return;
			const draft = getDraft(ctx.from.id);
			draft.audience = ctx.queryData[1] as BroadcastAudience;
			await renderMenu(ctx, draft);
		},
	);

	// ── پیش‌نمایش تعداد گیرندگان ──────────────────────────────
	bot.callbackQuery("bc_count", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);
		const n = await UserAdminRepository.countBroadcastTargets(
			draft.lang,
			draft.audience,
		);
		await ctx.answerCallbackQuery({
			text: `👥 تعداد گیرندگان با این فیلتر: ${n} کاربر`,
			show_alert: true,
		});
	});

	// ── ارسال ─────────────────────────────────────────────────
	bot.callbackQuery("bc_send", async (ctx) => {
		if (!(await gate(ctx))) return;
		const draft = getDraft(ctx.from.id);

		if (!draft.message) {
			await ctx.answerCallbackQuery({
				text: "ابتدا پیام را تنظیم کنید.",
				show_alert: true,
			});
			return;
		}

		const n = await UserAdminRepository.countBroadcastTargets(
			draft.lang,
			draft.audience,
		);
		if (n === 0) {
			await ctx.answerCallbackQuery({
				text: "هیچ گیرنده‌ای با این فیلتر وجود ندارد.",
				show_alert: true,
			});
			return;
		}

		await ctx.editText(
			`🚀 <b>تأیید ارسال</b>\n\n` +
				`پیام: ${messagePreview(draft.message)}\n` +
				`🌐 زبان: <b>${LANG_LABELS[draft.lang]}</b>\n` +
				`🎯 مخاطب: <b>${AUDIENCE_LABELS[draft.audience]}</b>\n` +
				`👥 تعداد گیرندگان: <b>${n}</b>\n\n` +
				`آیا ارسال شود؟`,
			{ parse_mode: "HTML", reply_markup: broadcastConfirmKeyboard() },
		);
	});

	bot.callbackQuery("bc_send_confirm", async (ctx) => {
		if (!(await gate(ctx))) return;
		const adminId = ctx.from.id;
		const draft = getDraft(adminId);

		if (!draft.message) {
			await ctx.answerCallbackQuery({
				text: "پیامی تنظیم نشده است.",
				show_alert: true,
			});
			return;
		}

		const ids = await UserAdminRepository.getBroadcastTargetIds(
			draft.lang,
			draft.audience,
		);
		const message = draft.message;

		await ctx.answerCallbackQuery({ text: "🚀 ارسال شروع شد" });
		await ctx.editText(
			`🚀 ارسال به <b>${ids.length}</b> کاربر آغاز شد.\n\n` +
				`پس از پایان، گزارش برایتان ارسال می‌شود.`,
			{
				parse_mode: "HTML",
				reply_markup: new InlineKeyboard().text("بازگشت", "panel_broadcast"),
			},
		);

		// پاک کردن پیش‌نویس پیام (فیلترها حفظ می‌شوند) و اجرای ارسال در پس‌زمینه
		draft.message = undefined;
		draft.awaitingMessage = false;
		void runBroadcast(bot, adminId, ids, message);
	});

	// ── دریافت پیام برودکست ───────────────────────────────────
	bot.on("message", async (ctx, next) => {
		const userId = ctx.from?.id;
		if (!userId) return next?.();

		const draft = broadcastDraft.get(userId);
		if (!draft || !draft.awaitingMessage) return next?.();
		if ((ctx as any).scene?.current) return next?.();
		if (!(await AdminService.hasPermission(userId, "broadcast"))) {
			draft.awaitingMessage = false;
			return next?.();
		}

		const message = (ctx as any).update?.message ?? {};
		const photos = message.photo as { file_id: string }[] | undefined;

		if (photos && photos.length > 0) {
			draft.message = {
				type: "photo",
				fileId: photos[photos.length - 1].file_id,
				caption: message.caption,
			};
		} else if (ctx.text) {
			draft.message = { type: "text", text: ctx.text };
		} else {
			await ctx.send("❌ فقط متن یا عکس پشتیبانی می‌شود.");
			return;
		}

		draft.awaitingMessage = false;

		await ctx.send("✅ پیام ثبت شد.", {
			reply_markup: broadcastMenuKeyboard(true, draft.lang, draft.audience),
		});
	});
}
