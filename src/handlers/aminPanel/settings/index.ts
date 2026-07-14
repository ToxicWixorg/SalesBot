import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import { config, isOwner } from "../../../config.ts";
import {
	AdminRepository,
	BackupSettingsRepository,
	BotSettingsRepository,
	ForceJoinRepository,
	ForumSettingsRepository,
	PaymentRepository,
	UserRepository,
} from "../../../repositories/index.ts";
import {
	getForumConfig,
	invalidateForumConfigCache,
} from "../../../services/forumConfig.ts";
import {
	buildDailyCron,
	parseBackupHour,
	restoreDatabase,
	runBackup,
	TELEGRAM_MAX_DOWNLOAD_BYTES,
} from "../../../services/BackupService.ts";
import type { AdminRole } from "../../../services/bot/admin/Admin/Roles.ts";
import { getRoleName } from "../../../services/bot/admin/getRoleName.ts";
import { AdminService } from "../../../services/bot/admin/Service.ts";
import {
	adminManageKeyboard,
	adminsListKeyboard,
	backupSettingsKeyboard,
	botSettingsKeyboard,
	cardManageKeyboard,
	cardsListKeyboard,
	cryptoSettingsKeyboard,
	forceJoinListKeyboard,
	forceJoinManageKeyboard,
	forumSettingsKeyboard,
	settingsMainKeyboard,
	walletSettingsKeyboard,
	zarinpalSettingsKeyboard,
} from "../../../shared/keyboards/adminPanel/settings.ts";

// ─────────────────────────────────────────────────────────────
// State machine برای ورودی متنی (فقط مالک)
// ─────────────────────────────────────────────────────────────

type SettingsInput =
	| { type: "add_admin" }
	| {
			type: "add_card";
			step: "number" | "holder" | "bank";
			cardNumber?: string;
			holderName?: string;
	  }
	| { type: "referral_amount" }
	| { type: "zp_merchant" }
	| { type: "zp_callback" }
	| { type: "cr_address" }
	| { type: "cr_apikey" }
	| { type: "bk_channel" }
	| { type: "bk_hour" }
	| { type: "bk_restore" }
	| {
			type: "add_forcejoin";
			step: "id" | "url" | "name";
			channelId?: string;
			channelUrl?: string;
	  }
	| { type: "forum_group" }
	| { type: "forum_support" }
	| { type: "forum_orders" }
	| { type: "forum_reports" }
	| { type: "forum_newusers" }
	| { type: "forum_news" }
	| { type: "forum_referral" }
	| { type: "forum_payments" };

const settingsInput = new Map<number, SettingsInput>();

/**
 * Backup file uploaded for restore, held between upload and the final confirm
 * click (restore is destructive, so it never runs on upload alone). Keyed by
 * owner userId. Cleared on confirm/cancel.
 */
const pendingRestore = new Map<number, { dump: Buffer; fileName?: string }>();

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const cancelTo = (cb: string) => new InlineKeyboard().text("لغو", cb);

/** فقط مالک. در صورت غیرمجاز alert می‌دهد و false برمی‌گرداند. وضعیت ورودی را پاک می‌کند. */
async function ownerGate(ctx: any): Promise<boolean> {
	const userId = ctx.from?.id;
	if (!userId || !isOwner(userId)) {
		await ctx.answerCallbackQuery({
			text: "⛔ این بخش فقط برای مالک ربات است.",
			show_alert: true,
		});
		return false;
	}
	settingsInput.delete(userId);
	return true;
}

function digits(s: string): string {
	return s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

// ─── متن‌سازهای منو ──────────────────────────────────────────

async function botMenu() {
	const s = await BotSettingsRepository.getOrCreate();
	const status = s.maintenanceMode ? "🔴 خاموش (حالت تعمیرات)" : "🟢 روشن";
	const text =
		`🤖 <b>مدیریت ربات</b>\n\n` +
		`وضعیت ربات: <b>${status}</b>\n` +
		(s.maintenanceMode && s.maintenanceMessage
			? `پیام تعمیرات: ${s.maintenanceMessage}\n`
			: "");
	return { text, keyboard: botSettingsKeyboard(s) };
}

async function walletMenu() {
	const s = await PaymentRepository.getOrCreateSettings();
	const text =
		`💳 <b>مدیریت پرداخت و ولت</b>\n\n` + `روش‌های پرداخت فعال را مدیریت کنید.`;
	return { text, keyboard: walletSettingsKeyboard(s) };
}

async function cardsMenu() {
	const cards = await PaymentRepository.getAllCards();
	const text =
		`🔢 <b>شماره کارت‌ها</b>\n\n` +
		(cards.length === 0
			? "هیچ کارتی ثبت نشده است."
			: `تعداد: <b>${cards.length}</b>`);
	return { text, keyboard: cardsListKeyboard(cards) };
}

async function zarinpalMenu() {
	const s = await PaymentRepository.getOrCreateSettings();
	const text =
		`🏦 <b>تنظیمات زرین‌پال</b>\n\n` +
		`مرچنت: <code>${s.zarinpalMerchantId ?? "—"}</code>\n` +
		`کال‌بک: <code>${s.zarinpalCallbackUrl ?? "—"}</code>`;
	return { text, keyboard: zarinpalSettingsKeyboard(s) };
}

async function cryptoMenu() {
	const s = await PaymentRepository.getOrCreateSettings();
	const text =
		`🪙 <b>تنظیمات کریپتو (NOWPayments)</b>\n\n` +
		`آدرس ولت: <code>${s.cryptoAddress ?? "—"}</code>\n` +
		`شبکه: <b>${s.cryptoNetwork ?? "TRC20"}</b>\n` +
		`کلید API: <code>${s.nowpaymentsApiKey ? "تنظیم شده ✅" : "—"}</code>`;
	return { text, keyboard: cryptoSettingsKeyboard(s) };
}

async function backupMenu() {
	const s = await BackupSettingsRepository.getOrCreate();
	const hour = parseBackupHour(s.cronSchedule);
	const last = s.lastBackupAt
		? `${new Date(s.lastBackupAt).toLocaleString("en-GB")} (${s.lastBackupStatus ?? "—"})`
		: "—";
	const text =
		`💾 <b>مدیریت بکاپ</b>\n\n` +
		`کانال بکاپ: <code>${s.telegramChannelId ?? "—"}</code>\n` +
		`ساعت بکاپ خودکار: <b>${String(hour).padStart(2, "0")}:00</b>\n` +
		`آخرین بکاپ: ${last}`;
	return { text, keyboard: backupSettingsKeyboard(s) };
}

async function forumMenu() {
	const s = await ForumSettingsRepository.getOrCreate();
	const eff = await getForumConfig();
	const text =
		`🗂 <b>مدیریت گروه فروم</b>\n\n` +
		`آیدی گروه پشتیبانی و آیدی تاپیک‌ها را اینجا تغییر دهید.\n` +
		`هر مقداری که خالی («پیش‌فرض») باشد، از فایل تنظیمات (.env) خوانده می‌شود.\n` +
		`برای بازگرداندن یک مقدار به پیش‌فرض، عبارت <code>-</code> را بفرستید.\n\n` +
		`<b>مقادیر مؤثر فعلی:</b>\n` +
		`🆔 گروه: <code>${eff.groupId ?? "—"}</code>\n` +
		`💬 پشتیبانی: <code>${eff.topics.support}</code>\n` +
		`📦 سفارش‌ها: <code>${eff.topics.order}</code>\n` +
		`⚠️ گزارش‌ها: <code>${eff.topics.report}</code>\n` +
		`👤 کاربران جدید: <code>${eff.topics.new_users}</code>\n` +
		`📣 اخبار: <code>${eff.topics.news}</code>\n` +
		`🎁 ریفرال: <code>${eff.topics.new_referral}</code>\n` +
		`💳 پرداخت‌ها: <code>${eff.topics.payments ?? eff.topics.order}</code>`;
	return { text, keyboard: forumSettingsKeyboard(s) };
}

async function forceJoinMenu() {
	const channels = await ForceJoinRepository.getAll();
	const active = channels.filter((c) => c.isActive).length;
	const text =
		`📢 <b>جوین اجباری</b>\n\n` +
		`کاربران قبل از استفاده از ربات باید در کانال‌های فعال زیر عضو شوند.\n\n` +
		(channels.length === 0
			? "هیچ کانالی ثبت نشده است."
			: `تعداد کانال‌ها: <b>${channels.length}</b> (فعال: <b>${active}</b>)`);
	return { text, keyboard: forceJoinListKeyboard(channels) };
}

async function adminsMenu() {
	const admins = await AdminRepository.getAll();
	const text =
		`👮 <b>مدیریت ادمین‌ها</b>\n\n` +
		(admins.length === 0
			? "هیچ ادمینی ثبت نشده است."
			: `تعداد ادمین‌ها: <b>${admins.length}</b>`);
	return { text, keyboard: adminsListKeyboard(admins) };
}

// ─────────────────────────────────────────────────────────────
// ثبت هندلرها
// ─────────────────────────────────────────────────────────────

export function setupAdminSettingsHandlers(bot: AnyBot) {
	// ── ورود به منوی تنظیمات ──────────────────────────────────
	bot.callbackQuery("panel_setting", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		await ctx.editText("⚙️ <b>تنظیمات ربات</b>\n\nیک بخش را انتخاب کنید:", {
			parse_mode: "HTML",
			reply_markup: settingsMainKeyboard(),
		});
	});

	// ───────────────────────── ادمین‌ها ───────────────────────
	bot.callbackQuery("set_admins", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await adminsMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery(/^set_admin_view_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const admin = await AdminRepository.findById(Number(ctx.queryData[1]));
		if (!admin) {
			await ctx.answerCallbackQuery({
				text: "ادمین یافت نشد",
				show_alert: true,
			});
			return;
		}
		const ownerAdmin = isOwner(Number(admin.userId));
		const text =
			`👤 <b>${admin.displayName ?? admin.userId}</b>\n\n` +
			`آیدی: <code>${admin.userId}</code>\n` +
			`نقش: <b>${getRoleName(admin.role as AdminRole)}</b>\n` +
			`وضعیت: <b>${admin.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>` +
			(ownerAdmin ? `\n\n👑 <b>مالک ربات</b> — قابل تغییر نیست.` : "");
		await ctx.editText(text, {
			parse_mode: "HTML",
			reply_markup: adminManageKeyboard(admin, ownerAdmin),
		});
	});

	bot.callbackQuery(/^set_admin_toggle_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const admin = await AdminRepository.findById(id);
		if (!admin) {
			await ctx.answerCallbackQuery({
				text: "ادمین یافت نشد",
				show_alert: true,
			});
			return;
		}
		if (isOwner(Number(admin.userId))) {
			await ctx.answerCallbackQuery({
				text: "⛔ مالک ربات قابل تغییر نیست.",
				show_alert: true,
			});
			return;
		}
		await AdminService.toggleStatus(id, !admin.isActive, ctx.from.id);
		const updated = await AdminRepository.findById(id);
		await ctx.editText(
			`👤 <b>${updated!.displayName ?? updated!.userId}</b>\n\n` +
				`وضعیت جدید: <b>${updated!.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`,
			{ parse_mode: "HTML", reply_markup: adminManageKeyboard(updated!) },
		);
	});

	bot.callbackQuery(/^set_admin_role_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const admin = await AdminRepository.findById(id);
		if (!admin) {
			await ctx.answerCallbackQuery({
				text: "ادمین یافت نشد",
				show_alert: true,
			});
			return;
		}
		if (isOwner(Number(admin.userId))) {
			await ctx.answerCallbackQuery({
				text: "⛔ مالک ربات قابل تغییر نیست.",
				show_alert: true,
			});
			return;
		}
		// چرخش بین «ادمین» و «پشتیبان»
		const nextRole: AdminRole = admin.role === "admin" ? "support" : "admin";
		await AdminService.changeRole(id, nextRole, ctx.from.id);
		const updated = await AdminRepository.findById(id);
		await ctx.editText(
			`👤 <b>${updated!.displayName ?? updated!.userId}</b>\n\n` +
				`نقش جدید: <b>${getRoleName(updated!.role as AdminRole)}</b>`,
			{ parse_mode: "HTML", reply_markup: adminManageKeyboard(updated!) },
		);
	});

	bot.callbackQuery(/^set_admin_del_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const target = await AdminRepository.findById(id);
		if (target && isOwner(Number(target.userId))) {
			await ctx.answerCallbackQuery({
				text: "⛔ مالک ربات قابل حذف نیست.",
				show_alert: true,
			});
			return;
		}
		try {
			await AdminService.removeAdmin(id, ctx.from.id);
		} catch (err) {
			await ctx.answerCallbackQuery({
				text: err instanceof Error ? err.message : "خطا در حذف",
				show_alert: true,
			});
			return;
		}
		await ctx.answerCallbackQuery({ text: "✅ ادمین حذف شد" });
		const { text, keyboard } = await adminsMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_admin_add", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "add_admin" });
		await ctx.editText(
			`➕ <b>افزودن ادمین</b>\n\n` +
				`یکی از موارد زیر را بفرستید:\n` +
				`• یک پیام از کاربر را <b>فوروارد</b> کنید\n` +
				`• یا <b>آیدی عددی</b> کاربر را بفرستید\n\n` +
				`⚠️ کاربر باید قبلاً ربات را استارت زده باشد.`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_admins") },
		);
	});

	// ───────────────────────── ربات ───────────────────────────
	bot.callbackQuery("set_bot", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await botMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bot_toggle", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const off = await BotSettingsRepository.toggleMaintenance();
		await ctx.answerCallbackQuery({
			text: off ? "ربات خاموش شد (حالت تعمیرات)" : "ربات روشن شد",
		});
		const { text, keyboard } = await botMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bot_shop", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await BotSettingsRepository.getOrCreate();
		await BotSettingsRepository.update({ shopEnabled: !s.shopEnabled });
		const { text, keyboard } = await botMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bot_referral", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await BotSettingsRepository.getOrCreate();
		await BotSettingsRepository.update({ referralEnabled: !s.referralEnabled });
		const { text, keyboard } = await botMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bot_referral_amount", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await BotSettingsRepository.getOrCreate();
		const current = Number.parseFloat(
			String(s.referralRewardAmount ?? "1"),
		).toFixed(2);
		settingsInput.set(ctx.from.id, { type: "referral_amount" });
		await ctx.editText(
			`💵 <b>مبلغ پاداش ریفرال</b>\n\n` +
				`مبلغ فعلی: <b>$${current}</b>\n\n` +
				`مبلغ جدید را به <b>دلار</b> بفرستید (مثلاً <code>1</code> یا <code>0.5</code>).\n` +
				`برای غیرفعال کردن پاداش، <code>0</code> بفرستید.`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_bot") },
		);
	});

	// ───────────────────────── پرداخت/ولت ─────────────────────
	bot.callbackQuery("set_wallet", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await walletMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_pay_card", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await PaymentRepository.getOrCreateSettings();
		await PaymentRepository.updateSettings({ cardEnabled: !s.cardEnabled });
		const { text, keyboard } = await walletMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	// کارت‌ها
	bot.callbackQuery("set_cards", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await cardsMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery(/^set_card_view_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const card = await PaymentRepository.findCardById(Number(ctx.queryData[1]));
		if (!card) {
			await ctx.answerCallbackQuery({
				text: "کارت یافت نشد",
				show_alert: true,
			});
			return;
		}
		const text =
			`💳 <b>جزئیات کارت</b>\n\n` +
			`شماره: <code>${card.cardNumber}</code>\n` +
			`صاحب کارت: <b>${card.holderName}</b>\n` +
			`بانک: <b>${card.bankName ?? "—"}</b>\n` +
			`وضعیت: <b>${card.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`;
		await ctx.editText(text, {
			parse_mode: "HTML",
			reply_markup: cardManageKeyboard(card),
		});
	});

	bot.callbackQuery(/^set_card_toggle_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const card = await PaymentRepository.findCardById(id);
		if (!card) {
			await ctx.answerCallbackQuery({
				text: "کارت یافت نشد",
				show_alert: true,
			});
			return;
		}
		const updated = await PaymentRepository.setCardActive(id, !card.isActive);
		await ctx.editText(
			`💳 <code>${updated.cardNumber}</code>\n\n` +
				`وضعیت جدید: <b>${updated.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`,
			{ parse_mode: "HTML", reply_markup: cardManageKeyboard(updated) },
		);
	});

	bot.callbackQuery(/^set_card_del_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		await PaymentRepository.deleteCard(Number(ctx.queryData[1]));
		await ctx.answerCallbackQuery({ text: "✅ کارت حذف شد" });
		const { text, keyboard } = await cardsMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_card_add", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "add_card", step: "number" });
		await ctx.editText(
			`➕ <b>افزودن کارت</b>\n\n` + `<b>شماره کارت</b> را بفرستید:`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_cards") },
		);
	});

	// زرین‌پال
	bot.callbackQuery("set_zarinpal", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await zarinpalMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_zp_toggle", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await PaymentRepository.getOrCreateSettings();
		await PaymentRepository.updateSettings({
			zarinpalEnabled: !s.zarinpalEnabled,
		});
		const { text, keyboard } = await zarinpalMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_zp_sandbox", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await PaymentRepository.getOrCreateSettings();
		await PaymentRepository.updateSettings({
			zarinpalSandbox: !s.zarinpalSandbox,
		});
		const { text, keyboard } = await zarinpalMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_zp_merchant", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "zp_merchant" });
		await ctx.editText(`✏️ <b>مرچنت آیدی زرین‌پال</b> را بفرستید:`, {
			parse_mode: "HTML",
			reply_markup: cancelTo("set_zarinpal"),
		});
	});

	bot.callbackQuery("set_zp_callback", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "zp_callback" });
		await ctx.editText(
			`✏️ <b>لینک کال‌بک زرین‌پال</b> را بفرستید:\n` +
				`مثال: <code>https://example.com/zarinpal/callback</code>`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_zarinpal") },
		);
	});

	// کریپتو
	bot.callbackQuery("set_crypto", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await cryptoMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_cr_toggle", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await PaymentRepository.getOrCreateSettings();
		await PaymentRepository.updateSettings({
			nowpaymentsEnabled: !s.nowpaymentsEnabled,
		});
		const { text, keyboard } = await cryptoMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_cr_network", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await PaymentRepository.getOrCreateSettings();
		const order = ["TRC20", "ERC20", "BEP20"];
		const idx = order.indexOf((s.cryptoNetwork ?? "TRC20").toUpperCase());
		const next = order[(idx + 1) % order.length];
		await PaymentRepository.updateSettings({ cryptoNetwork: next });
		const { text, keyboard } = await cryptoMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_cr_address", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "cr_address" });
		await ctx.editText(`✏️ <b>آدرس ولت کریپتو</b> را بفرستید:`, {
			parse_mode: "HTML",
			reply_markup: cancelTo("set_crypto"),
		});
	});

	bot.callbackQuery("set_cr_apikey", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "cr_apikey" });
		await ctx.editText(`✏️ <b>کلید API نون‌پیمنتس</b> را بفرستید:`, {
			parse_mode: "HTML",
			reply_markup: cancelTo("set_crypto"),
		});
	});

	// ───────────────────────── بکاپ ───────────────────────────
	bot.callbackQuery("set_backup", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await backupMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bk_toggle", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const s = await BackupSettingsRepository.getOrCreate();
		if (!s.isEnabled && !s.telegramChannelId) {
			await ctx.answerCallbackQuery({
				text: "ابتدا کانال بکاپ را تنظیم کنید.",
				show_alert: true,
			});
			return;
		}
		await BackupSettingsRepository.update({ isEnabled: !s.isEnabled });
		const { text, keyboard } = await backupMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bk_channel", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "bk_channel" });
		await ctx.editText(
			`✏️ <b>کانال بکاپ</b> را بفرستید:\n` +
				`• آیدی عددی کانال (مثل <code>-1001234567890</code>)\n` +
				`• یا یوزرنیم (مثل <code>@my_backup_channel</code>)\n\n` +
				`⚠️ ربات باید در آن کانال ادمین باشد.`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_backup") },
		);
	});

	bot.callbackQuery("set_bk_hour", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "bk_hour" });
		await ctx.editText(
			`🕒 <b>ساعت بکاپ خودکار</b> را بفرستید (عددی بین 0 تا 23):`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_backup") },
		);
	});

	bot.callbackQuery("set_bk_now", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		// A callback query can only be answered once, and the backup can take a few
		// seconds, so give immediate feedback here and report the outcome via a
		// follow-up message (not a second answerCallbackQuery, which is a no-op).
		await ctx.answerCallbackQuery({ text: "⏳ در حال تهیه بکاپ..." });
		const result = await runBackup(bot);
		await ctx.send(
			result.ok
				? "✅ بکاپ با موفقیت به کانال ارسال شد."
				: `❌ تهیه بکاپ ناموفق بود.\nخطا: ${result.error ?? "نامشخص"}`,
			{ parse_mode: "HTML" },
		);
		const { text, keyboard } = await backupMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_bk_restore", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		// Exit any active scene first — otherwise the scenes plugin swallows the
		// uploaded .sql document before the restore handler below can read it, and
		// the settings message handler defers while `scene.current` is set.
		try {
			await (ctx as any).scene?.exit();
		} catch {}
		settingsInput.set(ctx.from.id, { type: "bk_restore" });
		await ctx.editText(
			`♻️ <b>بازیابی از فایل بکاپ</b>\n\n` +
				`فایل بکاپ دیتابیس (<code>.sql</code>) را به‌صورت «فایل/سند» همین‌جا بفرستید.\n\n` +
				`⚠️ <b>هشدار:</b> با این کار تمام داده‌های فعلی ربات پاک شده و با محتوای این فایل جایگزین می‌شود. این عمل برگشت‌ناپذیر است.\n` +
				`پس از بازیابی موفق، ربات به‌صورت خودکار ری‌استارت می‌شود.`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_backup") },
		);
	});

	bot.callbackQuery("bk_restore_confirm", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const pending = pendingRestore.get(ctx.from.id);
		if (!pending) {
			await ctx.answerCallbackQuery({
				text: "فایلی برای بازیابی یافت نشد. دوباره فایل را بفرستید.",
				show_alert: true,
			});
			return;
		}
		pendingRestore.delete(ctx.from.id);
		await ctx.answerCallbackQuery({ text: "⏳ در حال بازیابی..." });
		await ctx.editText(
			"⏳ در حال بازیابی دیتابیس... چند لحظه صبر کنید و ربات را ری‌استارت نکنید.",
			{ parse_mode: "HTML" },
		);

		const result = await restoreDatabase(pending.dump);
		if (!result.ok) {
			await ctx.send(
				`❌ بازیابی ناموفق بود.\nخطا: ${result.error ?? "نامشخص"}`,
				{
					parse_mode: "HTML",
				},
			);
			return;
		}

		await ctx.send(
			`✅ بازیابی با موفقیت انجام شد (${((result.sizeBytes ?? 0) / 1024).toFixed(1)} KB).\n` +
				`♻️ ربات برای اعمال کامل تغییرات ری‌استارت می‌شود...`,
			{ parse_mode: "HTML" },
		);
		// Restart so the bot reconnects with fresh pooled connections against the
		// restored schema (PM2/ecosystem autorestart brings it back up).
		setTimeout(() => process.exit(0), 1500);
	});

	bot.callbackQuery("bk_restore_cancel", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		pendingRestore.delete(ctx.from.id);
		const { text, keyboard } = await backupMenu();
		await ctx.editText(`❌ بازیابی لغو شد.\n\n${text}`, {
			parse_mode: "HTML",
			reply_markup: keyboard,
		});
	});

	// ───────────────────────── گروه فروم ──────────────────────
	bot.callbackQuery("set_forum", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await forumMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	// روشن/خاموش کردن ارسال پیام به گروه فروم (پیش‌فرض: خاموش)
	bot.callbackQuery("set_forum_notify_toggle", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const current = await ForumSettingsRepository.getOrCreate();
		await ForumSettingsRepository.update({
			notificationsEnabled: !current.notificationsEnabled,
		});
		await invalidateForumConfigCache();
		await ctx.answerCallbackQuery({
			text: !current.notificationsEnabled
				? "🔔 ارسال پیام به گروه روشن شد."
				: "🔕 ارسال پیام به گروه خاموش شد.",
		});
		const { text, keyboard } = await forumMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	// Prompt helper for a forum field edit (group id or a topic id).
	const forumPrompt = async (
		ctx: any,
		type: SettingsInput["type"],
		label: string,
		isGroup = false,
	) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type } as SettingsInput);
		const hint = isGroup
			? `مثال: <code>-1001234567890</code>`
			: `یک عدد صحیح (آیدی تاپیک) بفرستید. مثال: <code>5</code>`;
		await ctx.editText(
			`✏️ <b>${label}</b> را بفرستید:\n${hint}\n\n` +
				`برای بازگرداندن به پیش‌فرض (.env)، عبارت <code>-</code> را بفرستید.`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_forum") },
		);
	};

	bot.callbackQuery("set_forum_group", (ctx) =>
		forumPrompt(ctx, "forum_group", "آیدی گروه پشتیبانی", true),
	);
	bot.callbackQuery("set_forum_support", (ctx) =>
		forumPrompt(ctx, "forum_support", "آیدی تاپیک پشتیبانی"),
	);
	bot.callbackQuery("set_forum_orders", (ctx) =>
		forumPrompt(ctx, "forum_orders", "آیدی تاپیک سفارش‌ها"),
	);
	bot.callbackQuery("set_forum_reports", (ctx) =>
		forumPrompt(ctx, "forum_reports", "آیدی تاپیک گزارش‌ها"),
	);
	bot.callbackQuery("set_forum_newusers", (ctx) =>
		forumPrompt(ctx, "forum_newusers", "آیدی تاپیک کاربران جدید"),
	);
	bot.callbackQuery("set_forum_news", (ctx) =>
		forumPrompt(ctx, "forum_news", "آیدی تاپیک اخبار"),
	);
	bot.callbackQuery("set_forum_referral", (ctx) =>
		forumPrompt(ctx, "forum_referral", "آیدی تاپیک ریفرال"),
	);
	bot.callbackQuery("set_forum_payments", (ctx) =>
		forumPrompt(ctx, "forum_payments", "آیدی تاپیک پرداخت‌ها"),
	);

	// ───────────────────────── جوین اجباری ────────────────────
	bot.callbackQuery("set_forcejoin", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const { text, keyboard } = await forceJoinMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery(/^set_fj_view_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const channel = await ForceJoinRepository.findById(
			Number(ctx.queryData[1]),
		);
		if (!channel) {
			await ctx.answerCallbackQuery({
				text: "کانال یافت نشد",
				show_alert: true,
			});
			return;
		}
		const text =
			`📢 <b>${channel.channelName}</b>\n\n` +
			`شناسه: <code>${channel.channelId}</code>\n` +
			`لینک: ${channel.channelUrl}\n` +
			`وضعیت: <b>${channel.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`;
		await ctx.editText(text, {
			parse_mode: "HTML",
			reply_markup: forceJoinManageKeyboard(channel),
		});
	});

	bot.callbackQuery(/^set_fj_toggle_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		const id = Number(ctx.queryData[1]);
		const channel = await ForceJoinRepository.findById(id);
		if (!channel) {
			await ctx.answerCallbackQuery({
				text: "کانال یافت نشد",
				show_alert: true,
			});
			return;
		}
		const updated = await ForceJoinRepository.setActive(id, !channel.isActive);
		await ctx.editText(
			`📢 <b>${updated.channelName}</b>\n\n` +
				`وضعیت جدید: <b>${updated.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`,
			{ parse_mode: "HTML", reply_markup: forceJoinManageKeyboard(updated) },
		);
	});

	bot.callbackQuery(/^set_fj_del_(\d+)$/, async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		await ForceJoinRepository.deleteChannel(Number(ctx.queryData[1]));
		await ctx.answerCallbackQuery({ text: "✅ کانال حذف شد" });
		const { text, keyboard } = await forceJoinMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
	});

	bot.callbackQuery("set_fj_add", async (ctx) => {
		if (!(await ownerGate(ctx))) return;
		settingsInput.set(ctx.from.id, { type: "add_forcejoin", step: "id" });
		await ctx.editText(
			`➕ <b>افزودن کانال جوین اجباری</b>\n\n` +
				`<b>شناسه کانال</b> را بفرستید:\n` +
				`• یوزرنیم عمومی (مثل <code>@my_channel</code>)\n` +
				`• یا آیدی عددی (مثل <code>-1001234567890</code>)\n\n` +
				`⚠️ ربات باید در آن کانال <b>ادمین</b> باشد تا بتواند عضویت را بررسی کند.`,
			{ parse_mode: "HTML", reply_markup: cancelTo("set_forcejoin") },
		);
	});

	// ───────────────────────── ورودی متنی ─────────────────────
	bot.on("message", async (ctx, next) => {
		const userId = ctx.from?.id;
		if (!userId) return next?.();

		const state = settingsInput.get(userId);
		if (!state) return next?.();
		if ((ctx as any).scene?.current) return next?.();
		if (!isOwner(userId)) {
			settingsInput.delete(userId);
			return next?.();
		}

		const message = (ctx as any).update?.message ?? {};
		const text = (ctx.text ?? "").trim();

		// ── افزودن ادمین ──────────────────────────────────────
		if (state.type === "add_admin") {
			const forwardedId: number | undefined =
				message.forward_from?.id ??
				message.forward_origin?.sender_user?.id ??
				(text && /^\d{4,}$/.test(digits(text))
					? Number(digits(text))
					: undefined);

			if (!forwardedId) {
				await ctx.send(
					"❌ نتوانستم کاربر را تشخیص دهم. یک پیام از کاربر فوروارد کنید یا آیدی عددی بفرستید.\n" +
						"(اگر فوروارد محرمانه است، آیدی عددی را بفرستید.)",
					{ parse_mode: "HTML" },
				);
				return;
			}

			settingsInput.delete(userId);

			const user = await UserRepository.findById(forwardedId);
			if (!user) {
				await ctx.send(
					"❌ این کاربر در دیتابیس نیست. ابتدا باید ربات را استارت بزند.",
					{ parse_mode: "HTML" },
				);
				return;
			}

			try {
				await AdminService.createAdmin({
					userId: forwardedId,
					role: "admin",
					createdBy: userId,
				});
			} catch (err) {
				await ctx.send(
					`❌ ${err instanceof Error ? err.message : "خطا در افزودن ادمین"}`,
					{ parse_mode: "HTML" },
				);
				return;
			}

			// Notify the new admin. The in-bot panel is role-based, so no password
			// setup is required — they can open it straight from the main menu.
			try {
				await (bot.api as any).sendMessage({
					chat_id: forwardedId,
					text:
						"🎉 شما به‌عنوان <b>ادمین</b> اضافه شدید!\n\n" +
						"برای ورود به پنل مدیریت، /start را بزنید و دکمه «پنل مدیریت» را انتخاب کنید.",
					parse_mode: "HTML",
				});
			} catch {}

			const { text: menuText, keyboard } = await adminsMenu();
			await ctx.send(`✅ ادمین جدید اضافه شد.\n\n${menuText}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		// ── افزودن کارت (چندمرحله‌ای) ─────────────────────────
		if (state.type === "add_card") {
			if (!text) return;

			if (state.step === "number") {
				const cardNumber = digits(text).replace(/[\s-]/g, "");
				if (!/^\d{12,19}$/.test(cardNumber)) {
					await ctx.send("❌ شماره کارت نامعتبر است. دوباره بفرستید.");
					return;
				}
				settingsInput.set(userId, {
					type: "add_card",
					step: "holder",
					cardNumber,
				});
				await ctx.send("👤 <b>نام صاحب کارت</b> را بفرستید:", {
					parse_mode: "HTML",
				});
				return;
			}

			if (state.step === "holder") {
				settingsInput.set(userId, {
					type: "add_card",
					step: "bank",
					cardNumber: state.cardNumber,
					holderName: text,
				});
				await ctx.send("🏦 <b>نام بانک</b> را بفرستید (یا «-» برای رد کردن):", {
					parse_mode: "HTML",
				});
				return;
			}

			if (state.step === "bank") {
				const bankName = text === "-" ? null : text;
				settingsInput.delete(userId);
				await PaymentRepository.addCard({
					cardNumber: state.cardNumber!,
					holderName: state.holderName!,
					bankName,
				});
				const { text: menuText, keyboard } = await cardsMenu();
				await ctx.send(`✅ کارت اضافه شد.\n\n${menuText}`, {
					parse_mode: "HTML",
					reply_markup: keyboard,
				});
				return;
			}
		}

		// ── افزودن کانال جوین اجباری (چندمرحله‌ای) ────────────
		if (state.type === "add_forcejoin") {
			if (!text) return;

			if (state.step === "id") {
				const channelId = text.replace(/\s+/g, "");
				const isUsername = /^@[A-Za-z0-9_]{4,}$/.test(channelId);
				const isNumeric = /^-100\d{6,}$/.test(channelId);
				if (!isUsername && !isNumeric) {
					await ctx.send(
						"❌ شناسه نامعتبر است. یک یوزرنیم (مثل <code>@my_channel</code>) یا آیدی عددی (مثل <code>-1001234567890</code>) بفرستید.",
						{ parse_mode: "HTML" },
					);
					return;
				}
				settingsInput.set(userId, {
					type: "add_forcejoin",
					step: "url",
					channelId,
				});
				const hint = isUsername
					? "برای استفاده از لینک عمومی کانال، عبارت <code>-</code> را بفرستید."
					: "برای این کانال حتماً لینک را دستی بفرستید.";
				await ctx.send(
					`🔗 <b>لینک عضویت کانال</b> را بفرستید:\n` +
						`مثال: <code>https://t.me/my_channel</code>\n${hint}`,
					{ parse_mode: "HTML" },
				);
				return;
			}

			if (state.step === "url") {
				const isUsername = state.channelId!.startsWith("@");
				let channelUrl: string;
				if (text === "-") {
					if (!isUsername) {
						await ctx.send(
							"❌ برای کانال با آیدی عددی امکان ساخت خودکار لینک نیست. لینک را دستی بفرستید.",
						);
						return;
					}
					channelUrl = `https://t.me/${state.channelId!.slice(1)}`;
				} else {
					if (!/^https?:\/\/\S+$/.test(text)) {
						await ctx.send(
							"❌ لینک نامعتبر است. یک لینک معتبر (شروع با http/https) بفرستید.",
						);
						return;
					}
					channelUrl = text;
				}
				settingsInput.set(userId, {
					type: "add_forcejoin",
					step: "name",
					channelId: state.channelId,
					channelUrl,
				});
				await ctx.send(
					"🏷 <b>نام نمایشی کانال</b> را بفرستید (روی دکمه به کاربر نشان داده می‌شود):\n" +
						"برای استفاده از شناسه کانال، عبارت <code>-</code> را بفرستید.",
					{ parse_mode: "HTML" },
				);
				return;
			}

			if (state.step === "name") {
				const channelName = text === "-" ? state.channelId! : text;
				settingsInput.delete(userId);
				await ForceJoinRepository.addChannel({
					channelId: state.channelId!,
					channelUrl: state.channelUrl!,
					channelName,
				});
				const { text: menuText, keyboard } = await forceJoinMenu();
				await ctx.send(`✅ کانال اضافه شد.\n\n${menuText}`, {
					parse_mode: "HTML",
					reply_markup: keyboard,
				});
				return;
			}
		}

		// ── بازیابی دیتابیس از فایل بکاپ (سند) ─────────────────
		// این شاخه باید قبل از گارد `if (!text) return` بیاید، چون پیامِ سند
		// (document) متن ندارد و در غیر این صورت بی‌صدا رد می‌شود.
		if (state.type === "bk_restore") {
			// Read the uploaded document robustly across GramIO shapes: the
			// camelCase getter (`ctx.document.fileId`) AND the raw update
			// (`update.message.document.file_id`). A Telegram document sent as a
			// FILE also carries an image thumbnail whose `.photo` is empty, so we
			// only look at `document`. Also accept a photo-mode upload as a hint.
			const rawDoc: any =
				(ctx as any).document ??
				(ctx as any).message?.document ??
				(ctx as any).update?.message?.document ??
				(ctx as any).payload?.document;
			const fileId: string | undefined = rawDoc?.fileId ?? rawDoc?.file_id;
			const fileName: string | undefined =
				rawDoc?.fileName ?? rawDoc?.file_name;
			const fileSize: number | undefined =
				rawDoc?.fileSize ?? rawDoc?.file_size;

			if (!fileId) {
				await ctx.send(
					"❌ فایلی دریافت نشد. فایل بکاپ را به‌صورت «فایل/سند» بفرستید:\n\n" +
						"📎 → <b>File/فایل</b> → فایل <code>.sql</code> را انتخاب کنید (نه به‌صورت عکس/گالری و بدون تیک Compress).",
					{ parse_mode: "HTML" },
				);
				return;
			}
			if (fileSize && fileSize > TELEGRAM_MAX_DOWNLOAD_BYTES) {
				settingsInput.delete(userId);
				await ctx.send(
					"❌ حجم فایل از حد مجاز دانلود بات (۲۰ مگابایت) بیشتر است. بکاپ کوچک‌تری بفرستید.",
					{ parse_mode: "HTML" },
				);
				return;
			}

			settingsInput.delete(userId);
			await ctx.send("⏳ در حال دریافت فایل...", { parse_mode: "HTML" });

			// Download and HOLD the file — restore only runs after a final confirm
			// click, since it wipes the current database.
			try {
				const file = await (bot.api as any).getFile({ file_id: fileId });
				const filePath: string | undefined = file?.file_path;
				if (!filePath) throw new Error("مسیر فایل از تلگرام دریافت نشد.");

				const url = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${filePath}`;
				const resp = await fetch(url);
				if (!resp.ok) {
					throw new Error(`دانلود فایل ناموفق بود (HTTP ${resp.status}).`);
				}
				const dump = Buffer.from(await resp.arrayBuffer());
				if (dump.byteLength === 0) throw new Error("فایل دریافتی خالی است.");

				pendingRestore.set(userId, { dump, fileName });

				await ctx.send(
					`⚠️ <b>تأیید نهایی بازیابی</b>\n\n` +
						`فایل «<code>${fileName ?? "backup.sql"}</code>» (${(dump.byteLength / 1024).toFixed(1)} KB) دریافت شد.\n\n` +
						`با تأیید، <b>تمام داده‌های فعلی ربات پاک</b> و با محتوای این فایل جایگزین می‌شود. این عمل برگشت‌ناپذیر است.`,
					{
						parse_mode: "HTML",
						reply_markup: new InlineKeyboard()
							.text("✅ بله، بازیابی کن", "bk_restore_confirm")
							.row()
							.text("لغو", "bk_restore_cancel"),
					},
				);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				console.error("[settings] restore download error:", msg);
				pendingRestore.delete(userId);
				await ctx.send(`❌ دریافت فایل ناموفق بود.\nخطا: ${msg}`, {
					parse_mode: "HTML",
				});
			}
			return;
		}

		// ── ورودی‌های تک‌مرحله‌ای ──────────────────────────────
		if (!text) return;
		settingsInput.delete(userId);

		if (state.type === "zp_merchant") {
			await PaymentRepository.updateSettings({ zarinpalMerchantId: text });
			const { text: m, keyboard } = await zarinpalMenu();
			await ctx.send(`✅ مرچنت آیدی ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		if (state.type === "zp_callback") {
			await PaymentRepository.updateSettings({ zarinpalCallbackUrl: text });
			const { text: m, keyboard } = await zarinpalMenu();
			await ctx.send(`✅ لینک کال‌بک ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		if (state.type === "cr_address") {
			await PaymentRepository.updateSettings({ cryptoAddress: text });
			const { text: m, keyboard } = await cryptoMenu();
			await ctx.send(`✅ آدرس ولت ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		if (state.type === "cr_apikey") {
			await PaymentRepository.updateSettings({ nowpaymentsApiKey: text });
			const { text: m, keyboard } = await cryptoMenu();
			await ctx.send(`✅ کلید API ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		if (state.type === "bk_channel") {
			await BackupSettingsRepository.update({ telegramChannelId: text });
			const { text: m, keyboard } = await backupMenu();
			await ctx.send(`✅ کانال بکاپ ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		if (state.type === "bk_hour") {
			const hour = Number.parseInt(digits(text), 10);
			if (Number.isNaN(hour) || hour < 0 || hour > 23) {
				settingsInput.set(userId, { type: "bk_hour" });
				await ctx.send("❌ عدد نامعتبر است. عددی بین 0 تا 23 بفرستید.");
				return;
			}
			await BackupSettingsRepository.update({
				cronSchedule: buildDailyCron(hour),
			});
			const { text: m, keyboard } = await backupMenu();
			await ctx.send(
				`✅ ساعت بکاپ روی ${String(hour).padStart(2, "0")}:00 تنظیم شد.\n\n${m}`,
				{
					parse_mode: "HTML",
					reply_markup: keyboard,
				},
			);
			return;
		}

		// ── مبلغ پاداش ریفرال (دلار) ───────────────────────────
		if (state.type === "referral_amount") {
			const normalized = digits(text)
				.replace(/[,،٬\s]/g, "")
				.replace(/٫/g, ".");
			const amount = Number.parseFloat(normalized);
			if (Number.isNaN(amount) || amount < 0 || amount > 10000) {
				settingsInput.set(userId, { type: "referral_amount" });
				await ctx.send(
					"❌ مبلغ نامعتبر است. یک عدد دلاری بین 0 تا 10000 بفرستید (مثلاً 1 یا 0.5).",
				);
				return;
			}
			settingsInput.delete(userId);
			await BotSettingsRepository.update({
				referralRewardAmount: amount.toFixed(2),
			});
			const { text: m, keyboard } = await botMenu();
			await ctx.send(
				`✅ مبلغ پاداش ریفرال روی <b>$${amount.toFixed(2)}</b> تنظیم شد.\n\n${m}`,
				{ parse_mode: "HTML", reply_markup: keyboard },
			);
			return;
		}

		// ── گروه فروم: آیدی گروه (متن) ─────────────────────────
		if (state.type === "forum_group") {
			const reset = text === "-" || text === "پیش‌فرض";
			await ForumSettingsRepository.update({
				supportGroupId: reset ? null : text,
			});
			await invalidateForumConfigCache();
			const { text: m, keyboard } = await forumMenu();
			await ctx.send(`✅ آیدی گروه ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}

		// ── گروه فروم: آیدی تاپیک‌ها (عدد صحیح، - برای پیش‌فرض) ──
		if (
			state.type === "forum_support" ||
			state.type === "forum_orders" ||
			state.type === "forum_reports" ||
			state.type === "forum_newusers" ||
			state.type === "forum_news" ||
			state.type === "forum_referral" ||
			state.type === "forum_payments"
		) {
			const reset = text === "-" || text === "پیش‌فرض";
			let value: number | null = null;
			if (!reset) {
				const n = Number.parseInt(digits(text), 10);
				if (Number.isNaN(n) || n < 1) {
					settingsInput.set(userId, state);
					await ctx.send(
						"❌ آیدی تاپیک نامعتبر است. یک عدد صحیح مثبت بفرستید، یا - برای بازگشت به پیش‌فرض.",
					);
					return;
				}
				value = n;
			}

			switch (state.type) {
				case "forum_support":
					await ForumSettingsRepository.update({ supportTopicId: value });
					break;
				case "forum_orders":
					await ForumSettingsRepository.update({ ordersTopicId: value });
					break;
				case "forum_reports":
					await ForumSettingsRepository.update({ reportsTopicId: value });
					break;
				case "forum_newusers":
					await ForumSettingsRepository.update({ newUsersTopicId: value });
					break;
				case "forum_news":
					await ForumSettingsRepository.update({ newsTopicId: value });
					break;
				case "forum_referral":
					await ForumSettingsRepository.update({ newReferralTopicId: value });
					break;
				case "forum_payments":
					await ForumSettingsRepository.update({ paymentsTopicId: value });
					break;
			}

			await invalidateForumConfigCache();
			const { text: m, keyboard } = await forumMenu();
			await ctx.send(`✅ ذخیره شد.\n\n${m}`, {
				parse_mode: "HTML",
				reply_markup: keyboard,
			});
			return;
		}
	});
}
