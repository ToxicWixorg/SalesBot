import { db } from "../db/index.ts";
import { usersTable, InsertUser, User } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export class UserRepository {
  /**
   * کاربر را بوسیله Telegram ID پیدا کن
   */
  static async findById(id: number): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    console.log("user by id: ", result);
    return result;
  }

  /**
   * کاربر را بوسیله نام کاربری پیدا کن
   */
  static async findByUsername(username: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    return result;
  }

  /**
   * کاربر را بوسیله کد ریفرال پیدا کن
   */
  static async findByReferralCode(
    referralCode: string,
  ): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.referralCode, referralCode))
      .limit(1);

    return result;
  }

  /**
   * کاربر جدید ایجاد کن یا اگه وجود داشت برگردون (upsert)
   */
  static async create(
    user: InsertUser,
  ): Promise<{ user: User; isNew: boolean }> {
    const [result] = await db
      .insert(usersTable)
      .values(user)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
      .returning();
    console.log("result: ", result);
    // اگه referredBy null بود و توی DB هم null بود، یعنی جدیده
    // ولی مطمئن‌ترین روش اینه که قبلاً findById کردیم
    return {
      user: result,
      isNew: !user.referredBy && result.createdAt === result.updatedAt,
    };
  }

  /**
   * کاربر موجود را به روزرسانی کن
   */
  static async update(id: number, data: Partial<InsertUser>): Promise<User> {
    const [result] = await db
      .update(usersTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    return result;
  }

  /**
   * تعداد کاربران کل
   */
  static async count(): Promise<number> {
    return Promise.resolve(0);
  }

  /**
   * موجودی کیف پول یوزر
   */
  static async getWalletBalance(userId: number): Promise<string> {
    const user = await this.findById(userId);
    return user?.walletBalance || "0";
  }

  /**
   * موجودی کیف پول را به روزرسانی کن
   */
  static async updateWalletBalance(
    userId: number,
    newBalance: string,
  ): Promise<User> {
    return this.update(userId, {
      walletBalance: newBalance as any,
    });
  }

  /**
   * کاربر را مسدود کن
   */
  static async blockUser(userId: number, reason: string): Promise<User> {
    return this.update(userId, {
      isBlocked: true,
      blockedReason: reason,
    });
  }

  /**
   * نقش کاربر را تغییر بده
   */
  static async updateRole(
    userId: number,
    role: "customer" | "support" | "admin",
  ): Promise<User> {
    return this.update(userId, { role });
  }
}
