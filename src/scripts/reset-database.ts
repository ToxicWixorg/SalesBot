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

    // Truncate all tables
    console.log("🗑️  Clearing users table...");
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);

    console.log("🗑️  Clearing orders table...");
    await db.execute(sql`TRUNCATE TABLE orders CASCADE`);

    console.log("🗑️  Clearing wallet_transactions table...");
    await db.execute(sql`TRUNCATE TABLE wallet_transactions CASCADE`);

    console.log("🗑️  Clearing referral_rewards table...");
    await db.execute(sql`TRUNCATE TABLE referral_rewards CASCADE`);

    console.log("🗑️  Clearing discount_usage table...");
    await db.execute(sql`TRUNCATE TABLE discount_usage CASCADE`);

    console.log("🗑️  Clearing admin_logs table...");
    await db.execute(sql`TRUNCATE TABLE admin_logs CASCADE`);

    console.log("🗑️  Clearing notifications table...");
    await db.execute(sql`TRUNCATE TABLE notifications CASCADE`);

    // Re-enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin'`);

    console.log("✅ Database reset completed successfully!");
    console.log("💡 You can now test with fresh accounts.");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the reset
resetDatabase();
