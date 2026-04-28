import { db } from "../db/index.ts";
import {
  ordersTable,
  InsertOrder,
  Order,
  subscriptionsTable,
  Subscription,
  InsertSubscription,
} from "../db/schema.ts";
import { eq, desc, and, or } from "drizzle-orm";

export class OrderRepository {
  /**
   * سفارش را با ID پیدا کن
   */
  static async findById(id: number): Promise<Order | undefined> {
    const [result] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * تمام سفارش‌های یک کاربر
   */
  static async findByUserId(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, BigInt(userId) as any))
      .orderBy(desc(ordersTable.createdAt));
  }

  /**
   * سفارش‌های یک کاربر حسب وضعیت
   */
  static async findByUserIdAndStatus(
    userId: number,
    status: string,
  ): Promise<Order[]> {
    return db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.userId, BigInt(userId) as any),
          eq(ordersTable.status, status),
        ),
      )
      .orderBy(desc(ordersTable.createdAt));
  }

  /**
   * سفارش جدید ایجاد کن
   */
  static async create(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(ordersTable).values(order).returning();

    return result;
  }

  /**
   * وضعیت سفارش را به روزرسانی کن
   */
  static async updateStatus(id: number, status: string): Promise<Order> {
    const [result] = await db
      .update(ordersTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    return result;
  }

  /**
   * سفارش را تحویل شده علامت‌گذاری کن
   */
  static async markAsDelivered(id: number, delivery: any): Promise<Order> {
    const [result] = await db
      .update(ordersTable)
      .set({
        status: "completed",
        delivery,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    return result;
  }

  /**
   * سفارش‌های منتظر در Admin
   */
  static async getPendingOrders(): Promise<Order[]> {
    return db
      .select()
      .from(ordersTable)
      .where(
        or(
          eq(ordersTable.status, "pending_payment"),
          eq(ordersTable.status, "pending_admin"),
          eq(ordersTable.status, "waiting_schedule"),
        ),
      )
      .orderBy(desc(ordersTable.createdAt));
  }

  /**
   * سفارش‌های Paid را گرفتار کن
   */
  static async getPaidOrders(): Promise<Order[]> {
    return db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.status, "paid"))
      .orderBy(desc(ordersTable.createdAt));
  }
}

/**
 * Subscription Repository
 */
export class SubscriptionRepository {
  /**
   * اشتراک کاربر را پیدا کن
   */
  static async findByUserId(userId: number): Promise<Subscription[]> {
    return db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, BigInt(userId) as any))
      .orderBy(desc(subscriptionsTable.endDate));
  }

  /**
   * اشتراک فعال کاربر
   */
  static async findActiveByUserId(userId: number): Promise<Subscription[]> {
    return db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, BigInt(userId) as any),
          eq(subscriptionsTable.status, "active"),
        ),
      )
      .orderBy(desc(subscriptionsTable.endDate));
  }

  /**
   * اشتراک جدید ایجاد کن
   */
  static async create(subscription: InsertSubscription): Promise<Subscription> {
    const [result] = await db
      .insert(subscriptionsTable)
      .values(subscription)
      .returning();

    return result;
  }

  /**
   * اشتراک را بروزرسانی کن
   */
  static async update(
    id: number,
    data: Partial<Subscription>,
  ): Promise<Subscription> {
    const [result] = await db
      .update(subscriptionsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, id))
      .returning();

    return result;
  }

  /**
   * اشتراک‌های در حال انقضا
   */
  static async getExpiringSubscriptions(
    daysFrom: number = 3,
  ): Promise<Subscription[]> {
    return db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.status, "active"),
          eq(subscriptionsTable.reminderSent, false),
        ),
      );
  }
}
