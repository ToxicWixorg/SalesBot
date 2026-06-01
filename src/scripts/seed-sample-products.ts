import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  categoriesTable,
  productPlansTable,
  productsTable,
} from "../db/schema.ts";

type LocalizedText = {
  fa: string;
  en: string;
  ru: string;
};

const l = (fa: string, en?: string, ru?: string): LocalizedText => ({
  fa,
  en: en ?? fa,
  ru: ru ?? fa,
});

type RequiredInput = {
  key: string;
  textFA?: string;
  textEN?: string;
  textRU?: string;
  inputType?: "text" | "email" | "password" | "number" | "url";
  required?: boolean;
  sensitive?: boolean;
  placeholder?: string; // legacy single placeholder (kept for convenience)
  placeholderFA?: string;
  placeholderEN?: string;
  placeholderRU?: string;
};

type SeedPlan = {
  name: LocalizedText;
  description: LocalizedText;
  customEmojiId?: string;
  price: string;
  duration: number;
  durationUnit: "day" | "month" | "year";
  deliveryType:
    | "automatic"
    | "manual"
    | "custom_schedule"
    | "invite"
    | "code"
    | "family_join"
    | "renewable"
    | "reservation";
  order: number;
  requiredInputs: RequiredInput[];
};

type SeedProduct = {
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  customEmojiId?: string;
  stock: number;
  plans: SeedPlan[];
};

type SeedCategory = {
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  icon: string;
  customEmojiId?: string;
  products: SeedProduct[];
};

const sampleCatalog: SeedCategory[] = [
  {
    name: l("هوش مصنوعی", "AI", "ИИ"),
    slug: "ai",
    description: l(
      "اشتراک‌های هوش مصنوعی",
      "AI subscriptions",
      "Подписки на ИИ",
    ),
    icon: "",
    customEmojiId: "4938219621594433836",
    products: [
      {
        name: l("چت جی پی تی پلاس", "ChatGPT Plus", "ChatGPT Plus"),
        slug: "chatgpt-plus",
        description: l(
          "اشتراک ChatGPT Plus با ورود دستی",
          "ChatGPT Plus subscription with manual delivery",
          "Подписка ChatGPT Plus с ручной выдачей",
        ),
        customEmojiId: "5796185041717433060",
        stock: 12,
        plans: [
          {
            name: l(
              "ماهانه - ایمیل و رمز",
              "Monthly - email & password",
              "Ежемесячно - email и пароль",
            ),
            description: l(
              "تحویل اکانت با ایمیل و رمز",
              "Account delivered with email and password",
              "Выдача аккаунта с email и паролем",
            ),
            price: "290000",
            duration: 30,
            durationUnit: "day",
            deliveryType: "manual",
            order: 1,
            requiredInputs: [
              {
                key: "account_email",
                textFA: "ایمیل اکانت",
                textEN: "Account email",
                textRU: "Email аккаунта",
                inputType: "email",
                required: true,
                sensitive: false,
                placeholder: "example@gmail.com",
                placeholderFA: "example@gmail.com",
                placeholderEN: "example@gmail.com",
              },
              {
                key: "account_password",
                textFA: "رمز اکانت",
                textEN: "Account password",
                textRU: "Пароль аккаунта",
                inputType: "password",
                required: true,
                sensitive: true,
                placeholder: "رمز ورود اکانت",
                placeholderFA: "رمز ورود اکانت",
                placeholderEN: "Account password",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: l("موسیقی", "Music", "Музыка"),
    slug: "music",
    description: l(
      "سرویس‌های نیازمند چند فیلد امنیتی",
      "Services requiring multiple security fields",
      "Сервисы, требующие несколько полей безопасности",
    ),
    icon: "",
    customEmojiId: "5363988860747400777",
    products: [
      {
        name: l("اسپاتیفاس", "Spotify", "Spotify"),
        slug: "spotify",
        description: l("", "", ""),
        customEmojiId: "5796304385973686816",
        stock: 8,
        plans: [
          {
            name: l("3 ماهه", "3 months", "3 месяца"),
            description: l(
              "تحویل اکانت با ایمیل و رمز",
              "Account delivered with email and password",
              "Выдача аккаунта с email и паролем",
            ),
            price: "290000",
            duration: 3,
            durationUnit: "month",
            deliveryType: "manual",
            order: 1,
            requiredInputs: [
              {
                key: "account_email",
                textFA: "ایمیل اکانت",
                textEN: "Account email",
                textRU: "Email аккаунта",
                inputType: "email",
                required: true,
                sensitive: false,
                placeholder: "example@gmail.com",
                placeholderFA: "example@gmail.com",
                placeholderEN: "example@gmail.com",
              },
              {
                key: "account_password",
                textFA: "رمز اکانت",
                textEN: "Account password",
                textRU: "Пароль аккаунта",
                inputType: "password",
                required: true,
                sensitive: false,
                placeholder: "رمز ورود اکانت",
                placeholderFA: "رمز ورود اکانت",
                placeholderEN: "Account password",
              },
            ],
          },
        ],
      },
    ],
  },
];

async function syncLegacyLocalizedColumns(params: {
  tableName: "categories" | "products" | "product_plans";
  id: number;
  nameFA: string;
  descriptionFA: string | null;
}) {
  const { tableName, id, nameFA, descriptionFA } = params;

  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = 'name'
      ) THEN
        EXECUTE format('UPDATE %I SET name = COALESCE(name, $1) WHERE id = $2', ${tableName})
        USING ${nameFA}, ${id};
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = 'description'
      ) THEN
        EXECUTE format('UPDATE %I SET description = COALESCE(description, $1) WHERE id = $2', ${tableName})
        USING ${descriptionFA}, ${id};
      END IF;
    END $$;
  `);
}

async function ensureCategory(category: SeedCategory) {
  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, category.slug))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(categoriesTable)
      .set({
        nameFA: category.name.fa,
        nameEN: category.name.en,
        nameRU: category.name.ru,
        descriptionFA: category.description.fa || null,
        descriptionEN: category.description.en || null,
        descriptionRU: category.description.ru || null,
        icon: category.icon || null,
        customEmojiId: category.customEmojiId ?? null,
        isActive: true,
      })
      .where(eq(categoriesTable.id, existing.id))
      .returning();

    await syncLegacyLocalizedColumns({
      tableName: "categories",
      id: existing.id,
      nameFA: category.name.fa,
      descriptionFA: category.description.fa || null,
    });

    console.log(`🔄 Category updated: ${category.slug}`);
    return updated ?? existing;
  }

  const [created] = await db
    .insert(categoriesTable)
    .values({
      nameFA: category.name.fa,
      nameEN: category.name.en,
      nameRU: category.name.ru,
      slug: category.slug,
      descriptionFA: category.description.fa || null,
      descriptionEN: category.description.en || null,
      descriptionRU: category.description.ru || null,
      icon: category.icon || null,
      customEmojiId: category.customEmojiId ?? null,
      isActive: true,
    })
    .returning();

  await syncLegacyLocalizedColumns({
    tableName: "categories",
    id: created!.id,
    nameFA: category.name.fa,
    descriptionFA: category.description.fa || null,
  });

  console.log(`✅ Category created: ${category.slug}`);
  return created!;
}

async function ensureProduct(categoryId: number, product: SeedProduct) {
  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, product.slug))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(productsTable)
      .set({
        nameFA: product.name.fa,
        nameEN: product.name.en,
        nameRU: product.name.ru,
        descriptionFA: product.description.fa || null,
        descriptionEN: product.description.en || null,
        descriptionRU: product.description.ru || null,
        categoryId,
        isActive: true,
        stock: product.stock,
        minStock: 2,
        requiresEmail: false,
        requiresOtp: false,
        requiresLogin: false,
        requiresRegion: false,
        customEmojiId: product.customEmojiId ?? null,
      })
      .where(eq(productsTable.id, existing.id))
      .returning();

    await syncLegacyLocalizedColumns({
      tableName: "products",
      id: existing.id,
      nameFA: product.name.fa,
      descriptionFA: product.description.fa || null,
    });

    console.log(`🔄 Product updated: ${product.slug}`);
    return updated ?? existing;
  }

  const [created] = await db
    .insert(productsTable)
    .values({
      nameFA: product.name.fa,
      nameEN: product.name.en,
      nameRU: product.name.ru,
      slug: product.slug,
      descriptionFA: product.description.fa || null,
      descriptionEN: product.description.en || null,
      descriptionRU: product.description.ru || null,
      categoryId,
      isActive: true,
      stock: product.stock,
      minStock: 2,
      requiresEmail: false,
      requiresOtp: false,
      requiresLogin: false,
      requiresRegion: false,
      customEmojiId: product.customEmojiId ?? null,
    })
    .returning();

  await syncLegacyLocalizedColumns({
    tableName: "products",
    id: created!.id,
    nameFA: product.name.fa,
    descriptionFA: product.description.fa || null,
  });

  console.log(`✅ Product created: ${product.slug}`);
  return created!;
}

async function ensurePlan(productId: number, plan: SeedPlan) {
  const [existing] = await db
    .select()
    .from(productPlansTable)
    .where(
      and(
        eq(productPlansTable.productId, productId),
        eq(productPlansTable.nameFA, plan.name.fa),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(productPlansTable)
      .set({
        nameFA: plan.name.fa,
        nameEN: plan.name.en,
        nameRU: plan.name.ru,
        descriptionFA: plan.description.fa || null,
        descriptionEN: plan.description.en || null,
        descriptionRU: plan.description.ru || null,
        price: plan.price,
        duration: plan.duration,
        durationUnit: plan.durationUnit,
        deliveryType: plan.deliveryType,
        order: plan.order,
        isActive: true,
        requiredInputs: plan.requiredInputs as any,
        customEmojiId: plan.customEmojiId ?? null,
      })
      .where(eq(productPlansTable.id, existing.id));

    await syncLegacyLocalizedColumns({
      tableName: "product_plans",
      id: existing.id,
      nameFA: plan.name.fa,
      descriptionFA: plan.description.fa || null,
    });

    console.log(`🔄 Plan updated: ${plan.name.fa}`);
    return;
  }

  const [created] = await db
    .insert(productPlansTable)
    .values({
      productId,
      nameFA: plan.name.fa,
      nameEN: plan.name.en,
      nameRU: plan.name.ru,
      descriptionFA: plan.description.fa || null,
      descriptionEN: plan.description.en || null,
      descriptionRU: plan.description.ru || null,
      price: plan.price,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      deliveryType: plan.deliveryType,
      order: plan.order,
      isActive: true,
      requiredInputs: plan.requiredInputs as any,
      customEmojiId: plan.customEmojiId ?? null,
    })
    .returning();

  await syncLegacyLocalizedColumns({
    tableName: "product_plans",
    id: created!.id,
    nameFA: plan.name.fa,
    descriptionFA: plan.description.fa || null,
  });

  console.log(`✅ Plan created: ${plan.name.fa}`);
}

async function seedSampleProducts() {
  console.log("🌱 Seeding sample categories/products/plans (idempotent)...\n");

  for (const category of sampleCatalog) {
    const ensuredCategory = await ensureCategory(category);

    for (const product of category.products) {
      const ensuredProduct = await ensureProduct(ensuredCategory.id, product);

      for (const plan of product.plans) {
        await ensurePlan(ensuredProduct.id, plan);
      }
    }
  }

  console.log("\n✨ Sample seed completed successfully.");
  process.exit(0);
}

seedSampleProducts().catch((error) => {
  console.error("❌ Sample seed failed:", error);
  process.exit(1);
});
