import { db } from "../db/index.ts";
import {
	usersTable,
	referralRewardsTable,
	walletTransactionsTable,
	ReferralReward,
	InsertReferralReward,
	User,
} from "../db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { BotSettingsRepository } from "./SettingsRepository.ts";

export class ReferralRepository {
	/**
	 * دریافت آمار ریفرال کاربر
	 */
	static async getReferralStats(userId: number): Promise<{
		totalReferrals: number;
		totalRewards: string;
		pendingRewards: number;
	}> {
		// تعداد کل دعوت‌ها
		const referralsResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(usersTable)
			.where(eq(usersTable.referredBy, userId));

		const totalReferrals = Number(referralsResult[0]?.count || 0);

		// مجموع پاداش‌های دریافتی
		const rewardsResult = await db
			.select({
				total: sql<string>`COALESCE(SUM(${referralRewardsTable.rewardValue}), 0)`,
			})
			.from(referralRewardsTable)
			.where(
				sql`${referralRewardsTable.referrerId} = ${userId} AND ${referralRewardsTable.status} = 'awarded'`,
			);

		const totalRewards = rewardsResult[0]?.total || "0";

		// تعداد پاداش‌های در انتظار
		const pendingResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(referralRewardsTable)
			.where(
				sql`${referralRewardsTable.referrerId} = ${userId} AND ${referralRewardsTable.status} = 'pending'`,
			);

		const pendingRewards = Number(pendingResult[0]?.count || 0);

		return {
			totalReferrals,
			totalRewards,
			pendingRewards,
		};
	}

	/**
	 * دریافت لیست کاربران دعوت شده
	 */
	static async getReferredUsers(userId: number): Promise<User[]> {
		return await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.referredBy, userId))
			.orderBy(sql`${usersTable.createdAt} DESC`);
	}

	/**
	 * ایجاد پاداش ریفرال
	 */
	static async createReward(
		referrerId: number,
		referredUserId: number,
		rewardType: "wallet_credit" | "discount",
		rewardValue: number,
	): Promise<ReferralReward> {
		const [reward] = await db
			.insert(referralRewardsTable)
			.values({
				referrerId,
				referredUserId,
				rewardType,
				rewardValue: rewardValue.toFixed(2),
				status: "pending",
			})
			.returning();

		return reward;
	}

	/**
	 * اعطای پاداش ریفرال (تبدیل به wallet credit)
	 */
	static async awardReward(rewardId: number): Promise<void> {
		const [reward] = await db
			.select()
			.from(referralRewardsTable)
			.where(eq(referralRewardsTable.id, rewardId))
			.limit(1);

		if (!reward || reward.status !== "pending") {
			throw new Error("Reward not found or already awarded");
		}

		// دریافت موجودی فعلی
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, reward.referrerId))
			.limit(1);

		if (!user) {
			throw new Error("User not found");
		}

		const currentBalance = Number(user.walletBalance || 0);
		const rewardValue = Number(reward.rewardValue);
		const newBalance = currentBalance + rewardValue;

		// شروع transaction
		await db.transaction(async (tx) => {
			// به‌روزرسانی موجودی کیف پول
			await tx
				.update(usersTable)
				.set({
					walletBalance: newBalance.toFixed(2),
					updatedAt: new Date(),
				})
				.where(eq(usersTable.id, reward.referrerId));

			// ثبت تراکنش کیف پول
			await tx.insert(walletTransactionsTable).values({
				userId: reward.referrerId,
				amount: rewardValue.toFixed(2),
				type: "credit",
				source: "referral",
				description: "پاداش دعوت دوستان",
				balanceBefore: currentBalance.toFixed(2),
				balanceAfter: newBalance.toFixed(2),
			});

			// به‌روزرسانی وضعیت پاداش
			await tx
				.update(referralRewardsTable)
				.set({
					status: "awarded",
					awardedAt: new Date(),
				})
				.where(eq(referralRewardsTable.id, rewardId));
		});
	}

	/**
	 * لغو پاداش ریفرال
	 */
	static async cancelReward(rewardId: number): Promise<void> {
		await db
			.update(referralRewardsTable)
			.set({
				status: "cancelled",
			})
			.where(eq(referralRewardsTable.id, rewardId));
	}

	/**
	 * دریافت تاریخچه پاداش‌های ریفرال کاربر
	 */
	static async getRewardHistory(userId: number): Promise<ReferralReward[]> {
		return await db
			.select()
			.from(referralRewardsTable)
			.where(eq(referralRewardsTable.referrerId, userId))
			.orderBy(sql`${referralRewardsTable.createdAt} DESC`);
	}

	/**
	 * اعطای خودکار پاداش به کاربر معرف (وقتی کاربر جدید عضو میشه)
	 */
	static async autoRewardReferrer(
		referrerId: number,
		referredUserId: number,
	): Promise<void> {
		// مبلغ پاداش (دلار) از تنظیمات ربات — پیش‌فرض 1 دلار
		const settings = await BotSettingsRepository.getOrCreate();
		const rewardAmount = Number.parseFloat(
			String(settings.referralRewardAmount ?? "1"),
		);

		// اگر مبلغ صفر یا نامعتبر باشد، پاداشی ثبت نمی‌شود
		if (!(rewardAmount > 0)) return;

		// ایجاد پاداش
		const reward = await this.createReward(
			referrerId,
			referredUserId,
			"wallet_credit",
			rewardAmount,
		);

		// اعطای فوری پاداش
		await this.awardReward(reward.id);
	}
}
