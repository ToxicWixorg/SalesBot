import { InlineKeyboard } from "gramio";
import type {
	BroadcastAudience,
	BroadcastLang,
} from "../../../repositories/UserAdminRepository.ts";
import { emojiIds } from "../../locales/emojies.ts";

export const LANG_LABELS: Record<BroadcastLang, string> = {
	all: "همه زبان‌ها",
	fa: "فارسی 🇮🇷",
	en: "انگلیسی 🇺🇸",
	ru: "روسی 🇷🇺",
};

export const AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
	all: "همه کاربران",
	active: "کاربران فعال (غیرمسدود)",
	blocked: "کاربران مسدود",
	customers: "فقط مشتری‌ها",
	has_balance: "دارای موجودی",
	buyers: "خریداران",
};

// ─── منوی اصلی برودکست ───────────────────────────────────────
export function broadcastMenuKeyboard(
	hasMessage: boolean,
	lang: BroadcastLang,
	audience: BroadcastAudience,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(hasMessage ? "📝 تغییر پیام" : "📝 تنظیم پیام", "bc_setmsg", {
			style: hasMessage ? "primary" : "success",
		})
		.row()
		.text(`🌐 زبان: ${LANG_LABELS[lang]}`, "bc_lang")
		.row()
		.text(`🎯 مخاطب: ${AUDIENCE_LABELS[audience]}`, "bc_aud")
		.row()
		.text("👁 تعداد گیرندگان", "bc_count", { style: "primary" })
		.row()
		.text("🚀 ارسال", "bc_send", { style: "danger" })
		.row()
		.text("بازگشت", "admin_panel", { icon_custom_emoji_id: emojiIds.back });
}

// ─── فیلتر زبان ──────────────────────────────────────────────
export function broadcastLangKeyboard(current: BroadcastLang): InlineKeyboard {
	const keyboard = new InlineKeyboard();
	(Object.keys(LANG_LABELS) as BroadcastLang[]).forEach((code, i) => {
		const mark = code === current ? "✅ " : "";
		keyboard.text(`${mark}${LANG_LABELS[code]}`, `bc_setlang_${code}`);
		if (i % 2 === 1) keyboard.row();
	});
	keyboard.row().text("بازگشت", "panel_broadcast", {
		icon_custom_emoji_id: emojiIds.back,
	});
	return keyboard;
}

// ─── فیلتر مخاطب ─────────────────────────────────────────────
export function broadcastAudienceKeyboard(
	current: BroadcastAudience,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();
	for (const code of Object.keys(AUDIENCE_LABELS) as BroadcastAudience[]) {
		const mark = code === current ? "✅ " : "";
		keyboard.text(`${mark}${AUDIENCE_LABELS[code]}`, `bc_setaud_${code}`).row();
	}
	keyboard.text("بازگشت", "panel_broadcast", {
		icon_custom_emoji_id: emojiIds.back,
	});
	return keyboard;
}

// ─── تأیید ارسال ─────────────────────────────────────────────
export function broadcastConfirmKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("✅ بله، ارسال کن", "bc_send_confirm", { style: "danger" })
		.row()
		.text("لغو", "panel_broadcast", { icon_custom_emoji_id: emojiIds.back });
}
