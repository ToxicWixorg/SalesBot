import { db } from "../db/index.ts";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Running migration 0017: add regions column to products...");
  await db.execute(
    sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS regions jsonb DEFAULT '[]'::jsonb`,
  );
  console.log("✅ Migration 0017 applied successfully.");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
