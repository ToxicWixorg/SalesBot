import { db } from "../db/index.ts";
import {
  discountCodesTable,
  DiscountCode,
  InsertDiscountCode,
  discountUsageTable,
  DiscountUsage,
  InsertDiscountUsage,
  referralRewardsTable,
  ReferralReward,
  InsertReferralReward,
  perksTasksTable,
  PerksTask,
  InsertPerksTask,
  userPerksTable,
  UserPerks,
  InsertUserPerks,
  invitesTable,
  Invite,
  InsertInvite,
  stockNotificationsTable,
  StockNotification,
  InsertStockNotification,
} from "../db/schema.ts";
import { eq, desc, and, sql } from "drizzle-orm";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎁 DISCOUNT CODES REPOSITORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class DiscountRepository {
  /**
   * کد تخفیف را حسب کد پیدا کن
   */
  static async findByCode(code: string): Promise<DiscountCode | undefined> {
    const [result] = await db
      .select()
      .from(discountCodesTable)
      .where(
        and(
          eq(discountCodesTable.code, code.toUpperCase()),
          eq(discountCodesTable.isActive, true),
        ),
      )
      .limit(1);

    return result;
  }

  /**
   * کد تخفیف جدید ایجاد کن
   */
  static async create(discount: InsertDiscountCode): Promise<DiscountCode> {
    const [result] = await db
      .insert(discountCodesTable)
      .values(discount)
      .returning();

    return result;
  }

  /**
   * استفاده کد تخفیف را ثبت کن
   */
  static async recordUsage(usage: InsertDiscountUsage): Promise<DiscountUsage> {
    const [result] = await db
      .insert(discountUsageTable)
      .values(usage)
      .returning();

    return result;
  }

  /**
   * تعداد استفاده کاربر از کد
   */
  static async getUserCodeUsageCount(
    codeId: number,
    userId: number,
  ): Promise<number> {
    const results = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(discountUsageTable)
      .where(
        and(
          eq(discountUsageTable.codeId, codeId),
          eq(discountUsageTable.userId, BigInt(userId) as any),
        ),
      );

    return results[0]?.count || 0;
  }

  /**
   * بررسی آیا کد معتبر است
   */
  static async isValidCode(code: string): Promise<boolean> {
    const discount = await this.findByCode(code);
    if (!discount) return false;

    // چک انقضا
    if (discount.expiresAt && discount.expiresAt < new Date()) return false;

    // چک تعداد استفاده
    if (discount.maxUses && discount.currentUses! >= discount.maxUses)
      return false;

    return true;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 REFERRAL REPOSITORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ReferralRepository {
  /**
   * پاداش ریفرال جدید ایجاد کن
   */
  static async createReward(
    reward: InsertReferralReward,
  ): Promise<ReferralReward> {
    const [result] = await db
      .insert(referralRewardsTable)
      .values(reward)
      .returning();

    return result;
  }

  /**
   * پاداش‌های ریفرال یک کاربر
   */
  static async findByReferrerId(referrerId: number): Promise<ReferralReward[]> {
    return db
      .select()
      .from(referralRewardsTable)
      .where(eq(referralRewardsTable.referrerId, BigInt(referrerId) as any))
      .orderBy(desc(referralRewardsTable.createdAt));
  }

  /**
   * پاداش ریفرال را اعطا کن
   */
  static async awardReward(id: number): Promise<ReferralReward> {
    const [result] = await db
      .update(referralRewardsTable)
      .set({
        status: "awarded",
        awardedAt: new Date(),
      })
      .where(eq(referralRewardsTable.id, id))
      .returning();

    return result;
  }

  /**
   * معلق پاداش‌های ریفرال
   */
  static async getPendingRewards(): Promise<ReferralReward[]> {
    return db
      .select()
      .from(referralRewardsTable)
      .where(eq(referralRewardsTable.status, "pending"))
      .orderBy(desc(referralRewardsTable.createdAt));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 PERKS REPOSITORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PerksRepository {
  /**
   * تمام تسک‌های فعال
   */
  static async findActiveTasks(): Promise<PerksTask[]> {
    return db
      .select()
      .from(perksTasksTable)
      .where(eq(perksTasksTable.isActive, true));
  }

  /**
   * تسک را با ID پیدا کن
   */
  static async findTaskById(id: number): Promise<PerksTask | undefined> {
    const [result] = await db
      .select()
      .from(perksTasksTable)
      .where(eq(perksTasksTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * تسک جدید ایجاد کن
   */
  static async createTask(task: InsertPerksTask): Promise<PerksTask> {
    const [result] = await db.insert(perksTasksTable).values(task).returning();

    return result;
  }

  /**
   * کاربر تسک را شروع کن
   */
  static async startUserTask(userPerk: InsertUserPerks): Promise<UserPerks> {
    const [result] = await db
      .insert(userPerksTable)
      .values(userPerk)
      .returning();

    return result;
  }

  /**
   * تسک کاربر را تکمیل کن
   */
  static async completeTask(
    id: number,
    verificationData?: any,
  ): Promise<UserPerks> {
    const [result] = await db
      .update(userPerksTable)
      .set({
        status: "completed",
        verificationData,
        completedAt: new Date(),
      })
      .where(eq(userPerksTable.id, id))
      .returning();

    return result;
  }

  /**
   * پاداش تسک را دریافت کن
   */
  static async claimReward(id: number): Promise<UserPerks> {
    const [result] = await db
      .update(userPerksTable)
      .set({
        status: "claimed",
        claimedAt: new Date(),
      })
      .where(eq(userPerksTable.id, id))
      .returning();

    return result;
  }

  /**
   * تسک‌های تکمیل‌شده کاربر
   */
  static async findCompletedByUserId(userId: number): Promise<UserPerks[]> {
    return db
      .select()
      .from(userPerksTable)
      .where(
        and(
          eq(userPerksTable.userId, BigInt(userId) as any),
          eq(userPerksTable.status, "completed"),
        ),
      );
  }

  /**
   * تسک های Pending کاربر
   */
  static async findPendingByUserId(userId: number): Promise<UserPerks[]> {
    return db
      .select()
      .from(userPerksTable)
      .where(
        and(
          eq(userPerksTable.userId, BigInt(userId) as any),
          eq(userPerksTable.status, "pending"),
        ),
      );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 INVITE REPOSITORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class InviteRepository {
  /**
   * دعوت جدید ایجاد کن
   */
  static async create(invite: InsertInvite): Promise<Invite> {
    const [result] = await db.insert(invitesTable).values(invite).returning();

    return result;
  }

  /**
   * دعوت‌های سفارش
   */
  static async findByOrderId(orderId: number): Promise<Invite[]> {
    return db
      .select()
      .from(invitesTable)
      .where(eq(invitesTable.orderId, orderId))
      .orderBy(invitesTable.createdAt);
  }

  /**
   * وضعیت دعوت را به روزرسانی کن
   */
  static async updateStatus(id: number, status: string): Promise<Invite> {
    const [result] = await db
      .update(invitesTable)
      .set({
        status,
        ...(status === "sent" && { sentAt: new Date() }),
        ...(status === "accepted" && { acceptedAt: new Date() }),
      })
      .where(eq(invitesTable.id, id))
      .returning();

    return result;
  }

  /**
   * دعوتهای Pending
   */
  static async getPendingInvites(): Promise<Invite[]> {
    return db
      .select()
      .from(invitesTable)
      .where(eq(invitesTable.status, "pending"))
      .orderBy(invitesTable.createdAt);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔔 STOCK NOTIFICATION REPOSITORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class StockNotificationRepository {
  /**
   * اطلاع‌دهی جدید ایجاد کن
   */
  static async create(
    notification: InsertStockNotification,
  ): Promise<StockNotification> {
    const [result] = await db
      .insert(stockNotificationsTable)
      .values(notification)
      .returning();

    return result;
  }

  /**
   * اطلاع‌دهی‌های فعال برای محصول
   */
  static async findActiveByProductId(
    productId: number,
  ): Promise<StockNotification[]> {
    return db
      .select()
      .from(stockNotificationsTable)
      .where(
        and(
          eq(stockNotificationsTable.productId, productId),
          eq(stockNotificationsTable.isActive, true),
          eq(stockNotificationsTable.notificationSent, false),
        ),
      );
  }

  /**
   * اطلاع‌دهی را ارسال شده علامت‌گذاری کن
   */
  static async markAsSent(id: number): Promise<StockNotification> {
    const [result] = await db
      .update(stockNotificationsTable)
      .set({
        notificationSent: true,
        notificationSentAt: new Date(),
        isActive: false,
      })
      .where(eq(stockNotificationsTable.id, id))
      .returning();

    return result;
  }

  /**
   * درخواست‌های یک کاربر برای یک محصول
   */
  static async findByUserAndProduct(
    userId: number,
    productId: number,
  ): Promise<StockNotification | undefined> {
    const [result] = await db
      .select()
      .from(stockNotificationsTable)
      .where(
        and(
          eq(stockNotificationsTable.userId, BigInt(userId) as any),
          eq(stockNotificationsTable.productId, productId),
        ),
      );

    return result;
  }

  /**
   * درخواست‌های یک کاربر
   */
  static async findByUserId(userId: number): Promise<StockNotification[]> {
    return db
      .select()
      .from(stockNotificationsTable)
      .where(eq(stockNotificationsTable.userId, BigInt(userId) as any));
  }

  /**
   * لغو درخواست
   */
  static async cancel(id: number): Promise<void> {
    await db
      .update(stockNotificationsTable)
      .set({ isActive: false })
      .where(eq(stockNotificationsTable.id, id));
  }

  /**
   * فعال‌سازی مجدد درخواست قبلی
   */
  static async reactivate(id: number): Promise<void> {
    await db
      .update(stockNotificationsTable)
      .set({ isActive: true, notificationSent: false, notificationSentAt: null })
      .where(eq(stockNotificationsTable.id, id));
  }
}
