import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import {
	UserRepository,
	WalletRepository,
	WalletTopupRepository,
} from "../../../repositories/index.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import {
	topupManageKeyboard,
	topupsListKeyboard,
	walletAdminMenuKeyboard,
} from "../../../shared/keyboards/adminPanel/wallet.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { formatUsd } from "../../../shared/utils/currency.ts";

const PAGE = 8;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function gate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !(await AdminService.hasPermission(userId, "wallet"))) {
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

function cbMessage(ctx: any) {
	return (ctx.update?.callbackQuery ?? ctx.update?.callback_query)?.message;
}

/** نمایش متن — اگر پیام فعلی عکس (رسید) باشد و قابل ویرایش متن نباشد، حذف و ارسال مجدد. */
async function show(
	bot: AnyBot,
	ctx: any,
	text: string,
	keyboard: InlineKeyboard,
) {
	try {
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
		return;
	} catch {
		// پیام فعلی متن نیست
	}
	const msg = cbMessage(ctx);
	if (msg) {
		try {
			await (bot.api as any).deleteMessage({
				chat_id: msg.chat.id,
				message_id: msg.message_id,
			});
		} catch {}
	}
	await ctx.send(text, { parse_mode: "HTML", reply_markup: keyboard });
}

async function renderMenu(bot: AnyBot, ctx: any) {
	const pending = await WalletTopupRepository.countByStatus("pending");
	await show(
		bot,
		ctx,
		`💳 <b>مدیریت کیف پول</b>\n\n🧾 درخواست‌های در انتظار: <b>${pending}</b>`,
		walletAdminMenuKeyboard(pending),
	);
}

async function renderPending(bot: AnyBot, ctx: any, page: number) {
	const total = await WalletTopupRepository.countByStatus("pending");
	const totalPages = Math.max(1, Math.ceil(total / PAGE));
	const safePage = Math.min(Math.max(0, page), totalPages - 1);
	const topups = await WalletTopupRepository.getPending(PAGE, safePage * PAGE);

	await show(
		bot,
		ctx,
		`🧾 <b>درخواست‌های شارژ در انتظار</b>\n\nتعداد: <b>${total}</b>\nروی هر درخواست بزنید تا رسید را ببینید.`,
		topupsListKeyboard(topups, safePage, totalPages),
	);
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminWalletHandlers(bot: AnyBot) {
	// ── منوی اصلی ─────────────────────────────────────────────
	bot.callbackQuery("panel_wallet", async (ctx) => {
		if (!(await gate(ctx))) return;
		await renderMenu(bot, ctx);
	});

	// ── لیست درخواست‌های در انتظار ────────────────────────────
	bot.callbackQuery(/^wadm_pending_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		await renderPending(bot, ctx, Number(ctx.queryData[1]));
	});

	// ── نمایش رسید یک درخواست (پیام عکس جدید) ─────────────────
	bot.callbackQuery(/^wtopup_view_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const topup = await WalletTopupRepository.findById(
			Number(ctx.queryData[1]),
		);
		if (!topup) {
			await ctx.answerCallbackQuery({ text: "یافت نشد", show_alert: true });
			return;
		}
		if (topup.status !== "pending") {
			await ctx.answerCallbackQuery({
				text: "این درخواست قبلاً پردازش شده است.",
				show_alert: true,
			});
			return;
		}

		await ctx.answerCallbackQuery();

		const user = await UserRepository.findById(Number(topup.userId));
		const userLabel = user
			? `${[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}${user.username ? ` (@${user.username})` : ""}`
			: "—";
		const orderNote = topup.notes?.startsWith("order_payment:")
			? `\n🛒 مربوط به سفارش #${topup.notes.split(":")[1]}`
			: "";

		const caption =
			`🧾 <b>درخواست شارژ #${topup.id}</b>\n\n` +
			`👤 ${userLabel}\n` +
			`🆔 <code>${topup.userId}</code>\n` +
			`💵 مبلغ: <b>${formatMoney(topup.amount)}</b> تومان\n` +
			`📅 ${shortDate(topup.createdAt)}${orderNote}`;

		const fileId = topup.receiptPath.replace(/^telegram-file-id:/, "");

		try {
			await (bot.api as any).sendPhoto({
				chat_id: ctx.from.id,
				photo: fileId,
				caption,
				parse_mode: "HTML",
				reply_markup: topupManageKeyboard(topup),
			});
		} catch {
			// اگر رسید عکس نبود/خطا داد، به‌صورت متن نمایش بده
			await ctx.send(
				`${caption}\n\n🧾 رسید: <code>${topup.receiptPath}</code>`,
				{
					parse_mode: "HTML",
					reply_markup: topupManageKeyboard(topup),
				},
			);
		}
	});

	// ── تأیید درخواست ─────────────────────────────────────────
	bot.callbackQuery(/^wtopup_approve_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const topup = await WalletTopupRepository.findById(id);
		if (!topup || topup.status !== "pending") {
			await ctx.answerCallbackQuery({
				text: "این درخواست قبلاً پردازش شده است.",
				show_alert: true,
			});
			return;
		}

		const targetId = Number(topup.userId);
		const amount = Number.parseFloat(topup.amount ?? "0");

		await UserRepository.updateWalletBalance(targetId, amount, "add");
		await WalletRepository.addCredit(
			targetId,
			topup.amount ?? "0",
			"recharge",
			`تأیید شارژ کارت‌به‌کارت #${topup.id}`,
		);
		const admin = await AdminService.getAdmin(ctx.from.id);
		await WalletTopupRepository.setStatus(id, "approved", admin?.id ?? null);

		// اطلاع به کاربر
		const user = await UserRepository.findById(targetId);
		if (user?.notifyWallet !== false) {
			const t = i18n.buildT(user?.languageCode || "fa");
			try {
				await (bot.api as any).sendMessage({
					chat_id: targetId,
					text: t("rechargeApproved", formatMoney(amount)),
					parse_mode: "HTML",
					reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
				});
			} catch {}
		}

		await ctx.answerCallbackQuery({
			text: `✅ ${formatMoney(amount)} تومان شارژ شد.`,
			show_alert: true,
		});
		await renderPending(bot, ctx, 0);
	});

	// ── رد درخواست ────────────────────────────────────────────
	bot.callbackQuery(/^wtopup_reject_(\d+)$/, async (ctx) => {
		if (!(await gate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const topup = await WalletTopupRepository.findById(id);
		if (!topup || topup.status !== "pending") {
			await ctx.answerCallbackQuery({
				text: "این درخواست قبلاً پردازش شده است.",
				show_alert: true,
			});
			return;
		}

		const admin = await AdminService.getAdmin(ctx.from.id);
		await WalletTopupRepository.setStatus(id, "rejected", admin?.id ?? null);

		const user = await UserRepository.findById(Number(topup.userId));
		const t = i18n.buildT(user?.languageCode || "fa");
		try {
			await (bot.api as any).sendMessage({
				chat_id: Number(topup.userId),
				text: t("rechargeRejected"),
				parse_mode: "HTML",
				reply_markup: new InlineKeyboard().text(t("btnWallet"), "wallet"),
			});
		} catch {}

		await ctx.answerCallbackQuery({ text: "❌ درخواست رد شد." });
		await renderPending(bot, ctx, 0);
	});

	// ── آمار کیف پول ──────────────────────────────────────────
	bot.callbackQuery("wadm_stats", async (ctx) => {
		if (!(await gate(ctx))) return;

		const [
			totalBalance,
			pendingCount,
			pendingSum,
			approvedCount,
			approvedSum,
			rejectedCount,
			totalCredit,
			totalDebit,
		] = await Promise.all([
			WalletTopupRepository.totalUsersBalance(),
			WalletTopupRepository.countByStatus("pending"),
			WalletTopupRepository.sumAmountByStatus("pending"),
			WalletTopupRepository.countByStatus("approved"),
			WalletTopupRepository.sumAmountByStatus("approved"),
			WalletTopupRepository.countByStatus("rejected"),
			WalletTopupRepository.sumTransactionsByType("credit"),
			WalletTopupRepository.sumTransactionsByType("debit"),
		]);

		const text =
			`📊 <b>آمار کیف پول</b>\n\n` +
			`💰 مجموع موجودی کاربران: <b>${formatUsd(totalBalance)}</b>\n\n` +
			`🧾 <b>درخواست‌های شارژ</b>\n` +
			`• در انتظار: <b>${pendingCount}</b> (${formatMoney(pendingSum)} تومان)\n` +
			`• تأییدشده: <b>${approvedCount}</b> (${formatMoney(approvedSum)} تومان)\n` +
			`• ردشده: <b>${rejectedCount}</b>\n\n` +
			`📥 مجموع اعتبار: <b>${formatUsd(totalCredit)}</b>\n` +
			`📤 مجموع برداشت: <b>${formatUsd(totalDebit)}</b>`;

		await show(
			bot,
			ctx,
			text,
			new InlineKeyboard().text("بازگشت", "panel_wallet"),
		);
	});

	// ── تراکنش‌های اخیر ───────────────────────────────────────
	bot.callbackQuery("wadm_tx", async (ctx) => {
		if (!(await gate(ctx))) return;
		const txs = await WalletTopupRepository.getRecentTransactions(15);

		let text = `📜 <b>تراکنش‌های اخیر</b>\n\n`;
		if (txs.length === 0) {
			text += "تراکنشی ثبت نشده است.";
		} else {
			for (const tx of txs) {
				const sign = tx.type === "credit" ? "➕" : "➖";
				text +=
					`${sign} <b>${formatUsd(tx.amount)}</b> | 🆔 <code>${tx.userId}</code>\n` +
					`   ${tx.source}${tx.description ? ` — ${tx.description}` : ""} | ${shortDate(tx.createdAt)}\n`;
			}
		}

		await show(
			bot,
			ctx,
			text,
			new InlineKeyboard().text("بازگشت", "panel_wallet"),
		);
	});
}
