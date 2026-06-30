import type { AnyBot } from "gramio";
import { InlineKeyboard } from "gramio";
import { isOwner } from "../../../config.ts";
import {
	AdminRepository,
	BackupSettingsRepository,
	BotSettingsRepository,
	PaymentRepository,
	UserRepository,
} from "../../../repositories/index.ts";
import {
	buildDailyCron,
	parseBackupHour,
	runBackup,
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
	| { type: "zp_merchant" }
	| { type: "zp_callback" }
	| { type: "cr_address" }
	| { type: "cr_apikey" }
	| { type: "bk_channel" }
	| { type: "bk_hour" };

const settingsInput = new Map<number, SettingsInput>();

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
		const text =
			`👤 <b>${admin.displayName ?? admin.userId}</b>\n\n` +
			`آیدی: <code>${admin.userId}</code>\n` +
			`نقش: <b>${getRoleName(admin.role as AdminRole)}</b>\n` +
			`وضعیت: <b>${admin.isActive ? "فعال 🟢" : "غیرفعال 🔴"}</b>`;
		await ctx.editText(text, {
			parse_mode: "HTML",
			reply_markup: adminManageKeyboard(admin),
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
		await ctx.answerCallbackQuery({ text: "⏳ در حال تهیه بکاپ..." });
		const result = await runBackup(bot);
		if (result.ok) {
			await ctx.answerCallbackQuery({
				text: "✅ بکاپ با موفقیت به کانال ارسال شد.",
				show_alert: true,
			});
		} else {
			await ctx.answerCallbackQuery({
				text: `❌ خطا: ${result.error ?? "نامشخص"}`,
				show_alert: true,
			});
		}
		const { text, keyboard } = await backupMenu();
		await ctx.editText(text, { parse_mode: "HTML", reply_markup: keyboard });
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
	});
}
