/**
 * Script to list all admins
 * Usage: bun src/scripts/list-admins.ts [OPTIONS]
 *
 * Examples:
 * bun src/scripts/list-admins.ts
 * bun src/scripts/list-admins.ts --role admin
 * bun src/scripts/list-admins.ts --inactive
 */

import { db } from "../db/index.ts";
import { adminsTable, usersTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

async function listAdmins(options: { role?: string; showInactive?: boolean }) {

  let query = db
    .select({
      admin: adminsTable,
      user: usersTable,
    })
    .from(adminsTable)
    .leftJoin(usersTable, eq(adminsTable.userId, usersTable.id));

  const admins = await query;

  if (admins.length === 0) {
    process.exit(0);
  }


  let filteredAdmins = admins;

  if (options.role) {
    filteredAdmins = filteredAdmins.filter(
      (a) => a.admin.role === options.role,
    );
  }

  if (!options.showInactive) {
    filteredAdmins = filteredAdmins.filter((a) => a.admin.isActive);
  }

  if (filteredAdmins.length === 0) {
    process.exit(0);
  }

  const totalCount = admins.length;
  const activeCount = admins.filter((a) => a.admin.isActive).length;
  const superAdminCount = admins.filter((a) => a.admin.isSuperAdmin).length;

  // console.log(`📝 لیست ادمین‌ها (${filteredAdmins.length} نفر):\n`);
  // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const { admin, user } of filteredAdmins) {
    const status = admin.isActive ? "✅ فعال" : "❌ غیرفعال";
    const superBadge = admin.isSuperAdmin ? " 👑 SuperAdmin" : "";

    // console.log(`${status}${superBadge}`);
    // console.log(`  🆔 Admin ID: ${admin.id}`);
    // console.log(`  👤 User ID: ${admin.userId}`);
    // console.log(`  📛 نام: ${admin.displayName || "ندارد"}`);

    // if (user) {
      // console.log(`  🔤 نام کاربری: @${user.username || "ندارد"}`);
      // console.log(
      //   `  👨 نام کامل: ${user.firstName || ""} ${user.lastName || ""}`,
      // );
    // }

    // console.log(`  🎭 نقش: ${admin.role}`);

    // if (admin.email) console.log(`  📧 ایمیل: ${admin.email}`);
    // if (admin.phone) console.log(`  📱 تلفن: ${admin.phone}`);

    const allowedSections = admin.allowedSections as string[] | null;
    // if (allowedSections && allowedSections.length > 0) {
    //   console.log(`  🔓 دسترسی‌ها: ${allowedSections.join(", ")}`);
    // }

    if (admin.lastLoginAt) {
      const lastLogin = new Date(admin.lastLoginAt);
      console.log(`  🕐 آخرین ورود: ${lastLogin.toLocaleString("fa-IR")}`);
    }

    if (admin.loginCount) {
      console.log(`  🔢 تعداد ورود: ${admin.loginCount}`);
    }

    if (admin.notes) {
      console.log(`  📝 یادداشت: ${admin.notes}`);
    }

    const createdAt = new Date(admin.createdAt!);
    console.log(`  📅 تاریخ ایجاد: ${createdAt.toLocaleString("fa-IR")}`);

    console.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    );
  }

  const roleStats: Record<string, number> = {};
  for (const { admin } of admins) {
    roleStats[admin.role] = (roleStats[admin.role] || 0) + 1;
  }

  console.log("📊 تعداد بر اساس نقش:");
  for (const [role, count] of Object.entries(roleStats)) {
    console.log(`  - ${role}: ${count} نفر`);
  }

  process.exit(0);
}

// پارس کردن arguments
const args = process.argv.slice(2);
const options: { role?: string; showInactive?: boolean } = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === "--role" && args[i + 1]) {
    options.role = args[i + 1];
    i++;
  } else if (arg === "--inactive" || arg === "--all") {
    options.showInactive = true;
  } else if (arg === "--help" || arg === "-h") {
    console.log("📖 راهنمای استفاده:\n");
    console.log("  bun src/scripts/list-admins.ts [OPTIONS]\n");
    console.log("آپشن‌ها:");
    console.log(
      "  --role ROLE    : فیلتر بر اساس نقش (super_admin, admin, support)",
    );
    console.log("  --inactive     : نمایش ادمین‌های غیرفعال هم");
    console.log("  --all          : نمایش همه (فعال و غیرفعال)");
    console.log("  --help, -h     : نمایش این راهنما\n");
    console.log("مثال‌ها:");
    console.log("  bun src/scripts/list-admins.ts");
    console.log("  bun src/scripts/list-admins.ts --role admin");
    console.log("  bun src/scripts/list-admins.ts --inactive");
    process.exit(0);
  }
}

// اجرا
listAdmins(options).catch((error) => {
  console.error("❌ خطا در دریافت لیست ادمین‌ها:", error);
  process.exit(1);
});
