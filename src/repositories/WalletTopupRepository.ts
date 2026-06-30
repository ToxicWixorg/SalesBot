import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	usersTable,
	type WalletTopup,
	type WalletTransaction,
	walletTopupsTable,
	walletTransactionsTable,
} from "../db/schema.ts";

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
			.where(eq(walletTopupsTable.status, "pending"))
			.orderBy(desc(walletTopupsTable.createdAt))
			.limit(limit)
			.offset(offset);
	}

	static async countByStatus(status: string): Promise<number> {
		const [r] = await db
			.select({ c: count() })
			.from(walletTopupsTable)
			.where(eq(walletTopupsTable.status, status));
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
			.where(eq(walletTopupsTable.status, status));
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
