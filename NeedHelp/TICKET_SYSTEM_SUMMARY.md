# 🎫 سیستم تیکتینگ Forum-Based - خلاصه تغییرات

## 📦 فایل‌های جدید ایجاد شده

### 1. Services

- ✅ `bot/src/services/ticket.ts` - سرویس اصلی مدیریت تیکت‌ها

### 2. Repositories

- ✅ `bot/src/repositories/TicketRepository.ts` - عملیات دیتابیس تیکت‌ها

### 3. Handlers

- ✅ `bot/src/handlers/support.ts` - Handler های پشتیبانی و تیکت

### 4. Scenes

- ✅ `bot/src/scenes/support-tickets.ts` - Scene های ایجاد و مدیریت تیکت

### 5. Database

- ✅ `bot/drizzle/0003_add_forum_ticket_system.sql` - Migration جدید

### 6. Documentation

- ✅ `bot/TICKET_SYSTEM_GUIDE.md` - راهنمای کامل نصب و استفاده

---

## 🔧 فایل‌های بروزرسانی شده

### 1. Schema

- 📝 `bot/src/db/schema.ts`
  - اضافه شدن فیلدهای Forum-related به `ticketsTable`
  - اضافه شدن `forumGroupId`, `topicId`, `threadMessageId`
  - اضافه شدن `ticketNumber`, `type`, `messageCount`

### 2. Config

- 📝 `bot/src/config.ts`
  - اضافه شدن `SUPPORT_GROUP_ID`
  - اضافه شدن Topic IDs
  - اضافه شدن `TICKET_TOPICS` mapping

### 3. Bot Entry

- 📝 `bot/src/bot.ts`
  - اتصال `supportHandler`

### 4. Plugins

- 📝 `bot/src/plugins/index.ts`
  - اضافه شدن 4 Scene جدید تیکت

### 5. Repositories Index

- 📝 `bot/src/repositories/index.ts`
  - Export کردن `TicketRepository` جدید
  - حذف export مضاعف

### 6. WalletRepository

- 📝 `bot/src/repositories/WalletRepository.ts`
  - حذف `TicketRepository` قدیمی
  - نگه‌داشتن `TicketMessageRepository`

### 7. Orders Handler

- 📝 `bot/src/handlers/orders.ts`
  - فعال کردن "باز کردن تیکت" برای سفارشات

### 8. Locales (3 زبان)

- 📝 `bot/src/shared/locales/en.ts` - انگلیسی
- 📝 `bot/src/shared/locales/fa.ts` - فارسی
- 📝 `bot/src/shared/locales/ru.ts` - روسی
  - اضافه شدن 50+ متن جدید برای سیستم تیکت

### 9. Environment Example

- 📝 `bot/.env.example`
  - اضافه شدن متغیرهای Forum Group

---

## 🎯 قابلیت‌های پیاده‌سازی شده

### ✅ User Features

1. ایجاد تیکت پشتیبانی عمومی
2. ایجاد تیکت برای سفارشات
3. گزارش مشکلات
4. مشاهده لیست تیکت‌های خود
5. مشاهده جزئیات هر تیکت
6. پاسخ دادن به تیکت‌ها
7. مشاهده تاریخچه پیام‌ها

### ✅ Admin Features (در Forum)

1. مشاهده تیکت‌های جدید در Topics جداگانه
2. پاسخ به تیکت‌ها در Thread
3. حل کردن تیکت (Resolve)
4. بستن تیکت (Close)
5. تخصیص تیکت به خود (Assign)
6. مشاهده پروفایل کاربر

### ✅ System Features

1. شماره‌گذاری خودکار تیکت‌ها (T-1001, O-5001, R-8001)
2. Sync دوطرفه بین Bot و Forum
3. ذخیره تمام پیام‌ها در دیتابیس
4. پیگیری SLA (First Response Time)
5. آمار و گزارش تیکت‌ها
6. Multi-language support

---

## 🔗 معماری سیستم

```
User (Bot)
    ↓
TicketService.createTicket()
    ↓
    ├─→ Database: tickets table (ذخیره تیکت)
    └─→ Telegram Forum: sendMessage to Topic
            ↓
        Thread ایجاد می‌شود
            ↓
    Support Agent پاسخ می‌دهد (در Thread)
            ↓
TicketService.handleForumMessage()
    ↓
    ├─→ Database: ticket_messages table
    └─→ User (Bot): ارسال پیام
```

---

## 📊 Database Schema Changes

### tickets Table - ستون‌های جدید:

| Column              | Type      | Description                     |
| ------------------- | --------- | ------------------------------- |
| `forum_group_id`    | BIGINT    | Chat ID گروه Forum              |
| `topic_id`          | INTEGER   | ID topic در Forum               |
| `thread_message_id` | BIGINT    | ID اولین پیام (Thread)          |
| `ticket_number`     | TEXT      | شماره یکتا تیکت (T-1001)        |
| `type`              | TEXT      | نوع تیکت (support/order/report) |
| `assigned_at`       | TIMESTAMP | زمان تخصیص                      |
| `first_response_at` | TIMESTAMP | زمان اولین پاسخ (SLA)           |
| `message_count`     | INTEGER   | تعداد پیام‌ها                   |
| `last_message_at`   | TIMESTAMP | زمان آخرین پیام                 |

### ticket_messages Table - ستون‌های جدید:

| Column              | Type    | Description          |
| ------------------- | ------- | -------------------- |
| `message_id`        | BIGINT  | ID پیام تلگرام       |
| `is_from_user`      | BOOLEAN | آیا از کاربر است؟    |
| `is_system_message` | BOOLEAN | آیا پیام سیستمی است؟ |

---

## 🚀 دستورات نصب

### 1. Migration

```bash
cd bot
npm run db:push
```

### 2. راه‌اندازی Forum

- ساخت Forum Group در Telegram
- ایجاد 3 Topic: Support, Orders, Reports
- اضافه کردن بات با دسترسی Admin
- پیدا کردن Chat ID و Topic IDs

### 3. تنظیم .env

```env
SUPPORT_GROUP_ID=-1001234567890
SUPPORT_TOPIC_ID=2
ORDERS_TOPIC_ID=3
REPORTS_TOPIC_ID=4
```

### 4. اجرای بات

```bash
npm run dev
```

---

## 📝 API های کلیدی

### TicketService

- `createTicket()` - ایجاد تیکت جدید
- `sendUserMessageToForum()` - ارسال پیام کاربر به Forum
- `sendSupportMessageToUser()` - ارسال پیام پشتیبان به کاربر
- `resolveTicket()` - حل کردن تیکت
- `closeTicket()` - بستن تیکت
- `assignTicket()` - تخصیص تیکت

### TicketRepository

- `getUserTickets()` - تیکت‌های کاربر
- `getTicketById()` - دریافت تیکت با ID
- `getTicketWithMessages()` - تیکت + پیام‌ها
- `addMessage()` - اضافه کردن پیام
- `generateTicketNumber()` - ساخت شماره یکتا

---

## 🎨 Customization Points

1. **شماره‌گذاری تیکت:** `TicketRepository.generateTicketNumber()`
2. **فرمت پیام Forum:** `TicketService.sendTicketToForum()`
3. **وضعیت‌های تیکت:** `schema.ts` - ticketsTable.status
4. **Emoji ها:** `support.ts` - getStatusEmoji(), getTypeEmoji()
5. **Topic IDs:** `.env` - SUPPORT_TOPIC_ID, etc.

---

## ⚠️ نکات مهم

1. ✅ بات باید در Forum Group عضو باشد با دسترسی **Admin**
2. ✅ Topic ID ها باید دقیق باشند
3. ✅ `SUPPORT_GROUP_ID` باید با `-100` شروع شود
4. ✅ Migration باید قبل از اجرا اعمال شود
5. ⚠️ برای Production باید Bot Token واقعی استفاده شود

---

## 🧪 تست

### تست کاربر:

1. ✅ ایجاد تیکت پشتیبانی
2. ✅ ایجاد تیکت برای سفارش
3. ✅ پاسخ به تیکت
4. ✅ مشاهده لیست تیکت‌ها

### تست ادمین:

1. ✅ دریافت تیکت در Forum
2. ✅ پاسخ در Thread
3. ✅ Resolve تیکت
4. ✅ Assign تیکت

---

## 📞 پشتیبانی

برای سوالات و مشکلات:

- 📖 راهنمای کامل: `TICKET_SYSTEM_GUIDE.md`
- 🐛 Issues: در صورت بروز مشکل تیکت باز کنید
- 💬 Forum: از خود سیستم تیکتینگ استفاده کنید!

---

**تاریخ پیاده‌سازی:** April 29, 2026  
**نسخه:** 1.0.0  
**وضعیت:** ✅ آماده برای Production
