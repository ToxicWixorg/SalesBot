import { InlineKeyboard } from "gramio";
import type {
	Admin,
	BackupSettings,
	BotSettings,
	ForumSettings,
	PaymentCardNumber,
	PaymentSettings,
} from "../../../db/schema.ts";
import type { AdminRole } from "../../../services/bot/admin/Admin/Roles.ts";
import { getRoleName } from "../../../services/bot/admin/getRoleName.ts";
import { emojiIds } from "../../locales/emojies.ts";

const onOff = (v: boolean | null | undefined) => (v ? "🟢 روشن" : "🔴 خاموش");

// ─── منوی اصلی تنظیمات ───────────────────────────────────────
export function settingsMainKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("👮 مدیریت ادمین‌ها", "set_admins", { style: "primary" })
		.row()
		.text("🤖 مدیریت ربات", "set_bot", { style: "primary" })
		.row()
		.text("💳 مدیریت پرداخت و ولت", "set_wallet", { style: "success" })
		.row()
		.text("💾 مدیریت بکاپ", "set_backup", { style: "success" })
		.row()
		.text("🗂 مدیریت گروه فروم", "set_forum", { style: "primary" })
		.row()
		.text("بازگشت", "admin_panel", { icon_custom_emoji_id: emojiIds.back });
}

// ─── گروه فروم (گروه پشتیبانی و تاپیک‌ها) ─────────────────────
export function forumSettingsKeyboard(
	settings: ForumSettings,
): InlineKeyboard {
	const topic = (v: number | null | undefined) =>
		v == null ? "پیش‌فرض" : String(v);

	return new InlineKeyboard()
		.text(
			`${settings.notificationsEnabled ? "🔔 ارسال پیام به گروه: روشن" : "🔕 ارسال پیام به گروه: خاموش"}`,
			"set_forum_notify_toggle",
			{ style: settings.notificationsEnabled ? "success" : "danger" },
		)
		.row()
		.text(
			`🆔 آیدی گروه: ${settings.supportGroupId ?? "پیش‌فرض"}`,
			"set_forum_group",
			{ style: "primary" },
		)
		.row()
		.text(`💬 پشتیبانی: ${topic(settings.supportTopicId)}`, "set_forum_support")
		.text(`📦 سفارش‌ها: ${topic(settings.ordersTopicId)}`, "set_forum_orders")
		.row()
		.text(`⚠️ گزارش‌ها: ${topic(settings.reportsTopicId)}`, "set_forum_reports")
		.text(
			`👤 کاربران جدید: ${topic(settings.newUsersTopicId)}`,
			"set_forum_newusers",
		)
		.row()
		.text(`📣 اخبار: ${topic(settings.newsTopicId)}`, "set_forum_news")
		.text(
			`🎁 ریفرال: ${topic(settings.newReferralTopicId)}`,
			"set_forum_referral",
		)
		.row()
		.text(
			`💳 پرداخت‌ها: ${topic(settings.paymentsTopicId)}`,
			"set_forum_payments",
		)
		.row()
		.text("بازگشت", "panel_setting", { icon_custom_emoji_id: emojiIds.back });
}

// ─── ادمین‌ها ────────────────────────────────────────────────
export function adminsListKeyboard(admins: Admin[]): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const admin of admins) {
		const status = admin.isActive ? "" : "🚫 ";
		const label = `${status}${admin.displayName ?? admin.userId} — ${getRoleName(
			admin.role as AdminRole,
		)}`;
		keyboard.text(label, `set_admin_view_${admin.id}`).row();
	}

	keyboard
		.text("➕ افزودن ادمین", "set_admin_add", { style: "success" })
		.row()
		.text("بازگشت", "panel_setting", { icon_custom_emoji_id: emojiIds.back });

	return keyboard;
}

export function adminManageKeyboard(
	admin: Admin,
	isOwnerAdmin = false,
): InlineKeyboard {
	// The bot owner cannot be modified — show only the back button.
	if (isOwnerAdmin) {
		return new InlineKeyboard().text("بازگشت", "set_admins", {
			icon_custom_emoji_id: emojiIds.back,
		});
	}

	return new InlineKeyboard()
		.text(
			admin.isActive ? "🔴 غیرفعال کردن" : "🟢 فعال کردن",
			`set_admin_toggle_${admin.id}`,
			{ style: admin.isActive ? "danger" : "success" },
		)
		.row()
		.text("🔁 تغییر نقش", `set_admin_role_${admin.id}`, { style: "primary" })
		.row()
		.text("🗑 حذف ادمین", `set_admin_del_${admin.id}`, { style: "danger" })
		.row()
		.text("بازگشت", "set_admins", { icon_custom_emoji_id: emojiIds.back });
}

// ─── ربات ────────────────────────────────────────────────────
export function botSettingsKeyboard(settings: BotSettings): InlineKeyboard {
	// ربات «روشن» یعنی حالت تعمیرات خاموش است
	const botOnline = !settings.maintenanceMode;
	return new InlineKeyboard()
		.text(
			botOnline ? "🔴 خاموش کردن ربات" : "🟢 روشن کردن ربات",
			"set_bot_toggle",
			{ style: botOnline ? "danger" : "success" },
		)
		.row()
		.text(`🛒 فروشگاه: ${onOff(settings.shopEnabled)}`, "set_bot_shop")
		.row()
		.text(`🎁 ریفرال: ${onOff(settings.referralEnabled)}`, "set_bot_referral")
		.row()
		.text("بازگشت", "panel_setting", { icon_custom_emoji_id: emojiIds.back });
}

// ─── پرداخت / ولت ────────────────────────────────────────────
export function walletSettingsKeyboard(
	settings: PaymentSettings,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(`💳 پرداخت کارتی: ${onOff(settings.cardEnabled)}`, "set_pay_card")
		.row()
		.text("🔢 مدیریت شماره کارت‌ها", "set_cards", { style: "primary" })
		.row()
		.text(`🏦 زرین‌پال: ${onOff(settings.zarinpalEnabled)}`, "set_zarinpal", {
			style: "primary",
		})
		.row()
		.text(`🪙 کریپتو: ${onOff(settings.nowpaymentsEnabled)}`, "set_crypto", {
			style: "primary",
		})
		.row()
		.text("بازگشت", "panel_setting", { icon_custom_emoji_id: emojiIds.back });
}

export function cardsListKeyboard(cards: PaymentCardNumber[]): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const card of cards) {
		const status = card.isActive ? "" : "🚫 ";
		keyboard
			.text(`${status}${card.cardNumber}`, `set_card_view_${card.id}`)
			.row();
	}

	keyboard
		.text("➕ افزودن کارت", "set_card_add", { style: "success" })
		.row()
		.text("بازگشت", "set_wallet", { icon_custom_emoji_id: emojiIds.back });

	return keyboard;
}

export function cardManageKeyboard(card: PaymentCardNumber): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			card.isActive ? "🔴 غیرفعال کردن" : "🟢 فعال کردن",
			`set_card_toggle_${card.id}`,
			{ style: card.isActive ? "danger" : "success" },
		)
		.row()
		.text("🗑 حذف کارت", `set_card_del_${card.id}`, { style: "danger" })
		.row()
		.text("بازگشت", "set_cards", { icon_custom_emoji_id: emojiIds.back });
}

export function zarinpalSettingsKeyboard(
	settings: PaymentSettings,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(`وضعیت: ${onOff(settings.zarinpalEnabled)}`, "set_zp_toggle", {
			style: settings.zarinpalEnabled ? "danger" : "success",
		})
		.row()
		.text(
			`🧪 تست (Sandbox): ${onOff(settings.zarinpalSandbox)}`,
			"set_zp_sandbox",
		)
		.row()
		.text("✏️ مرچنت آیدی", "set_zp_merchant", { style: "primary" })
		.text("✏️ لینک کال‌بک", "set_zp_callback", { style: "primary" })
		.row()
		.text("بازگشت", "set_wallet", { icon_custom_emoji_id: emojiIds.back });
}

export function cryptoSettingsKeyboard(
	settings: PaymentSettings,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(`وضعیت: ${onOff(settings.nowpaymentsEnabled)}`, "set_cr_toggle", {
			style: settings.nowpaymentsEnabled ? "danger" : "success",
		})
		.row()
		.text(`🌐 شبکه: ${settings.cryptoNetwork ?? "TRC20"}`, "set_cr_network")
		.row()
		.text("✏️ آدرس ولت", "set_cr_address", { style: "primary" })
		.text("✏️ کلید API", "set_cr_apikey", { style: "primary" })
		.row()
		.text("بازگشت", "set_wallet", { icon_custom_emoji_id: emojiIds.back });
}

// ─── بکاپ ────────────────────────────────────────────────────
export function backupSettingsKeyboard(
	settings: BackupSettings,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(`بکاپ خودکار: ${onOff(settings.isEnabled)}`, "set_bk_toggle", {
			style: settings.isEnabled ? "danger" : "success",
		})
		.row()
		.text("✏️ کانال بکاپ", "set_bk_channel", { style: "primary" })
		.text("🕒 ساعت بکاپ", "set_bk_hour", { style: "primary" })
		.row()
		.text("📤 بکاپ‌گیری همین حالا", "set_bk_now", { style: "success" })
		.row()
		.text("بازگشت", "panel_setting", { icon_custom_emoji_id: emojiIds.back });
}
