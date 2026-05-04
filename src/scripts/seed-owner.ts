/**
 * Script: seed-owner.ts
 * ثبت مالک ربات به عنوان کاربر + SuperAdmin در دیتابیس
 *
 * Usage: bun src/scripts/seed-owner.ts
 */

import { db } from "../db/index.ts";
import { usersTable, adminsTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { config } from "../config.ts";
import { AdminSections } from "../services/bot/admin/Admin/Section.ts";

async function seedOwner() {
  const ownerId = config.OWNER_ID;
  console.log(`\n🔧 Seeding owner (ID: ${ownerId})...\n`);

  // ─── 1. Upsert کاربر در جدول users ───────────────────────────
  const [user] = await db
    .insert(usersTable)
    .values({
      id: ownerId,
      username: null,
      firstName: "Owner",
      lastName: null,
      languageCode: "fa",
      role: "super_admin",
      referralCode: `OWNER${ownerId}`,
      referredBy: null,
    })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: { role: "super_admin", updatedAt: new Date() },
    })
    .returning();

  console.log(`✓ users table — ID: ${user.id}, role: ${user.role}`);

  // ─── 2. Upsert ادمین در جدول admins ──────────────────────────
  const existing = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.userId, ownerId as any))
    .limit(1);

  const allSections = Object.values(AdminSections);

  const DEFAULT_PASSWORD = "1234";

  if (existing.length > 0) {
    // اگه رمز نداره، رمز دیفالت بزار
    const needsPassword = !existing[0].passwordHash;
    const passwordHash = needsPassword
      ? await Bun.password.hash(DEFAULT_PASSWORD)
      : undefined;

    const updateData: Record<string, any> = {
      role: "super_admin",
      isActive: true,
      isSuperAdmin: true,
      allowedSections: allSections,
      permissions: {},
      displayName: "Owner",
      notes: "مالک ربات — ایجاد شده توسط seed-owner.ts",
      updatedAt: new Date(),
    };
    if (passwordHash) updateData.passwordHash = passwordHash;

    const [updated] = await db
      .update(adminsTable)
      .set(updateData)
      .where(eq(adminsTable.userId, ownerId as any))
      .returning();

    console.log(
      `✓ admins table — Admin ID: ${updated.id}, isSuperAdmin: ${updated.isSuperAdmin}`,
    );
    if (needsPassword) {
      console.log(`✓ رمز دیفالت "${DEFAULT_PASSWORD}" تنظیم شد`);
    } else {
      console.log(`✓ رمز موجود حفظ شد`);
    }
  } else {
    // ایجاد رکورد جدید با رمز دیفالت
    const passwordHash = await Bun.password.hash(DEFAULT_PASSWORD);

    const [newAdmin] = await db
      .insert(adminsTable)
      .values({
        userId: ownerId as any,
        displayName: "Owner",
        role: "super_admin",
        isActive: true,
        isSuperAdmin: true,
        permissions: {},
        allowedSections: allSections,
        restrictedIPs: null,
        loginCount: 0,
        passwordHash,
        notes: "مالک ربات — ایجاد شده توسط seed-owner.ts",
        createdBy: null,
      })
      .returning();

    console.log(
      `✓ admins table — Admin ID: ${newAdmin.id}, isSuperAdmin: ${newAdmin.isSuperAdmin}`,
    );
    console.log(`✓ رمز دیفالت "${DEFAULT_PASSWORD}" تنظیم شد`);
  }

  console.log("\n✅ Owner seeded successfully!");
  console.log(`   Telegram ID : ${ownerId}`);
  console.log(`   Role        : super_admin (users + admins)`);
  console.log(`   Sections    : ALL (${allSections.length})\n`);
}

/**
 * برای استفاده در هنگام استارت ربات — در صورت خطا فقط لاگ می‌کند
 */
export async function seedOwnerOnStartup(): Promise<void> {
  try {
    await seedOwner();
  } catch (err) {
    console.error("[STARTUP] Failed to seed owner:", err);
  }
}

// اجرای مستقیم (bun src/scripts/seed-owner.ts)
if (
  import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, "/") ||
  process.argv[1]?.endsWith("seed-owner.ts")
) {
  seedOwner()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed owner:", err);
      process.exit(1);
    });
}
