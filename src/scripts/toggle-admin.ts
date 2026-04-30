/**
 * Script to toggle admin status (activate/deactivate)
 * Usage: bun src/scripts/toggle-admin.ts <ADMIN_ID> <STATUS>
 *
 * Examples:
 * bun src/scripts/toggle-admin.ts 1 disable
 * bun src/scripts/toggle-admin.ts 1 enable
 */

import { db } from "../db/index.ts";
import { adminsTable, usersTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

async function toggleAdmin(adminId: number, enable: boolean) {
  console.log(`🔧 ${enable ? "فعال" : "غیرفعال"} کردن ادمین...\n`);

  // پیدا کردن ادمین
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.id, adminId))
    .limit(1);

  if (!admin) {
    console.error(`❌ ادمین با ID ${adminId} یافت نشد!`);
    process.exit(1);
  }

  // پیدا کردن user
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, admin.userId as any))
    .limit(1);

  console.log("✓ ادمین یافت شد:");
  console.log(`  - Admin ID: ${admin.id}`);
  console.log(`  - نام: ${admin.displayName}`);
  console.log(`  - نقش: ${admin.role}`);
  console.log(`  - وضعیت فعلی: ${admin.isActive ? "فعال" : "غیرفعال"}`);
  if (user) {
    console.log(`  - نام کاربری: @${user.username || "ندارد"}`);
  }
  console.log();

  // بررسی اینکه آیا وضعیت قبلا همین بوده
  if (admin.isActive === enable) {
    console.log(
      `⚠️  ادمین قبلاً ${enable ? "فعال" : "غیرفعال"} است. نیازی به تغییر نیست.`,
    );
    process.exit(0);
  }

  // به‌روزرسانی وضعیت
  const [updatedAdmin] = await db
    .update(adminsTable)
    .set({
      isActive: enable,
      updatedAt: new Date(),
    })
    .where(eq(adminsTable.id, adminId))
    .returning();

  console.log(`✅ ادمین با موفقیت ${enable ? "فعال" : "غیرفعال"} شد!`);
  console.log(`  - وضعیت جدید: ${updatedAdmin.isActive ? "فعال" : "غیرفعال"}`);
  console.log();

  if (!enable) {
    console.log(
      "⚠️  توجه: این ادمین دیگر نمی‌تواند به بخش‌های ادمین دسترسی داشته باشد.",
    );
  } else {
    console.log(
      "✅ این ادمین حالا می‌تواند دوباره به بخش‌های ادمین دسترسی داشته باشد.",
    );
  }

  process.exit(0);
}

// پارس کردن arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("❌ استفاده نادرست!\n");
  console.log("📖 راهنما:");
  console.log("  bun src/scripts/toggle-admin.ts <ADMIN_ID> <STATUS>\n");
  console.log("وضعیت‌های موجود:");
  console.log("  - enable, active, on     : فعال کردن");
  console.log("  - disable, inactive, off : غیرفعال کردن\n");
  console.log("مثال‌ها:");
  console.log("  bun src/scripts/toggle-admin.ts 1 disable");
  console.log("  bun src/scripts/toggle-admin.ts 1 enable");
  process.exit(1);
}

const adminId = parseInt(args[0]);
const statusArg = args[1].toLowerCase();

if (isNaN(adminId)) {
  console.error("❌ ADMIN_ID باید یک عدد باشد!");
  process.exit(1);
}

let enable: boolean;
if (["enable", "active", "on", "1", "true"].includes(statusArg)) {
  enable = true;
} else if (["disable", "inactive", "off", "0", "false"].includes(statusArg)) {
  enable = false;
} else {
  console.error(`❌ وضعیت نامعتبر: ${statusArg}`);
  console.log("استفاده کنید از: enable, disable, active, inactive, on, off");
  process.exit(1);
}

// اجرا
toggleAdmin(adminId, enable).catch((error) => {
  console.error("❌ خطا در تغییر وضعیت ادمین:", error);
  process.exit(1);
});
