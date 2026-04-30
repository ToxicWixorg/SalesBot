# 🔐 سیستم مدیریت ادمین‌ها

این مستند راهنمای کامل سیستم مدیریت ادمین‌ها را شرح می‌دهد.

## 📋 فهرست مطالب

- [نقش‌ها و دسترسی‌ها](#نقشها-و-دسترسیها)
- [ساختار دیتابیس](#ساختار-دیتابیس)
- [نصب و راه‌اندازی](#نصب-و-راهاندازی)
- [مدیریت ادمین‌ها (دستی)](#مدیریت-ادمینها-دستی)
- [استفاده در کد](#استفاده-در-کد)
- [لاگ عملیات](#لاگ-عملیات)
- [سیستم Session (برای TMA)](#سیستم-session-برای-tma)

---

## 🎭 نقش‌ها و دسترسی‌ها

### نقش‌های موجود

| نقش             | توضیح     | دسترسی‌ها                                       |
| --------------- | --------- | ----------------------------------------------- |
| **admin** 👑    | مدیر کامل | دسترسی به همه بخش‌ها                            |
| **support** 🎧  | پشتیبانی  | تیکت‌ها، سفارش‌ها، کاربران                      |
| **manager** 📊  | مدیر      | محصولات، سفارش‌ها، تخفیف‌ها، زمان‌بندی، کاربران |
| **operator** 👤 | اپراتور   | سفارش‌ها، تیکت‌ها، محصولات (فقط مشاهده)         |

### بخش‌های قابل دسترسی

```typescript
AdminSections = {
  PRODUCTS: "products", // محصولات
  ORDERS: "orders", // سفارش‌ها
  TICKETS: "tickets", // تیکت‌ها
  USERS: "users", // کاربران
  WALLET: "wallet", // کیف پول
  DISCOUNTS: "discounts", // تخفیف‌ها
  REFERRALS: "referrals", // ریفرال
  PERKS: "perks", // Perks
  SCHEDULES: "schedules", // زمان‌بندی
  BROADCAST: "broadcast", // ارسال همگانی
  SETTINGS: "settings", // تنظیمات
  ADMINS: "admins", // مدیریت ادمین‌ها
  LOGS: "logs", // لاگ‌ها
};
```

---

## 🗄️ ساختار دیتابیس

### جدول `admins`

```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  phone TEXT,

  role TEXT DEFAULT 'support' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_super_admin BOOLEAN DEFAULT false,

  permissions JSONB DEFAULT '{}',
  allowed_sections JSONB,
  restricted_ips JSONB,

  last_login_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by BIGINT
);
```

### جدول `admin_logs`

```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  user_id BIGINT NOT NULL,

  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,

  changes JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  description TEXT,

  severity TEXT DEFAULT 'info',
  is_success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);
```

### جدول `admin_sessions` (برای TMA)

```sql
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,

  ip_address TEXT,
  user_agent TEXT,

  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP,
  is_valid BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 نصب و راه‌اندازی

### 1. اجرای Migration

```bash
# اجرای migration جدید
cd bot
npm run migrate
```

### 2. ایجاد ادمین اول (SuperAdmin)

```bash
# ابتدا باید user_id خودتان را بدانید
# برای این کار یک بار وارد بات شوید و از /start استفاده کنید

# سپس ادمین ایجاد کنید:
bun src/scripts/create-admin.ts YOUR_USER_ID admin --super
```

مثال:

```bash
bun src/scripts/create-admin.ts 123456789 admin --super
```

---

## 🛠️ مدیریت ادمین‌ها (دستی)

### ایجاد ادمین جدید

```bash
# ساده
bun src/scripts/create-admin.ts <USER_ID> <ROLE>

# با جزئیات کامل
bun src/scripts/create-admin.ts <USER_ID> <ROLE> --super --name "نام" --email "email@example.com"
```

**مثال‌ها:**

```bash
# ادمین عادی
bun src/scripts/create-admin.ts 123456789 admin

# SuperAdmin
bun src/scripts/create-admin.ts 123456789 admin --super

# پشتیبان با اطلاعات کامل
bun src/scripts/create-admin.ts 987654321 support --name "محمد" --email "support@bot.com"

# مدیر
bun src/scripts/create-admin.ts 555555555 manager
```

### لیست کردن ادمین‌ها

```bash
# همه ادمین‌های فعال
bun src/scripts/list-admins.ts

# فیلتر بر اساس نقش
bun src/scripts/list-admins.ts --role admin
bun src/scripts/list-admins.ts --role support

# نمایش همه (فعال و غیرفعال)
bun src/scripts/list-admins.ts --inactive
```

### غیرفعال/فعال کردن ادمین

```bash
# غیرفعال کردن
bun src/scripts/toggle-admin.ts <ADMIN_ID> disable

# فعال کردن
bun src/scripts/toggle-admin.ts <ADMIN_ID> enable
```

**مثال:**

```bash
# غیرفعال کردن ادمین با ID = 2
bun src/scripts/toggle-admin.ts 2 disable

# فعال کردن دوباره
bun src/scripts/toggle-admin.ts 2 enable
```

---

## 💻 استفاده در کد

### بررسی دسترسی ادمین

```typescript
import { AdminService, AdminSections } from "./services/admin.ts";

// چک کردن اینکه آیا کاربر ادمین است
const isAdmin = await AdminService.isAdmin(userId);

// چک کردن SuperAdmin
const isSuperAdmin = await AdminService.isSuperAdmin(userId);

// چک کردن دسترسی به یک بخش خاص
const canAccessProducts = await AdminService.hasPermission(
  userId,
  AdminSections.PRODUCTS,
);

// چک کردن دسترسی به چند بخش (حداقل یکی)
const canAccessTicketsOrOrders = await AdminService.hasAnyPermission(userId, [
  AdminSections.TICKETS,
  AdminSections.ORDERS,
]);

// چک کردن دسترسی به همه بخش‌ها
const hasAllAccess = await AdminService.hasAllPermissions(userId, [
  AdminSections.PRODUCTS,
  AdminSections.ORDERS,
]);
```

### استفاده از Middleware

```typescript
import {
  requireAdmin,
  requirePermission,
  requireSuperAdmin,
} from "./services/admin.ts";

// فقط ادمین‌ها
bot.command("admin", requireAdmin(), async (ctx) => {
  await ctx.reply("شما ادمین هستید!");
});

// فقط با دسترسی به بخش محصولات
bot.command(
  "products",
  requirePermission(AdminSections.PRODUCTS),
  async (ctx) => {
    await ctx.reply("لیست محصولات...");
  },
);

// فقط SuperAdmin
bot.command("settings", requireSuperAdmin(), async (ctx) => {
  await ctx.reply("تنظیمات سیستم...");
});
```

### ثبت لاگ عملیات ادمین

```typescript
import { AdminService } from "./services/admin.ts";

// ثبت لاگ ساده
await AdminService.logAction({
  userId: ctx.from.id,
  action: "create",
  entityType: "product",
  entityId: product.id.toString(),
  description: "محصول جدید ایجاد شد",
});

// ثبت لاگ کامل با تغییرات
await AdminService.logAction({
  userId: ctx.from.id,
  action: "update",
  entityType: "order",
  entityId: orderId.toString(),
  changes: {
    status: { from: "pending", to: "completed" },
    deliveredAt: { from: null, to: new Date() },
  },
  description: "وضعیت سفارش تغییر کرد",
  severity: "info",
  metadata: {
    orderNumber: orderNumber,
    customer: customerId,
  },
});

// ثبت خطا
await AdminService.logAction({
  userId: ctx.from.id,
  action: "delete",
  entityType: "product",
  entityId: productId.toString(),
  isSuccess: false,
  errorMessage: error.message,
  severity: "critical",
});
```

### مدیریت ادمین‌ها در کد

```typescript
import { AdminService, AdminRoles, AdminSections } from "./services/admin.ts";

// ایجاد ادمین جدید
const newAdmin = await AdminService.createAdmin({
  userId: 123456789,
  role: AdminRoles.SUPPORT,
  displayName: "محمد",
  email: "support@bot.com",
  createdBy: ctx.from.id, // ID ادمینی که این ادمین را می‌سازد
});

// تغییر نقش ادمین
await AdminService.changeRole(adminId, AdminRoles.MANAGER, ctx.from.id);

// غیرفعال کردن ادمین
await AdminService.toggleStatus(adminId, false, ctx.from.id);

// فعال کردن ادمین
await AdminService.toggleStatus(adminId, true, ctx.from.id);

// حذف ادمین
await AdminService.removeAdmin(adminId, ctx.from.id);

// دریافت لیست ادمین‌ها
const admins = await AdminService.getAdminsList({
  role: AdminRoles.SUPPORT,
  isActive: true,
});

// دریافت آمار
const stats = await AdminService.getStats();
// { total: 5, active: 4, byRole: { admin: 2, support: 3 } }
```

### دریافت اطلاعات ادمین

```typescript
import { AdminService, getSectionName, getRoleName } from "./services/admin.ts";

// دریافت اطلاعات ادمین
const admin = await AdminService.getAdmin(ctx.from.id);
if (!admin) {
  return ctx.reply("شما ادمین نیستید!");
}

// نمایش اطلاعات
await ctx.reply(`
👤 نام: ${admin.displayName}
🎭 نقش: ${getRoleName(admin.role as any)}
✅ وضعیت: ${admin.isActive ? "فعال" : "غیرفعال"}
${admin.isSuperAdmin ? "👑 SuperAdmin" : ""}
`);

// نمایش دسترسی‌ها
const sections = admin.allowedSections as string[];
const sectionNames = sections.map((s) => getSectionName(s as any));
await ctx.reply(`
🔓 دسترسی‌های شما:
${sectionNames.map((n) => `• ${n}`).join("\n")}
`);
```

---

## 📝 لاگ عملیات

تمام عملیات ادمین‌ها به صورت خودکار لاگ می‌شود:

### دریافت لاگ‌ها

```typescript
import { AdminLogRepository } from "./repositories/AdminRepository.ts";

// لاگ‌های یک ادمین خاص
const logs = await AdminLogRepository.getByAdminId(adminId, 50);

// لاگ‌های یک entity خاص
const orderLogs = await AdminLogRepository.getByEntity(
  "order",
  orderId.toString(),
  50,
);

// همه لاگ‌ها با فیلتر
const criticalLogs = await AdminLogRepository.getAll(
  {
    severity: "critical",
    action: "delete",
  },
  100,
);
```

### پاک کردن لاگ‌های قدیمی

```typescript
// حذف لاگ‌های قدیمی‌تر از 90 روز
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

await AdminLogRepository.deleteOlderThan(ninetyDaysAgo);
```

---

## 🔐 سیستم Session (برای TMA)

برای Telegram Mini App (TMA)، می‌توانید از سیستم session استفاده کنید:

```typescript
import { AdminSessionRepository } from "./repositories/AdminRepository.ts";
import { randomBytes } from "crypto";

// ایجاد session جدید
const token = randomBytes(32).toString("hex");
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24); // 24 ساعت

const session = await AdminSessionRepository.create({
  adminId: admin.id,
  token: token,
  ipAddress: request.ip,
  userAgent: request.headers["user-agent"],
  expiresAt: expiresAt,
});

// بررسی session
const validSession = await AdminSessionRepository.findByToken(token);
if (!validSession) {
  return { error: "Session expired or invalid" };
}

// به‌روزرسانی فعالیت
await AdminSessionRepository.updateActivity(session.id);

// logout (غیرفعال کردن session)
await AdminSessionRepository.invalidate(session.id);

// logout از همه دستگاه‌ها
await AdminSessionRepository.invalidateAllByAdmin(adminId);

// پاک کردن session‌های منقضی شده (در cron job)
await AdminSessionRepository.deleteExpired();
```

---

## 🎯 نکات مهم

### 1. SuperAdmin

- SuperAdmin به همه چیز دسترسی دارد
- محدودیت IP برای SuperAdmin هم اعمال می‌شود
- حداقل یک SuperAdmin همیشه باید وجود داشته باشد

### 2. محدودیت IP

```typescript
// تنظیم IP های مجاز برای یک ادمین
await AdminRepository.update(adminId, {
  restrictedIPs: ["192.168.1.1", "10.0.0.1"],
});

// چک کردن IP
const isAllowed = await AdminRepository.isIPAllowed(adminId, "192.168.1.1");
```

### 3. Permissions سفارشی

```typescript
// تنظیم permissions سفارشی
await AdminRepository.update(adminId, {
  permissions: {
    products: true,
    orders: true,
    tickets: false, // عدم دسترسی به تیکت‌ها
    users: false, // عدم دسترسی به کاربران
  },
});
```

### 4. بهترین روش‌ها (Best Practices)

```typescript
// ✅ درست: همیشه لاگ بگیرید
await AdminService.logAction({
  userId: ctx.from.id,
  action: "delete",
  entityType: "product",
  entityId: productId.toString(),
  description: "محصول حذف شد",
});

// ✅ درست: قبل از عملیات حساس، دسترسی را چک کنید
if (!(await AdminService.hasPermission(userId, AdminSections.PRODUCTS))) {
  return ctx.reply("شما دسترسی ندارید!");
}

// ✅ درست: از middleware استفاده کنید
bot.command("delete", requirePermission(AdminSections.PRODUCTS), handler);

// ❌ اشتباه: بدون چک دسترسی عملیات انجام ندهید
await deleteProduct(productId); // خطرناک!
```

---

## 📞 پشتیبانی

اگر سوالی دارید یا به مشکلی برخوردید:

1. مستندات را مطالعه کنید
2. کدهای نمونه را بررسی کنید
3. لاگ‌ها را چک کنید

---

## 🔄 به‌روزرسانی‌های آینده

- [ ] ایجاد Admin Panel تحت وب (TMA)
- [ ] سیستم نوتیفیکیشن برای ادمین‌ها
- [ ] گزارش‌گیری پیشرفته
- [ ] سیستم مجوزهای دقیق‌تر (fine-grained permissions)
- [ ] Two-Factor Authentication (2FA)

---

**تاریخ ایجاد:** 2026-04-30  
**نسخه:** 1.0.0
