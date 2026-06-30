import {
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	notInArray,
	or,
	sql,
} from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	ordersTable,
	productsTable,
	type User,
	usersTable,
} from "../db/schema.ts";

export type UserListFilter =
	| "all"
	| "balance"
	| "referral"
	| "payment"
	| "purchases"
	| "blocked";

const PAID_STATUSES = ["paid", "completed"];
const EXCLUDED_ORDER_STATUSES = ["pending_payment", "cancelled", "refunded"];

/**
 * UserAdminRepository — کوئری‌های مدیریتی روی کاربران (جستجو، آمار، فیلتر، عملیات گروهی).
 */
export class UserAdminRepository {
	// ─── جستجو ────────────────────────────────────────────────
	/** جستجو با آیدی عددی، یوزرنیم یا نام (تطبیق جزئی). */
	static async search(query: string, limit = 30): Promise<User[]> {
		const q = query.trim().replace(/^@/, "");
		if (!q) return [];

		const like = `%${q}%`;
		const conditions = [
			ilike(usersTable.username, like),
			ilike(usersTable.firstName, like),
			ilike(usersTable.lastName, like),
		];
		if (/^\d+$/.test(q)) {
			conditions.push(eq(usersTable.id, Number(q)));
		}

		return db
			.select()
			.from(usersTable)
			.where(or(...conditions))
			.orderBy(desc(usersTable.createdAt))
			.limit(limit);
	}

	// ─── کاربران جدید ─────────────────────────────────────────
	static async countNewSince(date: Date): Promise<number> {
		const [r] = await db
			.select({ c: count() })
			.from(usersTable)
			.where(gte(usersTable.createdAt, date));
		return r?.c ?? 0;
	}

	static async getNewSince(
		date: Date,
		limit: number,
		offset: number,
	): Promise<User[]> {
		return db
			.select()
			.from(usersTable)
			.where(gte(usersTable.createdAt, date))
			.orderBy(desc(usersTable.createdAt))
			.limit(limit)
			.offset(offset);
	}

	// ─── همه کاربران + فیلترها ────────────────────────────────
	static async countUsers(filter: UserListFilter): Promise<number> {
		const where =
			filter === "blocked" ? eq(usersTable.isBlocked, true) : undefined;
		const [r] = await db.select({ c: count() }).from(usersTable).where(where);
		return r?.c ?? 0;
	}

	static async getUsers(
		filter: UserListFilter,
		limit: number,
		offset: number,
	): Promise<User[]> {
		let qb = db.select().from(usersTable).$dynamic();

		if (filter === "blocked") {
			qb = qb.where(eq(usersTable.isBlocked, true));
		}

		switch (filter) {
			case "balance":
				qb = qb.orderBy(
					sql`${usersTable.walletBalance}::numeric desc nulls last`,
				);
				break;
			case "referral":
				qb = qb.orderBy(
					sql`(select count(*) from users u2 where u2.referred_by = ${usersTable.id}) desc`,
				);
				break;
			case "payment":
				qb = qb.orderBy(
					sql`(select coalesce(sum(o.final_price), 0) from orders o where o.user_id = ${usersTable.id} and o.status in ('paid','completed')) desc`,
				);
				break;
			case "purchases":
				qb = qb.orderBy(
					sql`(select count(*) from orders o where o.user_id = ${usersTable.id} and o.status = 'completed') desc`,
				);
				break;
			default:
				qb = qb.orderBy(desc(usersTable.createdAt));
				break;
		}

		return qb.limit(limit).offset(offset);
	}

	// ─── آمار پروفایل ─────────────────────────────────────────
	static async referralCount(userId: number): Promise<number> {
		const [r] = await db
			.select({ c: count() })
			.from(usersTable)
			.where(eq(usersTable.referredBy, userId));
		return r?.c ?? 0;
	}

	static async purchaseCount(userId: number): Promise<number> {
		const [r] = await db
			.select({ c: count() })
			.from(ordersTable)
			.where(
				and(
					eq(ordersTable.userId, BigInt(userId) as never),
					eq(ordersTable.status, "completed"),
				),
			);
		return r?.c ?? 0;
	}

	static async totalPaid(userId: number): Promise<number> {
		const [r] = await db
			.select({
				sum: sql<string>`coalesce(sum(${ordersTable.finalPrice}), 0)`,
			})
			.from(ordersTable)
			.where(
				and(
					eq(ordersTable.userId, BigInt(userId) as never),
					sql`${ordersTable.status} in ('paid','completed')`,
				),
			);
		return Number.parseFloat(r?.sum ?? "0");
	}

	/** محصولاتی که کاربر خریده (سفارش‌های غیر در انتظار/لغو‌شده). */
	static async getPurchasedProducts(userId: number, limit = 20) {
		return db
			.select({
				orderId: ordersTable.id,
				status: ordersTable.status,
				finalPrice: ordersTable.finalPrice,
				createdAt: ordersTable.createdAt,
				nameFA: productsTable.nameFA,
				nameEN: productsTable.nameEN,
				nameRU: productsTable.nameRU,
			})
			.from(ordersTable)
			.leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
			.where(
				and(
					eq(ordersTable.userId, BigInt(userId) as never),
					notInArray(ordersTable.status, EXCLUDED_ORDER_STATUSES),
				),
			)
			.orderBy(desc(ordersTable.createdAt))
			.limit(limit);
	}

	// ─── مسدودسازی ────────────────────────────────────────────
	static async setBlocked(
		userId: number,
		blocked: boolean,
		reason?: string,
	): Promise<User> {
		const [row] = await db
			.update(usersTable)
			.set({
				isBlocked: blocked,
				blockedReason: blocked ? (reason ?? "مسدود توسط ادمین") : null,
				updatedAt: new Date(),
			})
			.where(eq(usersTable.id, userId))
			.returning();
		return row;
	}

	// ─── عملیات گروهی ─────────────────────────────────────────
	/** افزودن مبلغ به موجودی همه کاربران. تعداد ردیف‌های متأثر را برمی‌گرداند. */
	static async addBalanceAll(amount: number): Promise<number> {
		const rows = await db
			.update(usersTable)
			.set({
				walletBalance: sql`round(${usersTable.walletBalance}::numeric + ${amount}, 2)::text`,
				updatedAt: new Date(),
			})
			.returning({ id: usersTable.id });
		return rows.length;
	}

	/** کاهش مبلغ از موجودی همه کاربران (کف صفر). */
	static async subtractBalanceAll(amount: number): Promise<number> {
		const rows = await db
			.update(usersTable)
			.set({
				walletBalance: sql`greatest(0, round(${usersTable.walletBalance}::numeric - ${amount}, 2))::text`,
				updatedAt: new Date(),
			})
			.returning({ id: usersTable.id });
		return rows.length;
	}

	/** صفر کردن موجودی همه کاربران. */
	static async zeroAllBalances(): Promise<number> {
		const rows = await db
			.update(usersTable)
			.set({ walletBalance: "0", updatedAt: new Date() })
			.returning({ id: usersTable.id });
		return rows.length;
	}

	/** مسدود کردن همه‌ی مشتریان (ادمین‌ها مستثنا هستند). */
	static async blockAllCustomers(reason = "مسدود گروهی"): Promise<number> {
		const rows = await db
			.update(usersTable)
			.set({ isBlocked: true, blockedReason: reason, updatedAt: new Date() })
			.where(eq(usersTable.role, "customer"))
			.returning({ id: usersTable.id });
		return rows.length;
	}

	/** رفع مسدودی از همه‌ی کاربران. */
	static async unblockAll(): Promise<number> {
		const rows = await db
			.update(usersTable)
			.set({ isBlocked: false, blockedReason: null, updatedAt: new Date() })
			.where(eq(usersTable.isBlocked, true))
			.returning({ id: usersTable.id });
		return rows.length;
	}

	// ─── برودکست (انتخاب مخاطب) ───────────────────────────────
	private static broadcastConditions(
		lang: BroadcastLang,
		audience: BroadcastAudience,
	) {
		const c = [];
		if (lang !== "all") {
			c.push(sql`lower(${usersTable.languageCode}) like ${`${lang}%`}`);
		}
		switch (audience) {
			case "active":
				c.push(eq(usersTable.isBlocked, false));
				break;
			case "blocked":
				c.push(eq(usersTable.isBlocked, true));
				break;
			case "customers":
				c.push(eq(usersTable.role, "customer"));
				break;
			case "has_balance":
				c.push(sql`${usersTable.walletBalance}::numeric > 0`);
				break;
			case "buyers":
				c.push(
					sql`exists (select 1 from orders o where o.user_id = ${usersTable.id} and o.status in ('paid','completed'))`,
				);
				break;
		}
		return c;
	}

	static async countBroadcastTargets(
		lang: BroadcastLang,
		audience: BroadcastAudience,
	): Promise<number> {
		const conds = UserAdminRepository.broadcastConditions(lang, audience);
		let qb = db.select({ c: count() }).from(usersTable).$dynamic();
		if (conds.length) qb = qb.where(and(...conds));
		const [r] = await qb;
		return r?.c ?? 0;
	}

	static async getBroadcastTargetIds(
		lang: BroadcastLang,
		audience: BroadcastAudience,
	): Promise<number[]> {
		const conds = UserAdminRepository.broadcastConditions(lang, audience);
		let qb = db.select({ id: usersTable.id }).from(usersTable).$dynamic();
		if (conds.length) qb = qb.where(and(...conds));
		const rows = await qb;
		return rows.map((r) => Number(r.id));
	}
}

export type BroadcastLang = "all" | "fa" | "en" | "ru";
export type BroadcastAudience =
	| "all"
	| "active"
	| "blocked"
	| "customers"
	| "has_balance"
	| "buyers";
