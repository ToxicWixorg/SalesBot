import { db } from "../db/index.ts";
import {
  adminsTable,
  InsertAdmin,
  Admin,
  usersTable,
  adminLogsTable,
  InsertAdminLog,
  adminSessionsTable,
  InsertAdminSession,
  AdminSession,
} from "../db/schema.ts";
import { eq, and, desc, sql } from "drizzle-orm";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 Admin Repository
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AdminRepository {
  /**
   * پیدا کردن ادمین با user ID
   */
  static async findByUserId(userId: number): Promise<Admin | undefined> {
    const [result] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.userId, userId))
      .limit(1);
    return result;
  }

  /**
   * پیدا کردن ادمین با admin ID
   */
  static async findById(adminId: number): Promise<Admin | undefined> {
    const [result] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, adminId))
      .limit(1);
    return result;
  }

  /**
   * دریافت همه ادمین‌های فعال
   */
  static async getAllActive(): Promise<Admin[]> {
    return await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.isActive, true))
      .orderBy(desc(adminsTable.createdAt));
  }

  /**
   * دریافت همه ادمین‌ها (شامل غیرفعال)
   */
  static async getAll(): Promise<Admin[]> {
    return await db
      .select()
      .from(adminsTable)
      .orderBy(desc(adminsTable.createdAt));
  }

  /**
   * دریافت ادمین‌ها بر اساس نقش
   */
  static async getByRole(role: string): Promise<Admin[]> {
    return await db
      .select()
      .from(adminsTable)
      .where(and(eq(adminsTable.role, role), eq(adminsTable.isActive, true)))
      .orderBy(desc(adminsTable.createdAt));
  }

  /**
   * ایجاد ادمین جدید
   */
  static async create(admin: InsertAdmin, createdBy?: number): Promise<Admin> {
    // بررسی اینکه آیا این user قبلا ادمین شده
    const existing = await this.findByUserId(admin.userId as number);
    if (existing) {
      throw new Error("این کاربر قبلاً به عنوان ادمین ثبت شده است");
    }

    // به روزرسانی role در جدول users
    await db
      .update(usersTable)
      .set({ role: admin.role || "support" })
      .where(eq(usersTable.id, admin.userId as number));

    // ساخت رکورد ادمین
    const [result] = await db
      .insert(adminsTable)
      .values({
        ...admin,
        createdBy: createdBy ? BigInt(createdBy) : null,
      })
      .returning();

    return result;
  }

  /**
   * به روزرسانی اطلاعات ادمین
   */
  static async update(
    adminId: number,
    data: Partial<InsertAdmin>,
  ): Promise<Admin> {
    const [result] = await db
      .update(adminsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(adminsTable.id, adminId))
      .returning();

    // اگر role تغییر کرد، در users هم به‌روز کن
    if (data.role && result) {
      await db
        .update(usersTable)
        .set({ role: data.role })
        .where(eq(usersTable.id, result.userId as number));
    }

    return result;
  }

  /**
   * غیرفعال کردن ادمین
   */
  static async deactivate(adminId: number): Promise<Admin> {
    return await this.update(adminId, { isActive: false });
  }

  /**
   * فعال کردن ادمین
   */
  static async activate(adminId: number): Promise<Admin> {
    return await this.update(adminId, { isActive: true });
  }

  /**
   * حذف کامل ادمین
   */
  static async delete(adminId: number): Promise<void> {
    const admin = await this.findById(adminId);
    if (!admin) {
      throw new Error("ادمین یافت نشد");
    }

    // حذف از جدول admins
    await db.delete(adminsTable).where(eq(adminsTable.id, adminId));

    // تغییر role در users به customer
    await db
      .update(usersTable)
      .set({ role: "customer" })
      .where(eq(usersTable.id, admin.userId as number));
  }

  /**
   * بررسی دسترسی ادمین به یک بخش خاص
   */
  static async hasPermission(
    adminId: number,
    section: string,
  ): Promise<boolean> {
    const admin = await this.findById(adminId);
    if (!admin || !admin.isActive) return false;

    // SuperAdmin به همه چیز دسترسی دارد
    if (admin.isSuperAdmin) return true;

    // بررسی allowedSections
    const allowedSections = admin.allowedSections as string[] | null;
    if (allowedSections && !allowedSections.includes(section)) {
      return false;
    }

    // بررسی permissions object
    const permissions = admin.permissions as Record<string, boolean> | null;
    if (permissions && permissions[section] === false) {
      return false;
    }

    return true;
  }

  /**
   * بررسی IP ادمین
   */
  static async isIPAllowed(
    adminId: number,
    ipAddress: string,
  ): Promise<boolean> {
    const admin = await this.findById(adminId);
    if (!admin) return false;

    const restrictedIPs = admin.restrictedIPs as string[] | null;
    if (!restrictedIPs || restrictedIPs.length === 0) {
      return true; // اگر محدودیت IP نداشت، همه IP ها مجازند
    }

    return restrictedIPs.includes(ipAddress);
  }

  /**
   * به روزرسانی آخرین زمان فعالیت
   */
  static async updateLastActivity(adminId: number): Promise<void> {
    await db
      .update(adminsTable)
      .set({ lastActivityAt: new Date() })
      .where(eq(adminsTable.id, adminId));
  }

  /**
   * به روزرسانی اطلاعات لاگین
   */
  static async updateLoginInfo(adminId: number): Promise<void> {
    const admin = await this.findById(adminId);
    if (!admin) return;

    await db
      .update(adminsTable)
      .set({
        lastLoginAt: new Date(),
        loginCount: (admin.loginCount || 0) + 1,
      })
      .where(eq(adminsTable.id, adminId));
  }

  /**
   * تعداد کل ادمین‌ها
   */
  static async count(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminsTable);
    return result[0]?.count || 0;
  }

  /**
   * تعداد ادمین‌های فعال
   */
  static async countActive(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminsTable)
      .where(eq(adminsTable.isActive, true));
    return result[0]?.count || 0;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 Admin Log Repository
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AdminLogRepository {
  /**
   * ثبت لاگ عملیات ادمین
   */
  static async log(data: InsertAdminLog): Promise<void> {
    await db.insert(adminLogsTable).values(data);
  }

  /**
   * دریافت لاگ‌های یک ادمین
   */
  static async getByAdminId(
    adminId: number,
    limit: number = 50,
  ): Promise<(typeof adminLogsTable.$inferSelect)[]> {
    return await db
      .select()
      .from(adminLogsTable)
      .where(eq(adminLogsTable.adminId, adminId))
      .orderBy(desc(adminLogsTable.createdAt))
      .limit(limit);
  }

  /**
   * دریافت لاگ‌های یک entity خاص
   */
  static async getByEntity(
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<(typeof adminLogsTable.$inferSelect)[]> {
    return await db
      .select()
      .from(adminLogsTable)
      .where(
        and(
          eq(adminLogsTable.entityType, entityType),
          eq(adminLogsTable.entityId, entityId),
        ),
      )
      .orderBy(desc(adminLogsTable.createdAt))
      .limit(limit);
  }

  /**
   * دریافت تمام لاگ‌ها با فیلتر
   */
  static async getAll(
    filters?: {
      adminId?: number;
      action?: string;
      entityType?: string;
      severity?: string;
    },
    limit: number = 100,
  ): Promise<(typeof adminLogsTable.$inferSelect)[]> {
    let query = db.select().from(adminLogsTable);

    const conditions = [];
    if (filters?.adminId) {
      conditions.push(eq(adminLogsTable.adminId, filters.adminId));
    }
    if (filters?.action) {
      conditions.push(eq(adminLogsTable.action, filters.action));
    }
    if (filters?.entityType) {
      conditions.push(eq(adminLogsTable.entityType, filters.entityType));
    }
    if (filters?.severity) {
      conditions.push(eq(adminLogsTable.severity, filters.severity));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(adminLogsTable.createdAt)).limit(limit);
  }

  /**
   * حذف لاگ‌های قدیمی‌تر از تاریخ مشخص
   */
  static async deleteOlderThan(date: Date): Promise<void> {
    await db
      .delete(adminLogsTable)
      .where(sql`${adminLogsTable.createdAt} < ${date}`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 Admin Session Repository (for TMA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AdminSessionRepository {
  /**
   * ایجاد session جدید
   */
  static async create(data: InsertAdminSession): Promise<AdminSession> {
    const [result] = await db
      .insert(adminSessionsTable)
      .values(data)
      .returning();
    return result;
  }

  /**
   * پیدا کردن session با token
   */
  static async findByToken(token: string): Promise<AdminSession | undefined> {
    const [result] = await db
      .select()
      .from(adminSessionsTable)
      .where(
        and(
          eq(adminSessionsTable.token, token),
          eq(adminSessionsTable.isValid, true),
        ),
      )
      .limit(1);

    // بررسی expire شدن
    if (result && result.expiresAt < new Date()) {
      await this.invalidate(result.id);
      return undefined;
    }

    return result;
  }

  /**
   * به روزرسانی آخرین فعالیت session
   */
  static async updateActivity(sessionId: number): Promise<void> {
    await db
      .update(adminSessionsTable)
      .set({ lastActivityAt: new Date() })
      .where(eq(adminSessionsTable.id, sessionId));
  }

  /**
   * غیرفعال کردن session
   */
  static async invalidate(sessionId: number): Promise<void> {
    await db
      .update(adminSessionsTable)
      .set({ isValid: false })
      .where(eq(adminSessionsTable.id, sessionId));
  }

  /**
   * غیرفعال کردن تمام session‌های یک ادمین
   */
  static async invalidateAllByAdmin(adminId: number): Promise<void> {
    await db
      .update(adminSessionsTable)
      .set({ isValid: false })
      .where(eq(adminSessionsTable.adminId, adminId));
  }

  /**
   * حذف session‌های منقضی شده
   */
  static async deleteExpired(): Promise<void> {
    await db
      .delete(adminSessionsTable)
      .where(sql`${adminSessionsTable.expiresAt} < NOW()`);
  }

  /**
   * دریافت session‌های فعال یک ادمین
   */
  static async getActiveByAdmin(adminId: number): Promise<AdminSession[]> {
    return await db
      .select()
      .from(adminSessionsTable)
      .where(
        and(
          eq(adminSessionsTable.adminId, adminId),
          eq(adminSessionsTable.isValid, true),
        ),
      )
      .orderBy(desc(adminSessionsTable.createdAt));
  }
}
