/**
 * Seed script to create sample products for testing
 * Run this after seeding categories
 */

import { db } from "../db/index.ts";
import {
  categoriesTable,
  productsTable,
  productPlansTable,
} from "../db/schema.ts";
import { eq } from "drizzle-orm";

async function seedProducts() {
  console.log("🌱 Starting to seed products...");

  // Get categories
  const categories = await db.select().from(categoriesTable);
  const musicCategory = categories.find((c) => c.slug === "music");
  const aiCategory = categories.find((c) => c.slug === "ai");
  const vpnCategory = categories.find((c) => c.slug === "vpn");

  if (!musicCategory || !aiCategory || !vpnCategory) {
    console.error("❌ Categories not found. Please run seed-categories first.");
    process.exit(1);
  }

  // Music Products - Spotify
  const [existingSpotify] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, "spotify-premium"))
    .limit(1);

  if (existingSpotify) {
    console.log("⏭️  Spotify Premium already exists, skipping...");
  } else {
    const spotifyProduct = await db
      .insert(productsTable)
      .values({
        name: "Spotify Premium",
        slug: "spotify-premium",
        description:
          "اشتراک Spotify Premium با دسترسی به میلیون‌ها آهنگ بدون تبلیغ",
        categoryId: musicCategory.id,
        deliveryType: "automatic",
        isActive: true,
        stock: 10,
      })
      .returning();

    await db.insert(productPlansTable).values([
      {
        productId: spotifyProduct[0].id,
        name: "1 ماهه",
        description: "اشتراک یک ماهه",
        price: "15000",
        duration: 30,
        durationUnit: "day",
        order: 1,
      },
      {
        productId: spotifyProduct[0].id,
        name: "3 ماهه",
        description: "اشتراک سه ماهه",
        price: "40000",
        duration: 90,
        durationUnit: "day",
        order: 2,
      },
    ]);

    console.log("✅ Created Spotify Premium with plans");
  }

  // AI Products - ChatGPT
  const [existingChatGPT] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, "chatgpt-plus"))
    .limit(1);

  if (existingChatGPT) {
    console.log("⏭️  ChatGPT Plus already exists, skipping...");
  } else {
    const chatgptProduct = await db
      .insert(productsTable)
      .values({
        name: "ChatGPT Plus",
        slug: "chatgpt-plus",
        description: "اشتراک ChatGPT Plus با دسترسی به GPT-4",
        categoryId: aiCategory.id,
        deliveryType: "manual",
        isActive: true,
        stock: 5,
      })
      .returning();

    await db.insert(productPlansTable).values([
      {
        productId: chatgptProduct[0].id,
        name: "1 ماهه",
        description: "اشتراک یک ماهه",
        price: "200000",
        duration: 30,
        durationUnit: "day",
        order: 1,
      },
    ]);

    console.log("✅ Created ChatGPT Plus with plans");
  }

  // VPN Products
  const [existingVPN] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, "premium-vpn"))
    .limit(1);

  if (existingVPN) {
    console.log("⏭️  Premium VPN already exists, skipping...");
  } else {
    const vpnProduct = await db
      .insert(productsTable)
      .values({
        name: "Premium VPN",
        slug: "premium-vpn",
        description: "VPN پرسرعت با سرورهای متعدد",
        categoryId: vpnCategory.id,
        deliveryType: "automatic",
        isActive: true,
        stock: 20,
      })
      .returning();

    await db.insert(productPlansTable).values([
      {
        productId: vpnProduct[0].id,
        name: "1 ماهه",
        description: "اشتراک یک ماهه",
        price: "50000",
        duration: 30,
        durationUnit: "day",
        order: 1,
      },
      {
        productId: vpnProduct[0].id,
        name: "6 ماهه",
        description: "اشتراک شش ماهه",
        price: "250000",
        duration: 180,
        durationUnit: "day",
        order: 2,
      },
    ]);

    console.log("✅ Created Premium VPN with plans");
  }

  console.log("✨ Products seeding completed!");
  process.exit(0);
}

// Run the seed function
seedProducts().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
