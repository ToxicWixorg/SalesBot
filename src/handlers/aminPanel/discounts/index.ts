import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import type { DiscountCode } from "../../../db/schema.ts";
import { DiscountCodeRepository } from "../../../repositories/index.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import { formatUsd } from "../../../shared/utils/currency.ts";
import {
	discountManageKeyboard,
	discountsMenuKeyboard,
	discountTypeKeyboard,
} from "../../../shared/keyboards/adminPanel/discounts.ts";

const PAGE = 8;

// ─────────────────────────────────────────────────────────────
// State machine ساخت کد تخفیف
// ─────────────────────────────────────────────────────────────

type DiscountType = "percentage" | "fixed";
type Step =
	| "code"
	| "value"
	| "maxDiscount"
	| "minOrder"
	| "maxUses"
	| "expiry";

interface DiscountDraft {
	type: DiscountType;
	code?: string;
	value?: string;
	maxDiscount?: string | null;
	minOrderAmount?: string | null;
	maxUses?: number | null;
	expiresAt?: Date | null;
}

interface DiscountInput {
	step: Step;
	draft: DiscountDraft;
}

const discInput = new Map<number, DiscountInput>();

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const cancelTo = (cb: string) => new InlineKeyboard().text("لغو", cb);

async function gate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !(await AdminService.hasPermission(userId, "discounts"))) {
		await ctx.answerCallbackQuery({
			text: "⛔ شما به این بخش دسترسی ندارید.",
			show_alert: true,
		});
		return false;
	}
	discInput.delete(userId);
	return true;
}

function digits(s: string): string {
	return s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

function parseNum(text: string): number | null {
	const n = Number.parseFloat(digits(text).replace(/[,،٬\s]/g, ""));
	return Number.isNaN(n) || n <= 0 ? null : n;
}

function shortDate(d: Date | null | undefined): string {
	if (!d) return "—";
	const date = new Date(d);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function renderCode(c: DiscountCode): string {
	const typeLine =
		c.type === "percentage"
			? `نوع: <b>درصدی</b> — <b>${Number.parseFloat(c.value)}٪</b>` +
				(c.maxDiscount
					? `\n🔝 سقف تخفیف: <b>${formatUsd(c.maxDiscount)}</b>`
					: "")
			: `نوع: <b>مبلغی</b> — <b>${formatUsd(c.value)}</b>`;

	const uses = c.maxUses
		? `${c.currentUses ?? 0} / ${c.maxUses}`
		: `${c.currentUses ?? 0} / نامحدود`;

	return (
		`🎁 <b>${c.code}</b>\n\n` +
		`${typeLine}\n` +
		(c.minOrderAmount
			? `🛒 حداقل سفارش: <b>${formatUsd(c.minOrderAmount)}</b>\n`
			: "") +
		`🔁 استفاده: <b>${uses}</b>\n` +
		`👤 هر کاربر: <b>${c.maxUsesPerUser ?? 1}</b> بار\n` +
		`⏳ انقضا: <b>${c.expiresAt ? shortDate(c.expiresAt) : "بدون انقضا"}</b>\n` +
		`🚦 وضعیت: <b>${c.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`
	);
}

async function renderMenu(ctx: any, page: number) {
	const total = await DiscountCodeRepository.countAll();
	const totalPages = Math.max(1, Math.ceil(total / PAGE));
	const safePage = Math.min(Math.max(0, page), totalPages - 1);
	const codes = await DiscountCodeRepository.getAll(PAGE, safePage * PAGE);

	await ctx.editText(
		`🎁 <b>مدیریت کدهای تخفیف</b>\n\nتعداد کل: <b>${total}</b>`,
		{
			parse_mode: "HTML",
			reply_markup: discountsMenuKeyboard(codes, safePage, totalPages),
		},
	);
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminDiscountsHandlers(bot: AnyBot) {
	// ── منوی اصلی ─────────────────────────────────────────────
	bot.callbackQuery("panel_discounts", async (ctx) => {
		if (!(await gate(ctx))) return;
		await renderMenu(ctx, 0);
	});

	bot.callbackQuery(/^disc_list_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		await renderMenu(ctx, Number(ctx.queryData[1]));
	});

	// ── نمایش جزئیات یک کد ────────────────────────────────────
	bot.callbackQuery(/^disc_view_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const code = await DiscountCodeRepository.findById(
			Number(ctx.queryData[1]),
		);
		if (!code) {
			await ctx.answerCallbackQuery({ text: "کد یافت نشد", show_alert: true });
			return;
		}
		await ctx.editText(renderCode(code), {
			parse_mode: "HTML",
			reply_markup: discountManageKeyboard(code),
		});
	});

	bot.callbackQuery(/^disc_toggle_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const code = await DiscountCodeRepository.findById(id);
		if (!code) {
			await ctx.answerCallbackQuery({ text: "کد یافت نشد", show_alert: true });
			return;
		}
		const updated = await DiscountCodeRepository.setActive(id, !code.isActive);
		await ctx.editText(renderCode(updated), {
			parse_mode: "HTML",
			reply_markup: discountManageKeyboard(updated),
		});
	});

	bot.callbackQuery(/^disc_del_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		await DiscountCodeRepository.delete(Number(ctx.queryData[1]));
		await ctx.answerCallbackQuery({ text: "🗑 کد حذف شد" });
		await renderMenu(ctx, 0);
	});

	// ── شروع ساخت: انتخاب نوع ─────────────────────────────────
	bot.callbackQuery("disc_create", async (ctx) => {
		if (!(await gate(ctx))) return;
		await ctx.editText("🎁 <b>ساخت کد تخفیف</b>\n\nنوع کد را انتخاب کنید:", {
			parse_mode: "HTML",
			reply_markup: discountTypeKeyboard(),
		});
	});

	bot.callbackQuery(/^disc_new_(percentage|fixed)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const type = ctx.queryData[1] as DiscountType;
		discInput.set(ctx.from.id, { step: "code", draft: { type } });
		await ctx.editText(
			`🎁 <b>ساخت کد ${type === "percentage" ? "درصدی" : "مبلغی"}</b>\n\n` +
				`🔤 <b>متن کد</b> را بفرستید (مثلاً <code>OFF50</code>):`,
			{ parse_mode: "HTML", reply_markup: cancelTo("panel_discounts") },
		);
	});

	// ── ورودی متنی ────────────────────────────────────────────
	bot.on("message", async (ctx, next) => {
		const userId = ctx.from?.id;
		if (!userId) return next?.();

		const state = discInput.get(userId);
		if (!state) return next?.();
		if ((ctx as any).scene?.current) return next?.();
		if (!(await AdminService.hasPermission(userId, "discounts"))) {
			discInput.delete(userId);
			return next?.();
		}

		const text = (ctx.text ?? "").trim();
		if (!text) return;

		const { step, draft } = state;

		// ── متن کد ──
		if (step === "code") {
			const code = text.toUpperCase().replace(/\s+/g, "");
			if (!/^[A-Z0-9_-]{2,32}$/.test(code)) {
				await ctx.send(
					"❌ کد نامعتبر است. فقط حروف/اعداد انگلیسی (۲ تا ۳۲ کاراکتر).",
				);
				return;
			}
			const exists = await DiscountCodeRepository.findByCode(code);
			if (exists) {
				await ctx.send("❌ این کد قبلاً ثبت شده. کد دیگری بفرستید.");
				return;
			}
			draft.code = code;
			discInput.set(userId, { step: "value", draft });
			await ctx.send(
				draft.type === "percentage"
					? "٪ <b>درصد تخفیف</b> را بفرستید (۱ تا ۱۰۰):"
					: "💵 <b>مبلغ تخفیف</b> (دلار) را بفرستید:",
				{ parse_mode: "HTML" },
			);
			return;
		}

		// ── مقدار ──
		if (step === "value") {
			const n = parseNum(text);
			if (n === null) {
				await ctx.send("❌ عدد نامعتبر است. دوباره بفرستید.");
				return;
			}
			if (draft.type === "percentage" && (n < 1 || n > 100)) {
				await ctx.send("❌ درصد باید بین ۱ تا ۱۰۰ باشد.");
				return;
			}
			draft.value = n.toString();

			if (draft.type === "percentage") {
				discInput.set(userId, { step: "maxDiscount", draft });
				await ctx.send(
					"🔝 <b>سقف مبلغ تخفیف</b> (دلار) را بفرستید، یا «-» برای بدون سقف:",
					{ parse_mode: "HTML" },
				);
			} else {
				discInput.set(userId, { step: "minOrder", draft });
				await ctx.send(
					"🛒 <b>حداقل مبلغ سفارش</b> (دلار) را بفرستید، یا «-» برای بدون حداقل:",
					{ parse_mode: "HTML" },
				);
			}
			return;
		}

		// ── سقف تخفیف (فقط درصدی) ──
		if (step === "maxDiscount") {
			draft.maxDiscount = text === "-" ? null : parseToMoney(text);
			if (text !== "-" && draft.maxDiscount === null) {
				await ctx.send("❌ عدد نامعتبر است. مبلغ یا «-» بفرستید.");
				return;
			}
			discInput.set(userId, { step: "minOrder", draft });
			await ctx.send(
				"🛒 <b>حداقل مبلغ سفارش</b> (دلار) را بفرستید، یا «-» برای بدون حداقل:",
				{ parse_mode: "HTML" },
			);
			return;
		}

		// ── حداقل سفارش ──
		if (step === "minOrder") {
			draft.minOrderAmount = text === "-" ? null : parseToMoney(text);
			if (text !== "-" && draft.minOrderAmount === null) {
				await ctx.send("❌ عدد نامعتبر است. مبلغ یا «-» بفرستید.");
				return;
			}
			discInput.set(userId, { step: "maxUses", draft });
			await ctx.send(
				"🔁 <b>حداکثر تعداد کل استفاده</b> را بفرستید، یا «-» برای نامحدود:",
				{ parse_mode: "HTML" },
			);
			return;
		}

		// ── حداکثر استفاده ──
		if (step === "maxUses") {
			if (text === "-") {
				draft.maxUses = null;
			} else {
				const n = parseNum(text);
				if (n === null) {
					await ctx.send("❌ عدد نامعتبر است. عدد یا «-» بفرستید.");
					return;
				}
				draft.maxUses = Math.floor(n);
			}
			discInput.set(userId, { step: "expiry", draft });
			await ctx.send(
				"⏳ <b>انقضا بر حسب روز</b> را بفرستید، یا «-» برای بدون انقضا:",
				{ parse_mode: "HTML" },
			);
			return;
		}

		// ── انقضا → ساخت ──
		if (step === "expiry") {
			if (text === "-") {
				draft.expiresAt = null;
			} else {
				const n = parseNum(text);
				if (n === null) {
					await ctx.send("❌ عدد نامعتبر است. تعداد روز یا «-» بفرستید.");
					return;
				}
				draft.expiresAt = new Date(Date.now() + Math.floor(n) * 86_400_000);
			}

			discInput.delete(userId);

			const created = await DiscountCodeRepository.create({
				code: draft.code!,
				type: draft.type,
				value: draft.value!,
				maxDiscount: draft.maxDiscount ?? null,
				minOrderAmount: draft.minOrderAmount ?? null,
				maxUses: draft.maxUses ?? null,
				maxUsesPerUser: 1,
				expiresAt: draft.expiresAt ?? null,
				isActive: true,
			});

			await ctx.send(`✅ کد تخفیف ساخته شد.\n\n${renderCode(created)}`, {
				parse_mode: "HTML",
				reply_markup: discountManageKeyboard(created),
			});
			return;
		}
	});
}

/** مبلغ را به رشته decimal تبدیل می‌کند یا null اگر نامعتبر بود. */
function parseToMoney(text: string): string | null {
	const n = Number.parseFloat(
		text
			.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
			.replace(/[,،٬\s]/g, ""),
	);
	return Number.isNaN(n) || n <= 0 ? null : n.toFixed(2);
}
