/**
 * Seed script to create sample orders for a specific user
 * این اسکریپت برای یک کاربر خاص، چند سفارش نمونه ایجاد می‌کند
 *
 * Usage:
 * 1. USER_ID را در خط 18 با آیدی تلگرام کاربر خود جایگزین کنید
 * 2. اسکریپت را اجرا کنید: bun run seed:o
 */

import { db } from "../db/index.ts";
import { productsTable, productPlansTable, ordersTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

// 👤 آیدی تلگرام کاربر را اینجا وارد کنید
const USER_ID = 7417727350; // <-- آیدی خودتان را اینجا قرار دهید

// نمونه سفارشات با statusهای مختلف
const orderStatuses = [
  {
    status: "completed",
    description: "سفارش تکمیل شده - Spotify Premium",
    delivery: {
      type: "account",
      email: "user@spotify.com",
      password: "Demo@12345",
      message: "حساب کاربری شما آماده است. از حساب خود استفاده کنید.",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 روز پیش
    daysAgo: 5,
  },
  {
    status: "active",
    description: "سفارش فعال - ChatGPT Plus Invite",
    delivery: {
      type: "invite",
      email: "user@example.com",
      inviteStatus: "accepted",
      teamName: "ChatGPT Team",
      message: "شما با موفقیت به تیم اضافه شدید.",
    },
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 روز پیش
    daysAgo: 2,
  },
  {
    status: "in_progress",
    description: "در حال پردازش - VPN Setup",
    delivery: null,
    deliveredAt: null,
    daysAgo: 0,
  },
  {
    status: "paid",
    description: "پرداخت شده، منتظر تحویل",
    delivery: null,
    deliveredAt: null,
    daysAgo: 0,
  },
  {
    status: "pending_admin",
    description: "منتظر بررسی ادمین",
    delivery: null,
    deliveredAt: null,
    daysAgo: 1,
  },
  {
    status: "waiting_invite",
    description: "منتظر ارسال دعوت‌نامه",
    delivery: {
      type: "invite",
      email: "waiting@example.com",
      inviteStatus: "pending",
    },
    deliveredAt: null,
    daysAgo: 0,
  },
  {
    status: "completed",
    description: "سفارش قدیمی تکمیل شده",
    delivery: {
      type: "code",
      code: "XXXXX-XXXXX-XXXXX",
      message: "کد فعال‌سازی شما",
    },
    deliveredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 روز پیش
    daysAgo: 15,
  },
  {
    status: "expiring_soon",
    description: "در حال اتمام - تمدید کنید",
    delivery: {
      type: "account",
      email: "expiring@example.com",
      password: "Demo@12345",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 روز دیگه تموم میشه
    },
    deliveredAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), // 27 روز پیش تحویل شده (از 30 روز)
    daysAgo: 27,
  },
];

async function seedOrders() {
  console.log(`\n🌱 Creating sample orders for user ${USER_ID}...\n`);

  // دریافت لیست محصولات فعال
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isActive, true));

  if (products.length === 0) {
    console.error(
      "❌ No active products found. Please run seed-products first.",
    );
    console.log("\n💡 Run: bun run seed:categories && bun run seed:products\n");
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} active products\n`);

  // ایجاد سفارشات
  let createdCount = 0;
  let productIndex = 0;

  for (const orderTemplate of orderStatuses) {
    // چرخش در محصولات
    const product = products[productIndex % products.length];
    productIndex++;

    try {
      // دریافت اولین plan محصول
      const plans = await db
        .select()
        .from(productPlansTable)
        .where(eq(productPlansTable.productId, product.id));

      if (plans.length === 0) {
        console.log(
          `⏭️  No plan found for product "${product.name}", skipping...`,
        );
        continue;
      }

      // انتخاب یک plan تصادفی
      const plan = plans[Math.floor(Math.random() * plans.length)];

      const price = parseFloat(plan.price);
      const discount = createdCount === 0 ? price * 0.15 : 0; // 15% تخفیف برای اولین سفارش
      const finalPrice = price - discount;

      // ایجاد سفارش
      const [order] = await db
        .insert(ordersTable)
        .values({
          userId: USER_ID,
          productId: product.id,
          planId: plan.id,
          status: orderTemplate.status,
          quantity: 1,
          totalPrice: plan.price,
          discountAmount: discount.toFixed(2),
          walletUsed: "0",
          finalPrice: finalPrice.toFixed(2),
          paymentMethod:
            createdCount % 3 === 0
              ? "wallet"
              : createdCount % 3 === 1
                ? "card"
                : "zarinpal",
          paymentId: `SEED_${Date.now()}_${createdCount}`,
          delivery: orderTemplate.delivery as any,
          deliveredAt: orderTemplate.deliveredAt,
          notes: orderTemplate.description,
          createdAt: new Date(
            Date.now() - orderTemplate.daysAgo * 24 * 60 * 60 * 1000,
          ),
        })
        .returning();

      createdCount++;

      const statusEmoji =
        orderTemplate.status === "completed"
          ? "✅"
          : orderTemplate.status === "active"
            ? "🟢"
            : orderTemplate.status === "in_progress"
              ? "⏳"
              : orderTemplate.status === "paid"
                ? "💰"
                : "⏸️";

      console.log(
        `${statusEmoji} Order #${order.id}: ${product.name} (${plan.name})`,
      );
      console.log(`   Status: ${orderTemplate.status}`);
      console.log(`   Price: ${finalPrice.toFixed(0)} تومان`);
      if (discount > 0) {
        console.log(`   Discount: ${discount.toFixed(0)} تومان (15%)`);
      }
      console.log(
        `   Created: ${orderTemplate.daysAgo} روز پیش${orderTemplate.deliveredAt ? " | تحویل داده شده" : ""}\n`,
      );
    } catch (error) {
      console.error(`❌ Error creating order for "${product.name}":`, error);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✨ Successfully created ${createdCount} sample orders!`);
  console.log(`${"=".repeat(60)}\n`);

  console.log(`📊 Order Summary:`);
  console.log(`   👤 User ID: ${USER_ID}`);
  console.log(`   📦 Total Orders: ${createdCount}`);
  console.log(
    `   ✅ Completed: ${orderStatuses.filter((o) => o.status === "completed").length}`,
  );
  console.log(
    `   🟢 Active: ${orderStatuses.filter((o) => o.status === "active").length}`,
  );
  console.log(
    `   ⏳ In Progress: ${orderStatuses.filter((o) => o.status === "in_progress").length}`,
  );
  console.log(
    `   💰 Paid: ${orderStatuses.filter((o) => o.status === "paid").length}`,
  );
  console.log(
    `   ⚠️  Expiring Soon: ${orderStatuses.filter((o) => o.status === "expiring_soon").length}`,
  );

  console.log(`\n💡 You can now test the orders section in your bot!`);
  console.log(`   - Send /start to the bot`);
  console.log(`   - Click on "📦 سفارشات من"`);
  console.log(`   - View your sample orders\n`);

  process.exit(0);
}

// Run the seed function
seedOrders().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
