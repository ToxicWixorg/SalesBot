import { db } from "../db/index.ts";
import { categoriesTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const defaultCategories = [
  // {
  //   name: "موزیک",
  //   slug: "music",
  //   description: "اشتراک‌های موسیقی مثل Spotify, Apple Music, Deezer",
  //   icon: "🎵",
  // },
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
];

export async function seedCategoriesOnStartup() {
  console.log("\n📦 Checking default categories...\n");

  for (const category of defaultCategories) {
    const [existing] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, category.slug))
      .limit(1);

    if (existing) {
      console.log(
        `  ⏭️  Category "${category.name}" already exists, skipping...`,
      );
      continue;
    }

    await db.insert(categoriesTable).values(category);
    console.log(`  ✅ Created category: ${category.icon} ${category.name}`);
  }

  console.log("\n✨ Categories check completed!");
}
