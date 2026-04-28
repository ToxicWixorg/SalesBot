# 🗄️ Database Schema Documentation

## بخش اول: راهنمای تنظیم دیتابیس

### 1️⃣ شروع سرویس‌های Docker

```bash
docker compose -f docker-compose.dev.yml up -d
```

✅ این دستور شامل:

- PostgreSQL
- Redis
- PgAdmin (اختیاری)

### 2️⃣ چک کردن اتصال

```bash
# چک کنید که PostgreSQL به درستی اجرا می‌شود
psql -h localhost -U bot -d bot -W
```

### 3️⃣ اعمال Migrations

```bash
# ایجاد و اعمال migrations
bun run migrate

# یا
bunx drizzle-kit migrate
```

### 4️⃣ Push Schema به Database

```bash
bunx drizzle-kit push
```

---

## 📋 Schema Structure

### 👤 **USERS** - جدول کاربران

```
id (bigint) - Primary Key
├── username: نام کاربری تلگرام
├── firstName / lastName: نام و نام خانوادگی
├── languageCode: زبان (en, fa, ru)
├── role: نقش (customer, support, admin)
├── isBlocked: آیا مسدود است
├── walletBalance: موجودی کیف پول
├── referralCode: کد دعوت اختصاصی
├── referredBy: کاربری که این کاربر را معرفی کرد
├── createdAt / updatedAt
```

---

### 🏪 **PRODUCTS** - جدول محصولات

#### Categories

```
id (serial)
├── name: نام دسته (Spotify, ChatGPT, ...)
├── slug: URL-friendly نام
├── icon: emoji یا URL
```

#### Products

```
id (serial)
├── name: نام محصول
├── slug: URL slug
├── description: توضیح
├── image: تصویر محصول
├── categoryId: دسته
├── deliveryType: نوع تحویل (automatic, manual, custom_schedule, invite, code, family_join, renewable, reservation)
├── requires: Email, OTP, Login, Region
├── isRenewable: قابل تمدید
├── canUnlockPerks: می‌تواند Perk unlock کند
├── stock: موجودی
├── isActive: فعال/غیرفعال
```

#### Product Plans

```
id (serial)
├── productId: ارجاع به محصول
├── name: نام پلن (1 Month, 1 Year, ...)
├── description: توضیح
├── price: قیمت
├── duration: مدت دوره (روز)
├── durationUnit: واحد (day, month, year)
├── order: ترتیب نمایش
├── isActive: فعال/غیرفعال
```

---

### 📦 **ORDERS** - جدول سفارش‌ها

```
id (serial)
├── userId: مرجع به کاربر
├── productId / planId: محصول و پلن
├── status: وضعیت سفارش
│   ├── pending_payment: منتظر پرداخت
│   ├── paid: پرداخت شده
│   ├── pending_admin: منتظر تأیید ادمین
│   ├── waiting_schedule: منتظر انتخاب زمان
│   ├── scheduled: زمان‌بندی شده
│   ├── in_progress: در حال انجام
│   ├── completed: تکمیل شده
├── totalPrice / finalPrice: قیمت
├── discountAmount / walletUsed: تخفیف و استفاده کیف پول
├── paymentMethod: روش پرداخت (card, zarinpal, crypto, wallet)
├── paymentId: ID تراکنش داخلی
├── discountCodeId: کد تخفیف استفاده شده
├── scheduledTime: زمان نیروی برای سفارش Custom
├── delivery: JSON داده تحویل (email: "...", code: "...", link: "...")
├── deliveredAt: زمان تحویل
```

---

### 💳 **SUBSCRIPTIONS** - اشتراک‌های تمدیدی

```
id (serial)
├── userId / orderId / productId: مرجع‌ها
├── startDate / endDate: تاریخ شروع و پایان
├── renewalDate: تاریخ موعد تمدید
├── status: active, expiring_soon, expired, cancelled
├── reminderSent: یادآوری ارسال شده؟
```

---

### 💰 **WALLET_TRANSACTIONS** - تراکنش‌های کیف پول

```
id (serial)
├── userId / orderId: مرجع
├── amount / type: مبلغ و نوع (credit/debit)
├── source: منبع (purchase, recharge, refund, referral, reward, perk)
├── description: توضیح
├── balanceBefore / balanceAfter: موجودی قبل و بعد
```

---

### 🎫 **TICKETS** - تیکت‌های پشتیبانی

```
Tickets:
├── id (serial)
├── userId / orderId: مرجع
├── title / description: عنوان و توضیح
├── status: open, waiting_user, waiting_support, closed, blocked
├── priority: low, normal, high, urgent
├── assignedTo: تخصیص به پشتیبانی
├── createdAt / updatedAt / closedAt

Ticket Messages:
├── id (serial)
├── ticketId: مرجع تیکت
├── userId: فرستنده
├── message: متن پیام
├── attachments: فایل ضمائم (JSON)
```

---

### 🎁 **DISCOUNT_CODES** - کدهای تخفیف

```
Discount Codes:
├── id (serial)
├── code: کد منحصراً‌فرد (CODE123)
├── type: درصدی یا ثابت (percentage, fixed)
├── value: مبلغ یا درصد
├── maxDiscount: حداکثر تخفیف (برای درصدی)
├── minOrderAmount: حداقل مبلغ سفارش
├── maxUses: تعداد کل استفاده
├── maxUsesPerUser: استفاده هر کاربر
├── productIds: محصولات مخصوص (JSON array)
├── userIds: کاربران مخصوص (JSON array)
├── expiresAt: تاریخ انقضا
├── isActive: فعال/غیرفعال

Discount Usage:
├── id (serial)
├── codeId / userId / orderId: مرجع
├── discountAmount: میزان تخفیف اعمال شده
├── usedAt: زمان استفاده
```

---

### 👥 **REFERRAL** - سیستم دعوت

```
Referral Rewards:
├── id (serial)
├── referrerId: کاربری که دعوت کرد
├── referredUserId: کاربری که دعوت شد
├── rewardType: نوع پاداش (wallet_credit, discount)
├── rewardValue: مبلغ پاداش
├── status: pending, awarded, cancelled
├── awardedAt: زمان اعطاء پاداش
```

---

### 🎯 **PERKS** - سیستم جوایز

```
Perks Tasks:
├── id (serial)
├── title / description: عنوان و توضیح تسک
├── type: نوع تسک
│   ├── join_channel: عضویت در کانال
│   ├── invite_friend: دعوت دوست
│   ├── instagram_story: استوری اینستاگرام
│   ├── tweet: توییت
│   ├── review: رایتینگ
│   ├── first_purchase: اولین خرید
│   ├── renew_subscription: تمدید اشتراک
│   ├── complete_profile: تکمیل پروفایل
├── taskData: اطلاعات اضافی (JSON)
├── rewardType: نوع پاداش (wallet_credit, discount, free_product)
├── rewardValue: مبلغ پاداش
├── maxRewards: حداکثر پاداش
├── isActive / expiresAt: فعال/غیرفعال و انقضا

User Perks:
├── id (serial)
├── userId / taskId: مرجع
├── status: pending, completed, verified, claimed
├── verificationData: اطلاعات تأیید
├── completedAt / claimedAt: زمان تکمیل و دریافت
```

---

### ⏰ **SCHEDULES** - زمان‌بندی سفارش‌های Custom

```
id (serial)
├── orderId: مرجع سفارش
├── date: تاریخ (YYYY-MM-DD)
├── timeSlot: بازه زمانی (09:00-10:00)
├── capacity: ظرفیت
├── currentBookings: رزروهای فعلی
├── reminderSent: یادآوری ارسال شده؟
├── status: available, full, in_progress, completed
├── completedAt: زمان تکمیل
```

---

### 🔔 **STOCK_NOTIFICATIONS** - درخواست اطلاع‌دهی موجودی

```
id (serial)
├── userId / productId: مرجع
├── isActive: درخواست فعال؟
├── notificationSent: پیام ارسال شد؟
├── notificationSentAt: زمان ارسال
```

---

### 🔐 **INVITES** - پیگیری Invite‌ها

```
id (serial)
├── orderId / userId: مرجع
├── email: ایمیل دعوت‌شونده
├── status: pending, sent, accepted, rejected
├── sentAt: زمان ارسال دعوت
├── acceptedAt: زمان پذیرش دعوت
```

---

### 📝 **ADMIN_LOGS** - لاگ عملیات ادمی‌ن

```
id (serial)
├── adminId: ادمینی که عمل انجام داد
├── action: نوع عمل (create, update, delete, manual_delivery, broadcast)
├── entityType: نوع مجموع (product, order, user, discount)
├── entityId: ID مجموع
├── changes: تغییرات (JSON)
├── ipAddress: آدرس IP
├── description: توضیح
```

---

## 🔗 Relationships (روابط)

```
Users ──┬──→ Orders
        ├──→ Subscriptions
        ├──→ Wallet Transactions
        ├──→ Tickets
        ├──→ Stock Notifications
        ├──→ User Perks
        ├──→ Refer Rewards (as Referrer)

Orders ──┬──→ Products
         ├──→ Product Plans
         ├──→ Subscriptions
         ├──→ Tickets
         ├──→ Discount Usage
         ├──→ Schedules
         └──→ Invites

Products ──┬──→ Categories
           ├──→ Product Plans
           └──→ Stock Notifications

Discount Codes ──→ Discount Usage

Perks Tasks ──→ User Perks
```

---

## 🛡️ Indexes (برای بهینه‌سازی)

✅ تمام جداول دارای indexهای لازم برای:

- جستجو سریع کاربران
- فیلتر کردن سفارش‌ها حسب وضعیت
- نمایش تسک‌های Perks
- پیگیری تیکت‌ها
- و غیره

---

## 🚀 Next Steps

1. ✅ Database migrations تولید شدند
2. ⏳ Push to Database
3. ⏳ ایجاد Repository Pattern برای دسترسی DB
4. ⏳ ایجاد Services برای Business Logic
5. ⏳ Bot Commands و Handlers

---

## 📚 مراجع

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [GramIO Docs](https://gramio.dev/)
