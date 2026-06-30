import { db } from "../db/index.ts";
import {
  productsTable,
  Product,
  InsertProduct,
  productPlansTable,
  ProductPlan,
  InsertProductPlan,
  categoriesTable,
  Category,
  InsertCategory,
  productConfigsTable,
  ProductConfig,
  InsertProductConfig,
} from "../db/schema.ts";
import { eq, desc, and, isNull, asc } from "drizzle-orm";

export class ProductRepository {
  /**
   * محصول را با ID پیدا کن
   */
  static async findById(id: number): Promise<Product | undefined> {
    const [result] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * محصول را با Slug پیدا کن
   */
  static async findBySlug(slug: string): Promise<Product | undefined> {
    const [result] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug))
      .limit(1);

    return result;
  }

  /**
   * تمام محصولات فعال
   */
  static async findActive(): Promise<Product[]> {
    return db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isActive, true))
      .orderBy(asc(productsTable.displayOrder), asc(productsTable.nameFA));
  }

  /**
   * محصولات یک دسته
   */
  static async findByCategory(categoryId: number): Promise<Product[]> {
    return db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.categoryId, categoryId),
          eq(productsTable.isActive, true),
        ),
      )
      .orderBy(asc(productsTable.displayOrder), asc(productsTable.nameFA));
  }

  static async findAllByCategory(categoryId: number): Promise<Product[]> {
    return db
      .select()
      .from(productsTable)
      .where(eq(productsTable.categoryId, categoryId))
      .orderBy(asc(productsTable.displayOrder), asc(productsTable.nameFA));
  }

  /**
   * محصول جدید ایجاد کن
   */
  static async create(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(productsTable).values(product).returning();

    return result;
  }

  /**
   * محصول را بروزرسانی کن
   */
  static async update(id: number, data: Partial<Product>): Promise<Product> {
    const [result] = await db
      .update(productsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    return result;
  }

  /**
   * موجودی محصول را کم کن
   */
  static async decreaseStock(
    productId: number,
    quantity: number = 1,
  ): Promise<Product> {
    const product = await this.findById(productId);
    if (!product) throw new Error("Product not found");

    return this.update(productId, {
      stock: (product.stock || 0) - quantity,
    });
  }
}

export class ProductPlanRepository {
  /**
   * پلن را با ID پیدا کن
   */
  static async findById(id: number): Promise<ProductPlan | undefined> {
    const [result] = await db
      .select()
      .from(productPlansTable)
      .where(eq(productPlansTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * تمام پلن‌های یک محصول
   */
  static async findByProductId(productId: number): Promise<ProductPlan[]> {
    return db
      .select()
      .from(productPlansTable)
      .where(
        and(
          eq(productPlansTable.productId, productId),
          eq(productPlansTable.isActive, true),
        ),
      )
      .orderBy(productPlansTable.order);
  }

  static async findAllByProductId(productId: number): Promise<ProductPlan[]> {
    return db
      .select()
      .from(productPlansTable)
      .where(eq(productPlansTable.productId, productId))
      .orderBy(productPlansTable.order);
  }

  /**
   * پلن جدید ایجاد کن
   */
  static async create(plan: InsertProductPlan): Promise<ProductPlan> {
    const [result] = await db
      .insert(productPlansTable)
      .values(plan)
      .returning();

    return result;
  }

  /**
   * پلن را بروزرسانی کن
   */
  static async update(
    id: number,
    data: Partial<ProductPlan>,
  ): Promise<ProductPlan> {
    const [result] = await db
      .update(productPlansTable)
      .set(data)
      .where(eq(productPlansTable.id, id))
      .returning();

    return result;
  }
}

export class PremiumCategoryRepository {
  /**
   * دسته را با ID پیدا کن
   */
  static async findById(id: number): Promise<Category | undefined> {
    const [result] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * دسته را با Slug پیدا کن
   */
  static async findBySlug(slug: string): Promise<Category | undefined> {
    const [result] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug))
      .limit(1);

    return result;
  }

  /**
   * تمام دسته‌ها
   */
  static async findAll(): Promise<Category[]> {
    return db.select().from(categoriesTable).orderBy(categoriesTable.nameFA);
  }

  /**
   * دسته جدید ایجاد کن
   */
  static async create(category: InsertCategory): Promise<Category> {
    const [result] = await db
      .insert(categoriesTable)
      .values(category)
      .returning();

    return result;
  }

  static async update(
    id: number,
    data: Partial<Category>,
  ): Promise<Category> {
    const [result] = await db
      .update(categoriesTable)
      .set(data)
      .where(eq(categoriesTable.id, id))
      .returning();

    return result;
  }
}

export class ProductConfigRepository {
  /**
   * اولین کانفیگ استفاده نشده برای یک محصول (بدون توجه به پلن)
   */
  static async findAvailableByProductId(
    productId: number,
  ): Promise<ProductConfig | undefined> {
    const [result] = await db
      .select()
      .from(productConfigsTable)
      .where(
        and(
          eq(productConfigsTable.productId, productId),
          eq(productConfigsTable.isUsed, false),
        ),
      )
      .limit(1);

    return result;
  }

  /**
   * اولین کانفیگ استفاده نشده برای یک پلن خاص
   */
  static async findAvailableByPlanId(
    planId: number,
  ): Promise<ProductConfig | undefined> {
    const [result] = await db
      .select()
      .from(productConfigsTable)
      .where(
        and(
          eq(productConfigsTable.planId, planId),
          eq(productConfigsTable.isUsed, false),
        ),
      )
      .limit(1);

    return result;
  }

  /**
   * کانفیگ را به عنوان استفاده شده علامت‌گذاری کن
   */
  static async markAsUsed(id: number, orderId: number): Promise<ProductConfig> {
    const [result] = await db
      .update(productConfigsTable)
      .set({
        isUsed: true,
        orderId,
        assignedAt: new Date(),
      })
      .where(eq(productConfigsTable.id, id))
      .returning();

    return result;
  }

  /**
   * تعداد کانفیگ‌های موجود برای یک محصول
   */
  static async countAvailableByProductId(productId: number): Promise<number> {
    const results = await db
      .select()
      .from(productConfigsTable)
      .where(
        and(
          eq(productConfigsTable.productId, productId),
          eq(productConfigsTable.isUsed, false),
        ),
      );

    return results.length;
  }

  /**
   * کانفیگ جدید اضافه کن
   */
  static async create(config: InsertProductConfig): Promise<ProductConfig> {
    const [result] = await db
      .insert(productConfigsTable)
      .values(config)
      .returning();

    return result;
  }

  /**
   * کانفیگ‌های یک سفارش
   */
  static async findByOrderId(orderId: number): Promise<ProductConfig[]> {
    return db
      .select()
      .from(productConfigsTable)
      .where(eq(productConfigsTable.orderId, orderId));
  }
}

export const CategoryRepository = PremiumCategoryRepository;
