import { InlineKeyboard } from "gramio";
import type { User } from "../../../db/schema.ts";
import type { UserListFilter } from "../../../repositories/UserAdminRepository.ts";
import { emojiIds } from "../../locales/emojies.ts";

// ─── دوره‌های زمانی کاربران جدید ──────────────────────────────
export const NEW_USER_PERIODS = [
	{ code: "today", label: "امروز", days: 0 },
	{ code: "3d", label: "۳ روز", days: 3 },
	{ code: "1w", label: "۱ هفته", days: 7 },
	{ code: "3w", label: "۳ هفته", days: 21 },
	{ code: "1m", label: "۱ ماه", days: 30 },
	{ code: "3m", label: "۳ ماه", days: 90 },
] as const;

export type NewUserPeriod = (typeof NEW_USER_PERIODS)[number]["code"];

export const USER_FILTERS: { code: UserListFilter; label: string }[] = [
	{ code: "all", label: "همه" },
	{ code: "balance", label: "بیشترین موجودی" },
	{ code: "referral", label: "بیشترین رفرال" },
	{ code: "payment", label: "بیشترین پرداختی" },
	{ code: "purchases", label: "بیشترین خرید" },
	{ code: "blocked", label: "مسدودها" },
];

function shortDate(d: Date | null): string {
	if (!d) return "—";
	const date = new Date(d);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function userTitle(u: User): string {
	const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
	const username = u.username ? `@${u.username}` : "";
	return [name || String(u.id), username].filter(Boolean).join(" ");
}

// ─── منوی اصلی کاربران ────────────────────────────────────────
export function usersMenuKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("🔎 مشاهده اطلاعات کاربر", "usr_search", { style: "primary" })
		.row()
		.text("🆕 آمار کاربران جدید", "usr_new_today_0", { style: "success" })
		.row()
		.text("📊 آمار کاربران", "usr_all_all_0", { style: "success" })
		.row()
		.text("⚙️ عملیات گروهی", "usr_bulk", { style: "danger" })
		.row()
		.text("بازگشت", "admin_panel", { icon_custom_emoji_id: emojiIds.back });
}

// ─── نتایج جستجو ──────────────────────────────────────────────
export function searchResultsKeyboard(users: User[]): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const u of users) {
		keyboard.text(userTitle(u), `usr_view_${u.id}`).row();
	}

	keyboard
		.text("🔎 جستجوی جدید", "usr_search", { style: "primary" })
		.text("بازگشت به لیست", "panel_users", {
			icon_custom_emoji_id: emojiIds.back,
		});

	return keyboard;
}

// ─── پروفایل کاربر (قابل استفاده مجدد) ────────────────────────
export function userProfileKeyboard(
	user: User,
	backTo = "panel_users",
): InlineKeyboard {
	return new InlineKeyboard()
		.text("✉️ ارسال پیام", `usr_msg_${user.id}`, { style: "primary" })
		.row()
		.text(
			user.isBlocked ? "✅ رفع مسدودی" : "🚫 مسدود کردن",
			user.isBlocked ? `usr_unblock_${user.id}` : `usr_block_${user.id}`,
			{ style: user.isBlocked ? "success" : "danger" },
		)
		.row()
		.text("🛍 محصولات خریداری‌شده", `usr_orders_${user.id}`, {
			style: "primary",
		})
		.row()
		.text("➕ افزایش موجودی", `usr_baladd_${user.id}`, { style: "success" })
		.text("➖ کاهش موجودی", `usr_balsub_${user.id}`, { style: "danger" })
		.row()
		.text("🧾 تراکنش‌ها", `usr_tx_${user.id}`, { style: "primary" })
		.row()
		.text("بازگشت", backTo, { icon_custom_emoji_id: emojiIds.back });
}

// ─── لیست کاربران جدید (۳ ستونه + پیجینیشن) ──────────────────
export function newUsersKeyboard(
	period: string,
	users: User[],
	page: number,
	totalPages: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// ردیف انتخاب دوره
	for (let i = 0; i < NEW_USER_PERIODS.length; i++) {
		const p = NEW_USER_PERIODS[i];
		const active = p.code === period ? "🔘 " : "";
		keyboard.text(`${active}${p.label}`, `usr_new_${p.code}_0`);
		if (i % 3 === 2) keyboard.row();
	}
	keyboard.row();

	// ردیف هدر
	if (users.length > 0) {
		keyboard
			.text("🆔 آیدی", "usr_noop")
			.text("👤 یوزرنیم", "usr_noop")
			.text("📅 عضویت", "usr_noop")
			.row();
	}

	for (const u of users) {
		keyboard
			.text(String(u.id), `usr_view_${u.id}`)
			.text(u.username ? `@${u.username}` : "—", `usr_view_${u.id}`)
			.text(shortDate(u.createdAt), `usr_view_${u.id}`)
			.row();
	}

	appendPagination(keyboard, `usr_new_${period}`, page, totalPages);

	keyboard.text("بازگشت", "panel_users", {
		icon_custom_emoji_id: emojiIds.back,
	});

	return keyboard;
}

// ─── لیست همه کاربران (فیلتر + ۳ ستونه + پیجینیشن) ───────────
export function allUsersKeyboard(
	filter: string,
	users: User[],
	page: number,
	totalPages: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (let i = 0; i < USER_FILTERS.length; i++) {
		const f = USER_FILTERS[i];
		const active = f.code === filter ? "🔘 " : "";
		keyboard.text(`${active}${f.label}`, `usr_all_${f.code}_0`);
		if (i % 2 === 1) keyboard.row();
	}
	keyboard.row();

	if (users.length > 0) {
		keyboard
			.text("🆔 آیدی", "usr_noop")
			.text("👤 یوزرنیم", "usr_noop")
			.text("💰 موجودی", "usr_noop")
			.row();
	}

	for (const u of users) {
		keyboard
			.text(String(u.id), `usr_view_${u.id}`)
			.text(u.username ? `@${u.username}` : "—", `usr_view_${u.id}`)
			.text(`${u.walletBalance ?? "0"}`, `usr_view_${u.id}`)
			.row();
	}

	appendPagination(keyboard, `usr_all_${filter}`, page, totalPages);

	keyboard.text("بازگشت", "panel_users", {
		icon_custom_emoji_id: emojiIds.back,
	});

	return keyboard;
}

// ─── عملیات گروهی ─────────────────────────────────────────────
export function bulkMenuKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("➕ افزودن موجودی به همه", "usr_bulk_add", { style: "success" })
		.row()
		.text("➖ کاهش موجودی از همه", "usr_bulk_sub", { style: "danger" })
		.row()
		.text("0️⃣ صفر کردن موجودی همه", "usr_bulk_zero", { style: "danger" })
		.row()
		.text("✅ رفع مسدودی همه", "usr_bulk_unblockall", { style: "success" })
		.row()
		.text("🚫 مسدود کردن همه", "usr_bulk_blockall", { style: "danger" })
		.row()
		.text("بازگشت", "panel_users", { icon_custom_emoji_id: emojiIds.back });
}

export function bulkConfirmKeyboard(action: string): InlineKeyboard {
	return new InlineKeyboard()
		.text("✅ تایید و اجرا", `usr_bulk_confirm_${action}`, { style: "danger" })
		.row()
		.text("لغو", "usr_bulk");
}

// ─── کمکی پیجینیشن ────────────────────────────────────────────
function appendPagination(
	keyboard: InlineKeyboard,
	prefix: string,
	page: number,
	totalPages: number,
) {
	if (totalPages <= 1) return;
	const hasPrev = page > 0;
	const hasNext = page < totalPages - 1;

	if (hasPrev) keyboard.text("◀️", `${prefix}_${page - 1}`);
	keyboard.text(`${page + 1}/${totalPages}`, "usr_noop");
	if (hasNext) keyboard.text("▶️", `${prefix}_${page + 1}`);
	keyboard.row();
}
