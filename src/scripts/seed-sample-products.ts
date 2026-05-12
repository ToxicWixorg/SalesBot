import { and, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  categoriesTable,
  productPlansTable,
  productsTable,
} from "../db/schema.ts";

type RequiredInput = {
  key: string;
  label: string;
  inputType?: "text" | "email" | "password" | "number" | "url";
  required?: boolean;
  sensitive?: boolean;
  placeholder?: string;
};

type SeedPlan = {
  name: string;
  description: string;
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
  name: string;
  slug: string;
  description: string;
  stock: number;
  plans: SeedPlan[];
};

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  products: SeedProduct[];
};

const sampleCatalog: SeedCategory[] = [
  {
    name: "هوش مصنوعی",
    slug: "ai",
    description: "اشتراک‌های هوش مصنوعی",
    icon: "🤖",
    products: [
      {
        name: "ChatGPT Plus",
        slug: "chatgpt-plus",
        description: "اشتراک ChatGPT Plus با ورود دستی",
        stock: 12,
        plans: [
          {
            name: "ماهانه - ایمیل و رمز",
            description: "تحویل اکانت با ایمیل و رمز",
            price: "290000",
            duration: 30,
            durationUnit: "day",
            deliveryType: "manual",
            order: 1,
            requiredInputs: [
              {
                key: "account_email",
                label: "ایمیل اکانت",
                inputType: "email",
                required: true,
                sensitive: false,
                placeholder: "example@gmail.com",
              },
              {
                key: "account_password",
                label: "رمز اکانت",
                inputType: "password",
                required: true,
                sensitive: true,
                placeholder: "رمز ورود اکانت",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "خدمات احراز هویت",
    slug: "verification-services",
    description: "سرویس‌های نیازمند چند فیلد امنیتی",
    icon: "🛡️",
    products: [
      {
        name: "اکانت بانکی تست",
        slug: "bank-account-demo",
        description: "نمونه محصول با شماره/رمز/رمز دوم",
        stock: 8,
        plans: [
          {
            name: "ورود سه‌مرحله‌ای",
            description: "گرفتن شماره + رمز + رمز دوم",
            price: "180000",
            duration: 30,
            durationUnit: "day",
            deliveryType: "manual",
            order: 1,
            requiredInputs: [
              {
                key: "phone_number",
                label: "شماره موبایل",
                inputType: "text",
                required: true,
                sensitive: false,
                placeholder: "0912xxxxxxx",
              },
              {
                key: "login_password",
                label: "رمز عبور",
                inputType: "password",
                required: true,
                sensitive: true,
              },
              {
                key: "second_password",
                label: "رمز دوم",
                inputType: "password",
                required: true,
                sensitive: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "لینک و دعوت",
    slug: "links-and-invites",
    description: "محصولاتی که فقط یک لینک از کاربر می‌خواهند",
    icon: "🔗",
    products: [
      {
        name: "Invite Setup",
        slug: "invite-setup",
        description: "نمونه محصول با ورودی فقط لینک",
        stock: 20,
        plans: [
          {
            name: "فقط لینک",
            description: "کاربر فقط لینک هدف را می‌دهد",
            price: "95000",
            duration: 30,
            durationUnit: "day",
            deliveryType: "invite",
            order: 1,
            requiredInputs: [
              {
                key: "target_link",
                label: "لینک موردنظر",
                inputType: "url",
                required: true,
                sensitive: false,
                placeholder: "https://...",
              },
            ],
          },
        ],
      },
    ],
  },
];

async function ensureCategory(category: SeedCategory) {
  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, category.slug))
    .limit(1);

  if (existing) {
    console.log(`⏭️  Category exists: ${category.slug}`);
    return existing;
  }

  const [created] = await db
    .insert(categoriesTable)
    .values({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      isActive: true,
    })
    .returning();

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
    console.log(`⏭️  Product exists: ${product.slug}`);
    return existing;
  }

  const [created] = await db
    .insert(productsTable)
    .values({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId,
      isActive: true,
      stock: product.stock,
      minStock: 2,
      requiresEmail: false,
      requiresOtp: false,
      requiresLogin: false,
      requiresRegion: false,
    })
    .returning();

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
        eq(productPlansTable.name, plan.name),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(productPlansTable)
      .set({
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        durationUnit: plan.durationUnit,
        deliveryType: plan.deliveryType,
        order: plan.order,
        isActive: true,
        requiredInputs: plan.requiredInputs,
      })
      .where(eq(productPlansTable.id, existing.id));

    console.log(`🔄 Plan updated: ${plan.name}`);
    return;
  }

  await db.insert(productPlansTable).values({
    productId,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    duration: plan.duration,
    durationUnit: plan.durationUnit,
    deliveryType: plan.deliveryType,
    order: plan.order,
    isActive: true,
    requiredInputs: plan.requiredInputs,
  });

  console.log(`✅ Plan created: ${plan.name}`);
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
