import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import type { User } from "../../../db/schema.ts";
import {
	UserAdminRepository,
	UserRepository,
	WalletRepository,
} from "../../../repositories/index.ts";
import type { UserListFilter } from "../../../repositories/UserAdminRepository.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import {
	allUsersKeyboard,
	bulkConfirmKeyboard,
	bulkMenuKeyboard,
	NEW_USER_PERIODS,
	newUsersKeyboard,
	searchResultsKeyboard,
	USER_FILTERS,
	userProfileKeyboard,
	usersMenuKeyboard,
} from "../../../shared/keyboards/adminPanel/users.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { formatUsd } from "../../../shared/utils/currency.ts";
import { getLocalizedName } from "../../../shared/utils/localizedFields.ts";

// ─────────────────────────────────────────────────────────────
// State machine ورودی متنی
// ─────────────────────────────────────────────────────────────

type UsersInput =
	| { type: "search" }
	| { type: "sendmsg"; targetId: number }
	| { type: "baladd"; targetId: number }
	| { type: "balsub"; targetId: number }
	| { type: "bulk_add" }
	| { type: "bulk_sub" };

const usersInput = new Map<number, UsersInput>();

const NEW_PAGE = 10;
const ALL_PAGE = 10;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const cancelTo = (cb: string) => new InlineKeyboard().text("لغو", cb);

/** دسترسی به بخش کاربران (ادمین با مجوز users). state را پاک می‌کند. */
async function gate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !(await AdminService.hasPermission(userId, "users"))) {
		await ctx.answerCallbackQuery({
			text: "⛔ شما به این بخش دسترسی ندارید.",
			show_alert: true,
		});
		return false;
	}
	usersInput.delete(userId);
	return true;
}

function digits(s: string): string {
	return s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

function parseAmount(text: string): number | null {
	const n = Number.parseFloat(digits(text).replace(/[,،٬\s]/g, ""));
	return Number.isNaN(n) || n <= 0 ? null : n;
}

function shortDate(d: Date | null | undefined): string {
	if (!d) return "—";
	const date = new Date(d);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function periodSince(period: string): Date {
	const def =
		NEW_USER_PERIODS.find((p) => p.code === period) ?? NEW_USER_PERIODS[0];
	const now = new Date();
	if (def.days === 0) {
		const d = new Date(now);
		d.setHours(0, 0, 0, 0);
		return d;
	}
	return new Date(now.getTime() - def.days * 86_400_000);
}

/** اطلاع‌رسانی تغییر موجودی به کاربر (با احترام به ترجیح notifyWallet و زبان او). */
async function notifyBalanceChange(
	bot: AnyBot,
	user: User,
	amount: number,
	type: "credit" | "debit",
) {
	if (user.notifyWallet === false) return;
	const t = i18n.buildT(user.languageCode || "fa");
	const amt = formatUsd(amount);
	const balance = formatUsd(user.walletBalance);
	const text =
		type === "credit"
			? t("walletAdminCredited", amt, balance)
			: t("walletAdminDebited", amt, balance);
	try {
		await (bot.api as any).sendMessage({
			chat_id: Number(user.id),
			text,
			parse_mode: "HTML",
		});
	} catch {
		// کاربر ربات را بلاک کرده — نادیده بگیر
	}
}

// ─── رندر پروفایل کاربر (قابل استفاده در همه بخش‌ها) ──────────
export async function renderUserProfile(
	userId: number,
	backTo = "panel_users",
): Promise<{ text: string; keyboard: InlineKeyboard } | null> {
	const user = await UserRepository.findById(userId);
	if (!user) return null;

	const [referrals, purchases, totalPaid] = await Promise.all([
		UserAdminRepository.referralCount(userId),
		UserAdminRepository.purchaseCount(userId),
		UserAdminRepository.totalPaid(userId),
	]);

	const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
	const status = user.isBlocked
		? `🔴 مسدود${user.blockedReason ? ` (${user.blockedReason})` : ""}`
		: "🟢 فعال";

	const text =
		`👤 <b>${name || "بدون نام"}</b> ${user.username ? `(@${user.username})` : ""}\n\n` +
		`🆔 <code>${user.id}</code>\n` +
		`📅 عضویت: ${shortDate(user.createdAt)}\n` +
		`🚦 وضعیت: ${status}\n` +
		`💰 موجودی: <b>${formatUsd(user.walletBalance)}</b>\n` +
		`🛍 تعداد خرید: <b>${purchases}</b>\n` +
		`💳 مجموع پرداختی: <b>${formatUsd(totalPaid)}</b>\n` +
		`👥 رفرال‌ها: <b>${referrals}</b>`;

	return { text, keyboard: userProfileKeyboard(user, backTo) };
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminUsersHandlers(bot: AnyBot) {
	// دکمه‌های تزئینی (هدر / شماره صفحه)
	bot.callbackQuery("usr_noop", async (ctx) => {
		await ctx.answerCallbackQuery();
	});

	// ── منوی اصلی ─────────────────────────────────────────────
	bot.callbackQuery("panel_users", async (ctx) => {
		if (!(await gate(ctx))) return;
		await ctx.editText("👥 <b>مدیریت کاربران</b>\n\nیک بخش را انتخاب کنید:", {
			parse_mode: "HTML",
			reply_markup: usersMenuKeyboard(),
		});
	});

	// ── جستجو ─────────────────────────────────────────────────
	bot.callbackQuery("usr_search", async (ctx) => {
		if (!(await gate(ctx))) return;
		usersInput.set(ctx.from.id, { type: "search" });
		await ctx.editText(
			"🔎 <b>جستجوی کاربر</b>\n\n" +
				"آیدی عددی، نام کاربری (یوزرنیم) یا نام را بفرستید:",
			{ parse_mode: "HTML", reply_markup: cancelTo("panel_users") },
		);
	});

	bot.callbackQuery(/^usr_view_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const profile = await renderUserProfile(Number(ctx.queryData[1]));
		if (!profile) {
			await ctx.answerCallbackQuery({
				text: "کاربر یافت نشد",
				show_alert: true,
			});
			return;
		}
		await ctx.editText(profile.text, {
			parse_mode: "HTML",
			reply_markup: profile.keyboard,
		});
	});

	// ── مسدود / رفع مسدودی ────────────────────────────────────
	bot.callbackQuery(/^usr_block_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		await UserAdminRepository.setBlocked(id, true);
		await ctx.answerCallbackQuery({ text: "🚫 کاربر مسدود شد" });
		const profile = await renderUserProfile(id);
		if (profile)
			await ctx.editText(profile.text, {
				parse_mode: "HTML",
				reply_markup: profile.keyboard,
			});
	});

	bot.callbackQuery(/^usr_unblock_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		await UserAdminRepository.setBlocked(id, false);
		await ctx.answerCallbackQuery({ text: "✅ رفع مسدودی شد" });
		const profile = await renderUserProfile(id);
		if (profile)
			await ctx.editText(profile.text, {
				parse_mode: "HTML",
				reply_markup: profile.keyboard,
			});
	});

	// ── محصولات خریداری‌شده ───────────────────────────────────
	bot.callbackQuery(/^usr_orders_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const rows = await UserAdminRepository.getPurchasedProducts(id);

		let text = `🛍 <b>محصولات خریداری‌شده</b>\n\n`;
		if (rows.length === 0) {
			text += "این کاربر هنوز خریدی نداشته است.";
		} else {
			for (const r of rows) {
				const productName = r.nameFA
					? getLocalizedName(
							{ nameFA: r.nameFA, nameEN: r.nameEN, nameRU: r.nameRU },
							"fa",
						)
					: "محصول حذف‌شده";
				text +=
					`• <b>${productName}</b> — #${r.orderId}\n` +
					`  💵 ${formatUsd(r.finalPrice)} | ${r.status} | ${shortDate(r.createdAt)}\n`;
			}
		}

		await ctx.editText(text, {
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().text("بازگشت", `usr_view_${id}`),
		});
	});

	// ── تراکنش‌ها ─────────────────────────────────────────────
	bot.callbackQuery(/^usr_tx_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const txs = await WalletRepository.getRecentTransactions(id, 15);

		let text = `🧾 <b>آخرین تراکنش‌ها</b>\n\n`;
		if (txs.length === 0) {
			text += "تراکنشی ثبت نشده است.";
		} else {
			for (const tx of txs) {
				const sign = tx.type === "credit" ? "➕" : "➖";
				text +=
					`${sign} <b>${formatUsd(tx.amount)}</b> | ${tx.source}\n` +
					`  ${tx.description ?? "—"} | ${shortDate(tx.createdAt)}\n`;
			}
		}

		await ctx.editText(text, {
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().text("بازگشت", `usr_view_${id}`),
		});
	});

	// ── ارسال پیام / تغییر موجودی (شروع ورودی) ────────────────
	bot.callbackQuery(/^usr_msg_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		usersInput.set(ctx.from.id, { type: "sendmsg", targetId: id });
		await ctx.editText("✉️ <b>متن پیام</b> به کاربر را بفرستید:", {
			parse_mode: "HTML",
			reply_markup: cancelTo(`usr_view_${id}`),
		});
	});

	bot.callbackQuery(/^usr_baladd_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const user = await UserRepository.findById(id);
		usersInput.set(ctx.from.id, { type: "baladd", targetId: id });
		await ctx.editText(
			`➕ <b>افزایش موجودی</b>\n\n` +
				`موجودی فعلی: <b>${formatUsd(user?.walletBalance)}</b>\n\n` +
				`مبلغ افزایش (دلار) را بفرستید:`,
			{ parse_mode: "HTML", reply_markup: cancelTo(`usr_view_${id}`) },
		);
	});

	bot.callbackQuery(/^usr_balsub_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const user = await UserRepository.findById(id);
		usersInput.set(ctx.from.id, { type: "balsub", targetId: id });
		await ctx.editText(
			`➖ <b>کاهش موجودی</b>\n\n` +
				`موجودی فعلی: <b>${formatUsd(user?.walletBalance)}</b>\n\n` +
				`مبلغ کاهش (دلار) را بفرستید:`,
			{ parse_mode: "HTML", reply_markup: cancelTo(`usr_view_${id}`) },
		);
	});

	// ── کاربران جدید ──────────────────────────────────────────
	bot.callbackQuery(/^usr_new_(\w+?)_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const period = ctx.queryData[1];
		const page = Math.max(0, Number(ctx.queryData[2]));
		const since = periodSince(period);

		const total = await UserAdminRepository.countNewSince(since);
		const totalPages = Math.max(1, Math.ceil(total / NEW_PAGE));
		const safePage = Math.min(page, totalPages - 1);
		const users = await UserAdminRepository.getNewSince(
			since,
			NEW_PAGE,
			safePage * NEW_PAGE,
		);

		const label =
			NEW_USER_PERIODS.find((p) => p.code === period)?.label ?? period;
		await ctx.editText(
			`🆕 <b>کاربران جدید</b> — ${label}\n\nتعداد: <b>${total}</b>`,
			{
				parse_mode: "HTML",
				reply_markup: newUsersKeyboard(period, users, safePage, totalPages),
			},
		);
	});

	// ── همه کاربران + فیلتر ───────────────────────────────────
	bot.callbackQuery(/^usr_all_(\w+?)_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const filter = ctx.queryData[1] as UserListFilter;
		const page = Math.max(0, Number(ctx.queryData[2]));

		const total = await UserAdminRepository.countUsers(filter);
		const totalPages = Math.max(1, Math.ceil(total / ALL_PAGE));
		const safePage = Math.min(page, totalPages - 1);
		const users = await UserAdminRepository.getUsers(
			filter,
			ALL_PAGE,
			safePage * ALL_PAGE,
		);

		const label = USER_FILTERS.find((f) => f.code === filter)?.label ?? filter;
		await ctx.editText(
			`📊 <b>آمار کاربران</b> — ${label}\n\nتعداد: <b>${total}</b>`,
			{
				parse_mode: "HTML",
				reply_markup: allUsersKeyboard(filter, users, safePage, totalPages),
			},
		);
	});

	// ── عملیات گروهی ──────────────────────────────────────────
	bot.callbackQuery("usr_bulk", async (ctx) => {
		if (!(await gate(ctx))) return;
		await ctx.editText(
			"⚙️ <b>عملیات گروهی</b>\n\n⚠️ این عملیات روی <b>همه‌ی کاربران</b> اعمال می‌شود.",
			{ parse_mode: "HTML", reply_markup: bulkMenuKeyboard() },
		);
	});

	bot.callbackQuery("usr_bulk_add", async (ctx) => {
		if (!(await gate(ctx))) return;
		usersInput.set(ctx.from.id, { type: "bulk_add" });
		await ctx.editText("➕ مبلغ افزایش موجودی <b>همه</b> (دلار) را بفرستید:", {
			parse_mode: "HTML",
			reply_markup: cancelTo("usr_bulk"),
		});
	});

	bot.callbackQuery("usr_bulk_sub", async (ctx) => {
		if (!(await gate(ctx))) return;
		usersInput.set(ctx.from.id, { type: "bulk_sub" });
		await ctx.editText("➖ مبلغ کاهش موجودی <b>همه</b> (دلار) را بفرستید:", {
			parse_mode: "HTML",
			reply_markup: cancelTo("usr_bulk"),
		});
	});

	bot.callbackQuery("usr_bulk_zero", async (ctx) => {
		if (!(await gate(ctx))) return;
		await ctx.editText(
			"0️⃣ آیا از <b>صفر کردن موجودی همه کاربران</b> مطمئن هستید؟",
			{ parse_mode: "HTML", reply_markup: bulkConfirmKeyboard("zero") },
		);
	});

	bot.callbackQuery("usr_bulk_unblockall", async (ctx) => {
		if (!(await gate(ctx))) return;
		await ctx.editText("✅ آیا از <b>رفع مسدودی همه کاربران</b> مطمئن هستید؟", {
			parse_mode: "HTML",
			reply_markup: bulkConfirmKeyboard("unblockall"),
		});
	});

	bot.callbackQuery("usr_bulk_blockall", async (ctx) => {
		if (!(await gate(ctx))) return;
		await ctx.editText(
			"🚫 آیا از <b>مسدود کردن همه‌ی مشتریان</b> مطمئن هستید؟\n(ادمین‌ها مستثنا هستند)",
			{ parse_mode: "HTML", reply_markup: bulkConfirmKeyboard("blockall") },
		);
	});

	bot.callbackQuery(/^usr_bulk_confirm_(\w+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const action = ctx.queryData[1];
		let affected = 0;
		let msg = "";

		if (action === "zero") {
			affected = await UserAdminRepository.zeroAllBalances();
			msg = `0️⃣ موجودی ${affected} کاربر صفر شد.`;
		} else if (action === "unblockall") {
			affected = await UserAdminRepository.unblockAll();
			msg = `✅ ${affected} کاربر رفع مسدودی شدند.`;
		} else if (action === "blockall") {
			affected = await UserAdminRepository.blockAllCustomers();
			msg = `🚫 ${affected} مشتری مسدود شدند.`;
		} else {
			await ctx.answerCallbackQuery();
			return;
		}

		await ctx.answerCallbackQuery({ text: "انجام شد ✅" });
		await ctx.editText(`${msg}`, {
			parse_mode: "HTML",
			reply_markup: bulkMenuKeyboard(),
		});
	});

	// ── ورودی متنی ────────────────────────────────────────────
	bot.on("message", async (ctx, next) => {
		const userId = ctx.from?.id;
		if (!userId) return next?.();

		const state = usersInput.get(userId);
		if (!state) return next?.();
		if ((ctx as any).scene?.current) return next?.();
		if (!(await AdminService.hasPermission(userId, "users"))) {
			usersInput.delete(userId);
			return next?.();
		}

		const text = (ctx.text ?? "").trim();

		// جستجو
		if (state.type === "search") {
			if (!text) return;
			usersInput.delete(userId);
			const results = await UserAdminRepository.search(text);
			await ctx.send(
				`🔎 <b>نتایج جستجو</b>\n\nتعداد نتایج: <b>${results.length}</b>` +
					(results.length === 0 ? "\n\nکاربری یافت نشد." : ""),
				{ parse_mode: "HTML", reply_markup: searchResultsKeyboard(results) },
			);
			return;
		}

		// ارسال پیام به کاربر
		if (state.type === "sendmsg") {
			if (!text) return;
			usersInput.delete(userId);
			try {
				await (bot.api as any).sendMessage({
					chat_id: state.targetId,
					text: `📩 <b>پیام از پشتیبانی:</b>\n\n${text}`,
					parse_mode: "HTML",
				});
				await ctx.send("✅ پیام ارسال شد.");
			} catch {
				await ctx.send(
					"❌ ارسال پیام ناموفق بود (کاربر ربات را بلاک کرده یا استارت نزده).",
				);
			}
			const profile = await renderUserProfile(state.targetId);
			if (profile)
				await ctx.send(profile.text, {
					parse_mode: "HTML",
					reply_markup: profile.keyboard,
				});
			return;
		}

		// افزایش/کاهش موجودی تکی
		if (state.type === "baladd" || state.type === "balsub") {
			const amount = parseAmount(text);
			if (amount === null) {
				await ctx.send("❌ مبلغ نامعتبر است. یک عدد مثبت بفرستید.");
				return;
			}
			const op = state.type === "baladd" ? "add" : "subtract";
			let updatedUser: User;
			try {
				updatedUser = await UserRepository.updateWalletBalance(
					state.targetId,
					amount,
					op,
				);
				await WalletRepository.createTransaction({
					userId: BigInt(state.targetId) as never,
					amount: amount.toFixed(2) as never,
					type: op === "add" ? "credit" : "debit",
					source: "admin_adjust",
					description:
						op === "add"
							? "افزایش موجودی توسط ادمین"
							: "کاهش موجودی توسط ادمین",
				});
			} catch (err) {
				usersInput.delete(userId);
				await ctx.send(
					`❌ ${err instanceof Error && err.message === "Insufficient balance" ? "موجودی کافی نیست" : "خطا در تغییر موجودی"}`,
				);
				return;
			}
			usersInput.delete(userId);
			await notifyBalanceChange(
				bot,
				updatedUser,
				amount,
				op === "add" ? "credit" : "debit",
			);
			const profile = await renderUserProfile(state.targetId);
			if (profile)
				await ctx.send(`✅ موجودی به‌روزرسانی شد.\n\n${profile.text}`, {
					parse_mode: "HTML",
					reply_markup: profile.keyboard,
				});
			return;
		}

		// عملیات گروهی مبلغی
		if (state.type === "bulk_add" || state.type === "bulk_sub") {
			const amount = parseAmount(text);
			if (amount === null) {
				await ctx.send("❌ مبلغ نامعتبر است. یک عدد مثبت بفرستید.");
				return;
			}
			usersInput.delete(userId);
			const affected =
				state.type === "bulk_add"
					? await UserAdminRepository.addBalanceAll(amount)
					: await UserAdminRepository.subtractBalanceAll(amount);
			const verb = state.type === "bulk_add" ? "افزوده شد به" : "کم شد از";
			await ctx.send(
				`✅ مبلغ ${formatUsd(amount)} ${verb} موجودی ${affected} کاربر.`,
				{ parse_mode: "HTML", reply_markup: bulkMenuKeyboard() },
			);
			return;
		}
	});
}
