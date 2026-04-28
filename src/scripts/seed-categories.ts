/**
 * Seed script to create initial categories
 * Run this script once to populate the database with default categories
 */

import { db } from "../db/index.ts";
import { categoriesTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const defaultCategories = [
  {
    name: "موزیک",
    slug: "music",
    description: "اشتراک‌های موسیقی مثل Spotify, Apple Music, Deezer",
    icon: "🎵",
  },
  {
    name: "هوش مصنوعی",
    slug: "ai",
    description: "اشتراک‌های هوش مصنوعی مثل ChatGPT, Midjourney, Claude",
    icon: "🤖",
  },
  {
    name: "VPN",
    slug: "vpn",
    description: "سرویس‌های VPN مختلف",
    icon: "🌐",
  },
  {
    name: "سایر",
    slug: "other",
    description: "سایر محصولات دیجیتال",
    icon: "🎮",
  },
];

async function seedCategories() {
  console.log("🌱 Starting to seed categories...");

  for (const category of defaultCategories) {
    try {
      // Check if category already exists
      const [existing] = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, category.slug))
        .limit(1);

      if (existing) {
        console.log(
          `⏭️  Category "${category.name}" already exists, skipping...`,
        );
        continue;
      }

      // Create category
      await db.insert(categoriesTable).values(category);
      console.log(`✅ Created category: ${category.icon} ${category.name}`);
    } catch (error) {
      console.error(`❌ Error creating category "${category.name}":`, error);
    }
  }

  console.log("✨ Categories seeding completed!");
  process.exit(0);
}

// Run the seed function
seedCategories().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
