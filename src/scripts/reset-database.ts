import { db } from "../db/index.ts";
import { sql } from "drizzle-orm";

/**
 * Reset Database - Clear all user data for testing
 *
 * This script will truncate all tables while keeping the structure intact.
 * Use this in development/testing environments only!
 */
async function resetDatabase() {
  console.log("🔄 Starting database reset...");

  try {
    // Disable foreign key checks temporarily
    await db.execute(sql`SET session_replication_role = 'replica'`);

    // Truncate main table - CASCADE will automatically clear related tables
    console.log("🗑️  Clearing all user data (CASCADE mode)...");
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);

    console.log("   ✓ Users cleared");
    console.log("   ✓ Orders cleared");
    console.log("   ✓ Wallet transactions cleared");
    console.log("   ✓ Referral rewards cleared");
    console.log("   ✓ Discount usage cleared");
    console.log("   ✓ All related data cleared");

    // Re-enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin'`);

    console.log("\n✅ Database reset completed successfully!");
    console.log("💡 You can now test with fresh accounts.");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the reset
resetDatabase();
