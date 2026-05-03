/**
 * Script to create an admin manually
 * Usage: bun src/scripts/create-admin.ts <USER_ID> <ROLE> [OPTIONS]
 *
 * Examples:
 * bun src/scripts/create-admin.ts 123456789 admin
 * bun src/scripts/create-admin.ts 123456789 support
 * bun src/scripts/create-admin.ts 123456789 admin --super
 */

import { db } from "../db/index.ts";
import { usersTable, adminsTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { AdminRoles, DefaultPermissions } from "../services/bot";

interface CreateAdminOptions {
  userId: number;
  role: string;
  isSuperAdmin?: boolean;
  displayName?: string;
  email?: string;
  phone?: string;
}

async function createAdmin(options: CreateAdminOptions) {
  console.log("🔧 Starting admin creation...\n");

  // بررسی اینکه user وجود دارد
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, options.userId))
    .limit(1);

  if (!user) {
    console.error(`❌ کاربر با ID ${options.userId} یافت نشد!`);
    console.log(
      "💡 ابتدا باید کاربر وارد بات شود یا دستی در دیتابیس ایجاد شود.",
    );
    process.exit(1);
  }

  console.log("✓ کاربر یافت شد:");
  console.log(`  - ID: ${user.id}`);
  console.log(`  - نام: ${user.firstName || "ندارد"}`);
  console.log(`  - نام کاربری: @${user.username || "ندارد"}`);
  console.log();

  // بررسی اینکه آیا قبلا ادمین شده
  const [existingAdmin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.userId, options.userId as any))
    .limit(1);

  if (existingAdmin) {
    console.error(`❌ این کاربر قبلاً به عنوان ادمین ثبت شده است!`);
    console.log(`  - نقش فعلی: ${existingAdmin.role}`);
    console.log(`  - وضعیت: ${existingAdmin.isActive ? "فعال" : "غیرفعال"}`);
    console.log(
      `  - SuperAdmin: ${existingAdmin.isSuperAdmin ? "بله" : "خیر"}`,
    );
    process.exit(1);
  }

  // تعیین نام نمایشی
  const displayName =
    options.displayName ||
    user.firstName ||
    user.username ||
    `کاربر ${user.id}`;

  // تعیین allowedSections بر اساس role
  const role = options.role as keyof typeof AdminRoles;
  const allowedSections =
    DefaultPermissions[role] || DefaultPermissions.support;

  console.log("📝 اطلاعات ادمین جدید:");
  console.log(`  - نام نمایشی: ${displayName}`);
  console.log(`  - نقش: ${options.role}`);
  console.log(`  - SuperAdmin: ${options.isSuperAdmin ? "بله" : "خیر"}`);
  console.log(`  - دسترسی‌ها: ${allowedSections.length} بخش`);
  if (options.email) console.log(`  - ایمیل: ${options.email}`);
  if (options.phone) console.log(`  - تلفن: ${options.phone}`);
  console.log();

  // به روزرسانی role در جدول users
  await db
    .update(usersTable)
    .set({ role: options.role })
    .where(eq(usersTable.id, options.userId));

  console.log("✓ جدول users به‌روزرسانی شد");

  // ساخت رکورد ادمین
  const [newAdmin] = await db
    .insert(adminsTable)
    .values({
      userId: options.userId as any,
      displayName: displayName,
      email: options.email,
      phone: options.phone,
      role: options.role,
      isActive: true,
      isSuperAdmin: options.isSuperAdmin || false,
      permissions: {},
      allowedSections: allowedSections,
      restrictedIPs: null,
      lastLoginAt: null,
      lastActivityAt: null,
      loginCount: 0,
      notes: "ایجاد شده توسط script",
      createdBy: null,
    })
    .returning();

  console.log("✓ رکورد ادمین ایجاد شد");
  console.log();
  console.log("✅ ادمین با موفقیت ایجاد شد!");
  console.log(`  - Admin ID: ${newAdmin.id}`);
  console.log(`  - User ID: ${newAdmin.userId}`);
  console.log(`  - نقش: ${newAdmin.role}`);
  console.log();
  console.log("🎉 حالا این کاربر می‌تواند به بخش‌های ادمین دسترسی داشته باشد.");

  process.exit(0);
}

// پارس کردن arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("❌ استفاده نادرست!\n");
  console.log("📖 راهنما:");
  console.log("  bun src/scripts/create-admin.ts <USER_ID> <ROLE> [OPTIONS]\n");
  console.log("نقش‌های موجود:");
  console.log("  - admin     : دسترسی کامل به همه بخش‌ها");
  console.log("  - support   : دسترسی به تیکت‌ها و سفارش‌ها");
  console.log("  - manager   : مدیریت محصولات و سفارش‌ها");
  console.log("  - operator  : فقط مشاهده\n");
  console.log("آپشن‌های اضافی:");
  console.log("  --super             : ساختن SuperAdmin");
  console.log('  --name "نام"        : تعیین نام نمایشی');
  console.log("  --email EMAIL       : تعیین ایمیل");
  console.log("  --phone PHONE       : تعیین شماره تماس\n");
  console.log("مثال‌ها:");
  console.log("  bun src/scripts/create-admin.ts 123456789 admin");
  console.log("  bun src/scripts/create-admin.ts 123456789 admin --super");
  console.log(
    '  bun src/scripts/create-admin.ts 123456789 support --name "محمد" --email admin@example.com',
  );
  process.exit(1);
}

const userId = parseInt(args[0]);
const role = args[1];

if (isNaN(userId)) {
  console.error("❌ USER_ID باید یک عدد باشد!");
  process.exit(1);
}

const validRoles = Object.values(AdminRoles);
if (!validRoles.includes(role as any)) {
  console.error(`❌ نقش نامعتبر: ${role}`);
  console.log(`نقش‌های معتبر: ${validRoles.join(", ")}`);
  process.exit(1);
}

// پارس کردن options
const options: CreateAdminOptions = {
  userId,
  role,
};

for (let i = 2; i < args.length; i++) {
  const arg = args[i];

  if (arg === "--super") {
    options.isSuperAdmin = true;
  } else if (arg === "--name" && args[i + 1]) {
    options.displayName = args[i + 1];
    i++;
  } else if (arg === "--email" && args[i + 1]) {
    options.email = args[i + 1];
    i++;
  } else if (arg === "--phone" && args[i + 1]) {
    options.phone = args[i + 1];
    i++;
  }
}

// اجرا
createAdmin(options).catch((error) => {
  console.error("❌ خطا در ایجاد ادمین:", error);
  process.exit(1);
});
