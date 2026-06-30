import { db } from "../db/index.ts";
import { inventoryTable, Inventory, InsertInventory } from "../db/schema.ts";
import { eq, and, sql, inArray } from "drizzle-orm";
import { verrou } from "../services/locks.ts";

// ────────────────────────────────────────────────────────────────────────────
// InventoryRepository
//
// Status lifecycle:
//   available → reserved  (reserveItems — locked to prevent double-delivery)
//   reserved  → used      (markUsed — after order is confirmed & paid)
//   reserved  → available (releaseItems — on order cancel / payment fail)
//   any       → dead      (markDead — admin marks item as defective)
// ────────────────────────────────────────────────────────────────────────────

export class InventoryRepository {
  /**
   * افزودن یک آیتم جدید
   */
  static async create(data: InsertInventory): Promise<Inventory> {
    const [result] = await db.insert(inventoryTable).values(data).returning();
    return result;
  }

  /**
   * افزودن چند آیتم به یکباره
   */
  static async bulkCreate(items: InsertInventory[]): Promise<number> {
    if (items.length === 0) return 0;
    const inserted = await db.insert(inventoryTable).values(items).returning();
    return inserted.length;
  }

  /**
   * تعداد آیتم‌های available یک محصول
   */
  static async countAvailable(productId: number): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventoryTable)
      .where(
        and(
          eq(inventoryTable.productId, productId),
          eq(inventoryTable.status, "available"),
        ),
      );
    return row?.count ?? 0;
  }

  /**
   * تعداد آیتم‌های available برای چند محصول به‌صورت یکجا.
   * خروجی: Map از productId به تعداد موجودی در دسترس.
   */
  static async countAvailableByProductIds(
    productIds: number[],
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>();
    if (productIds.length === 0) return result;

    const rows = await db
      .select({
        productId: inventoryTable.productId,
        count: sql<number>`count(*)::int`,
      })
      .from(inventoryTable)
      .where(
        and(
          inArray(inventoryTable.productId, productIds),
          eq(inventoryTable.status, "available"),
        ),
      )
      .groupBy(inventoryTable.productId);

    for (const row of rows) result.set(row.productId, row.count);
    return result;
  }

  /**
   * همه آیتم‌های یک محصول (برای ادمین)
   */
  static async findByProductId(productId: number): Promise<Inventory[]> {
    return db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.productId, productId))
      .orderBy(inventoryTable.createdAt);
  }

  /**
   * یک آیتم با ID
   */
  static async findById(id: number): Promise<Inventory | undefined> {
    const [result] = await db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, id))
      .limit(1);
    return result;
  }

  /**
   * رزرو N آیتم برای یک سفارش — با قفل برای جلوگیری از تحویل دوگانه
   *
   * @returns لیست آیتم‌های رزرو شده، یا null اگر موجودی کافی نیست
   */
  static async reserveItems(
    productId: number,
    quantity: number,
    orderId: number,
  ): Promise<Inventory[] | null> {
    const lockKey = `inventory:reserve:${productId}`;

    const [acquired, result] = await verrou
      .createLock(lockKey, "10s")
      .run(async () => {
        // انتخاب N آیتم available
        const available = await db
          .select()
          .from(inventoryTable)
          .where(
            and(
              eq(inventoryTable.productId, productId),
              eq(inventoryTable.status, "available"),
            ),
          )
          .limit(quantity);

        if (available.length < quantity) {
          return null; // موجودی کافی نیست
        }

        const ids = available.map((i) => i.id);

        // تغییر وضعیت به reserved
        await db
          .update(inventoryTable)
          .set({
            status: "reserved",
            reservedAt: new Date(),
            usedByOrderId: orderId,
          })
          .where(
            sql`${inventoryTable.id} = ANY(ARRAY[${sql.join(
              ids.map((id) => sql`${id}`),
              sql`, `,
            )}]::int[])`,
          );

        // برگرداندن آیتم‌های بروز شده
        return db
          .select()
          .from(inventoryTable)
          .where(
            sql`${inventoryTable.id} = ANY(ARRAY[${sql.join(
              ids.map((id) => sql`${id}`),
              sql`, `,
            )}]::int[])`,
          );
      });

    if (!acquired) throw new Error("Could not acquire inventory lock");
    return result ?? null;
  }

  /**
   * تأیید تحویل — reserved → used
   */
  static async markUsed(ids: number[], orderId: number): Promise<void> {
    if (ids.length === 0) return;
    await db
      .update(inventoryTable)
      .set({
        status: "used",
        usedAt: new Date(),
        usedByOrderId: orderId,
      })
      .where(
        sql`${inventoryTable.id} = ANY(ARRAY[${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )}]::int[])`,
      );
  }

  /**
   * آزاد کردن آیتم‌های reserved — برای لغو سفارش یا شکست پرداخت
   */
  static async releaseItems(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await db
      .update(inventoryTable)
      .set({
        status: "available",
        reservedAt: null,
        usedByOrderId: null,
      })
      .where(
        sql`${inventoryTable.id} = ANY(ARRAY[${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )}]::int[])`,
      );
  }

  /**
   * علامت‌گذاری آیتم به عنوان Dead
   */
  static async markDead(id: number, reason: string): Promise<Inventory> {
    const [result] = await db
      .update(inventoryTable)
      .set({ status: "dead", deadReason: reason })
      .where(eq(inventoryTable.id, id))
      .returning();
    return result;
  }

  /**
   * Replace: آیتم قدیمی dead → آیتم جدید assigned به سفارش
   *
   * @param oldItemId   آیتم خراب قدیمی
   * @param newItemId   آیتم جایگزین (باید available باشد)
   * @param orderId     شماره سفارش
   * @param deadReason  دلیل dead شدن آیتم قبلی
   */
  static async replaceItem(
    oldItemId: number,
    newItemId: number,
    orderId: number,
    deadReason = "replaced by admin",
  ): Promise<Inventory> {
    // آیتم قدیمی → dead
    await db
      .update(inventoryTable)
      .set({ status: "dead", deadReason })
      .where(eq(inventoryTable.id, oldItemId));

    // آیتم جدید → used
    const [newItem] = await db
      .update(inventoryTable)
      .set({ status: "used", usedAt: new Date(), usedByOrderId: orderId })
      .where(
        and(
          eq(inventoryTable.id, newItemId),
          eq(inventoryTable.status, "available"),
        ),
      )
      .returning();

    if (!newItem) throw new Error("New item is not available for replacement");
    return newItem;
  }

  /**
   * آیتم‌های مرتبط با یک سفارش
   */
  static async findByOrderId(orderId: number): Promise<Inventory[]> {
    return db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.usedByOrderId, orderId));
  }

  /**
   * آپدیت مستقیم یک آیتم (برای ادمین)
   */
  static async update(
    id: number,
    data: Partial<
      Pick<
        Inventory,
        "email" | "password" | "extraData" | "status" | "deadReason"
      >
    >,
  ): Promise<Inventory> {
    const [result] = await db
      .update(inventoryTable)
      .set(data)
      .where(eq(inventoryTable.id, id))
      .returning();
    return result;
  }

  /**
   * حذف آیتم (فقط اگر available باشد)
   */
  static async delete(id: number): Promise<void> {
    const item = await this.findById(id);
    if (!item) throw new Error("Item not found");
    if (item.status !== "available" && item.status !== "dead") {
      throw new Error("Cannot delete a reserved or used item");
    }
    await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
  }
}
