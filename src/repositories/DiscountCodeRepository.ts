import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	type DiscountCode,
	type DiscountUsage,
	discountCodesTable,
	discountUsageTable,
	type InsertDiscountCode,
	InsertDiscountUsage,
} from "../db/schema.ts";
import { formatUsd } from "../shared/utils/currency.ts";

export class DiscountCodeRepository {
	// ─── مدیریت ادمین ─────────────────────────────────────────
	/** دریافت همه کدهای تخفیف (صفحه‌بندی، جدیدترین اول). */
	static async getAll(limit: number, offset: number): Promise<DiscountCode[]> {
		return db
			.select()
			.from(discountCodesTable)
			.orderBy(desc(discountCodesTable.createdAt))
			.limit(limit)
			.offset(offset);
	}

	/** تعداد کل کدهای تخفیف. */
	static async countAll(): Promise<number> {
		const [r] = await db.select({ c: count() }).from(discountCodesTable);
		return r?.c ?? 0;
	}

	/** پیدا کردن کد تخفیف با ID. */
	static async findById(id: number): Promise<DiscountCode | undefined> {
		const [row] = await db
			.select()
			.from(discountCodesTable)
			.where(eq(discountCodesTable.id, id))
			.limit(1);
		return row;
	}

	/** ساخت کد تخفیف جدید. */
	static async create(data: InsertDiscountCode): Promise<DiscountCode> {
		const [row] = await db.insert(discountCodesTable).values(data).returning();
		return row;
	}

	/** فعال/غیرفعال کردن کد تخفیف. */
	static async setActive(id: number, isActive: boolean): Promise<DiscountCode> {
		const [row] = await db
			.update(discountCodesTable)
			.set({ isActive })
			.where(eq(discountCodesTable.id, id))
			.returning();
		return row;
	}

	/** حذف کامل کد تخفیف. */
	static async delete(id: number): Promise<void> {
		await db.delete(discountCodesTable).where(eq(discountCodesTable.id, id));
	}

	/**
	 * پیدا کردن کد تخفیف بر اساس کد
	 */
	static async findByCode(code: string): Promise<DiscountCode | undefined> {
		const [result] = await db
			.select()
			.from(discountCodesTable)
			.where(eq(discountCodesTable.code, code))
			.limit(1);

		return result;
	}

	static async validateCode(
		code: string,
		userId: number,
		orderAmount: number,
	): Promise<{
		valid: boolean;
		message: string;
		discountCode?: DiscountCode;
	}> {
		const discountCode = await DiscountCodeRepository.findByCode(code);

		if (!discountCode) {
			return { valid: false, message: "کد تخفیف وجود ندارد" };
		}

		if (!discountCode.isActive) {
			return { valid: false, message: "کد تخفیف غیرفعال است" };
		}

		if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
			return { valid: false, message: "کد تخفیف منقضی شده است" };
		}

		if (
			discountCode.minOrderAmount &&
			Number(orderAmount) < Number(discountCode.minOrderAmount)
		) {
			return {
				valid: false,
				message: `حداقل مبلغ سفارش برای این کد: ${formatUsd(discountCode.minOrderAmount)}`,
			};
		}

		if (
			discountCode.maxUses &&
			discountCode.currentUses &&
			discountCode.currentUses >= discountCode.maxUses
		) {
			return { valid: false, message: "ظرفیت کد تخفیف تمام شده است" };
		}

		const userUsageCount = await DiscountCodeRepository.getUserUsageCount(
			discountCode.id,
			userId,
		);
		if (
			discountCode.maxUsesPerUser &&
			userUsageCount >= discountCode.maxUsesPerUser
		) {
			return {
				valid: false,
				message: "شما قبلاً از این کد تخفیف استفاده کرده‌اید",
			};
		}

		if (discountCode.userIds) {
			const userIds = discountCode.userIds as number[];
			if (!userIds.includes(userId)) {
				return { valid: false, message: "این کد تخفیف برای شما معتبر نیست" };
			}
		}

		return { valid: true, message: "کد تخفیف معتبر است", discountCode };
	}

	static calculateDiscount(
		discountCode: DiscountCode,
		orderAmount: number,
	): number {
		if (discountCode.type === "percentage") {
			let discount = (orderAmount * Number(discountCode.value)) / 100;

			if (
				discountCode.maxDiscount &&
				discount > Number(discountCode.maxDiscount)
			) {
				discount = Number(discountCode.maxDiscount);
			}

			return discount;
		} else {
			return Math.min(Number(discountCode.value), orderAmount);
		}
	}

	static async recordUsage(
		codeId: number,
		userId: number,
		orderId: number,
		discountAmount: number,
	): Promise<void> {
		await db.insert(discountUsageTable).values({
			codeId,
			userId,
			orderId,
			discountAmount: discountAmount.toFixed(2),
		});

		await db
			.update(discountCodesTable)
			.set({
				currentUses: sql`${discountCodesTable.currentUses} + 1`,
			})
			.where(eq(discountCodesTable.id, codeId));
	}

	/**
	 * دریافت تعداد استفاده کاربر از کد
	 */
	static async getUserUsageCount(
		codeId: number,
		userId: number,
	): Promise<number> {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(discountUsageTable)
			.where(
				and(
					eq(discountUsageTable.codeId, codeId),
					eq(discountUsageTable.userId, userId),
				),
			);

		return Number(result[0]?.count || 0);
	}

	/**
	 * دریافت تاریخچه استفاده کاربر
	 */
	static async getUserUsageHistory(userId: number): Promise<DiscountUsage[]> {
		return await db
			.select()
			.from(discountUsageTable)
			.where(eq(discountUsageTable.userId, userId))
			.orderBy(sql`${discountUsageTable.usedAt} DESC`);
	}
}
