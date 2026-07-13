import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	usersTable,
	type WalletTopup,
	type WalletTransaction,
	walletTopupsTable,
	walletTransactionsTable,
} from "../db/schema.ts";

/**
 * Topups created to pay for a specific order carry `notes: "order_payment:<id>"`.
 * Those are NOT wallet recharges — they must be handled from the Orders panel and
 * must never appear in (or be counted by) the wallet "recharge requests" section.
 * This condition keeps the wallet admin views to genuine recharges only.
 */
const isRechargeTopup = sql`(${walletTopupsTable.notes} IS NULL OR ${walletTopupsTable.notes} NOT LIKE 'order_payment:%')`;

/**
 * WalletTopupRepository — مدیریت درخواست‌های شارژ کارت‌به‌کارت (در انتظار تأیید) و آمار کیف پول.
 */
export class WalletTopupRepository {
	// ─── درخواست‌های در انتظار ────────────────────────────────
	static async getPending(
		limit: number,
		offset: number,
	): Promise<WalletTopup[]> {
		return db
			.select()
			.from(walletTopupsTable)
			.where(and(eq(walletTopupsTable.status, "pending"), isRechargeTopup))
			.orderBy(desc(walletTopupsTable.createdAt))
			.limit(limit)
			.offset(offset);
	}

	static async countByStatus(status: string): Promise<number> {
		const [r] = await db
			.select({ c: count() })
			.from(walletTopupsTable)
			.where(and(eq(walletTopupsTable.status, status), isRechargeTopup));
		return r?.c ?? 0;
	}

	static async findById(id: number): Promise<WalletTopup | undefined> {
		const [row] = await db
			.select()
			.from(walletTopupsTable)
			.where(eq(walletTopupsTable.id, id))
			.limit(1);
		return row;
	}

	/**
	 * The card-to-card receipt topup created for a specific order
	 * (`notes: "order_payment:<orderId>"`). Used by the Orders admin panel to
	 * show the receipt + payment info alongside a pending-payment order.
	 */
	static async findByOrderId(
		orderId: number,
	): Promise<WalletTopup | undefined> {
		const [row] = await db
			.select()
			.from(walletTopupsTable)
			.where(eq(walletTopupsTable.notes, `order_payment:${orderId}`))
			.orderBy(desc(walletTopupsTable.createdAt))
			.limit(1);
		return row;
	}

	/** تغییر وضعیت درخواست (approved | rejected) و ثبت تأییدکننده. */
	static async setStatus(
		id: number,
		status: "approved" | "rejected",
		approvedBy: number | null = null,
	): Promise<WalletTopup> {
		const [row] = await db
			.update(walletTopupsTable)
			.set({ status, approvedBy, approvedAt: new Date() })
			.where(eq(walletTopupsTable.id, id))
			.returning();
		return row;
	}

	// ─── آمار ─────────────────────────────────────────────────
	/** مجموع موجودی کیف پول همه کاربران. */
	static async totalUsersBalance(): Promise<number> {
		const [r] = await db
			.select({
				s: sql<string>`coalesce(sum(${usersTable.walletBalance}::numeric), 0)`,
			})
			.from(usersTable);
		return Number.parseFloat(r?.s ?? "0");
	}

	/** مجموع مبلغ درخواست‌ها بر اساس وضعیت. */
	static async sumAmountByStatus(status: string): Promise<number> {
		const [r] = await db
			.select({
				s: sql<string>`coalesce(sum(${walletTopupsTable.amount}::numeric), 0)`,
			})
			.from(walletTopupsTable)
			.where(and(eq(walletTopupsTable.status, status), isRechargeTopup));
		return Number.parseFloat(r?.s ?? "0");
	}

	/** مجموع اعتبارها/بدهی‌های ثبت‌شده در دفتر تراکنش‌ها. */
	static async sumTransactionsByType(type: string): Promise<number> {
		const [r] = await db
			.select({
				s: sql<string>`coalesce(sum(${walletTransactionsTable.amount}::numeric), 0)`,
			})
			.from(walletTransactionsTable)
			.where(eq(walletTransactionsTable.type, type));
		return Number.parseFloat(r?.s ?? "0");
	}

	/** آخرین تراکنش‌های کیف پول (سراسری). */
	static async getRecentTransactions(limit = 15): Promise<WalletTransaction[]> {
		return db
			.select()
			.from(walletTransactionsTable)
			.orderBy(desc(walletTransactionsTable.createdAt))
			.limit(limit);
	}
}
