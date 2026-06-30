import { InlineKeyboard } from "gramio";
import type { WalletTopup } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";

// ─── منوی اصلی کیف پول ───────────────────────────────────────
export function walletAdminMenuKeyboard(pendingCount: number): InlineKeyboard {
	const badge = pendingCount > 0 ? ` (${pendingCount})` : "";
	return new InlineKeyboard()
		.text(`🧾 درخواست‌های شارژ${badge}`, "wadm_pending_0", {
			style: pendingCount > 0 ? "danger" : "primary",
		})
		.row()
		.text("📊 آمار کیف پول", "wadm_stats", { style: "success" })
		.row()
		.text("📜 تراکنش‌های اخیر", "wadm_tx", { style: "primary" })
		.row()
		.text("بازگشت", "admin_panel", { icon_custom_emoji_id: emojiIds.back });
}

// ─── لیست درخواست‌های در انتظار ──────────────────────────────
export function topupsListKeyboard(
	topups: WalletTopup[],
	page: number,
	totalPages: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const t of topups) {
		const amount = Number.parseFloat(t.amount ?? "0").toLocaleString("en-US");
		keyboard.text(`#${t.id} — ${amount} تومان`, `wtopup_view_${t.id}`).row();
	}

	if (topups.length === 0) {
		keyboard.text("درخواستی در انتظار نیست ✅", "usr_noop").row();
	}

	if (totalPages > 1) {
		if (page > 0) keyboard.text("◀️", `wadm_pending_${page - 1}`);
		keyboard.text(`${page + 1}/${totalPages}`, "usr_noop");
		if (page < totalPages - 1) keyboard.text("▶️", `wadm_pending_${page + 1}`);
		keyboard.row();
	}

	keyboard.text("بازگشت", "panel_wallet", {
		icon_custom_emoji_id: emojiIds.back,
	});

	return keyboard;
}

// ─── مدیریت یک درخواست (روی پیام رسید) ───────────────────────
export function topupManageKeyboard(topup: WalletTopup): InlineKeyboard {
	return new InlineKeyboard()
		.text("✅ تأیید و شارژ", `wtopup_approve_${topup.id}`, { style: "success" })
		.text("❌ رد کردن", `wtopup_reject_${topup.id}`, { style: "danger" })
		.row()
		.text("بازگشت به لیست", "wadm_pending_0", {
			icon_custom_emoji_id: emojiIds.back,
		});
}
