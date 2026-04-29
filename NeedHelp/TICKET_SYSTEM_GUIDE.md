# 🎫 سیستم تیکتینگ Forum-Based

### راهنمای نصب و پیکربندی

## 📋 فهرست

1. [معرفی سیستم](#معرفی-سیستم)
2. [معماری](#معماری)
3. [نصب و راه‌اندازی](#نصب-و-راهاندازی)
4. [پیکربندی Telegram Forum Group](#پیکربندی-telegram-forum-group)
5. [متغیرهای محیطی](#متغیرهای-محیطی)
6. [نحوه استفاده](#نحوه-استفاده)
7. [API و توابع](#api-و-توابع)

---

## 🎯 معرفی سیستم

این سیستم یک راه‌حل کامل برای مدیریت تیکت‌های پشتیبانی با استفاده از قابلیت **Telegram Forum Groups** است.

### ویژگی‌های کلیدی:

✅ **سه نوع تیکت:**

- 🎫 **Support** - تیکت‌های پشتیبانی عمومی
- 📦 **Order** - مشکلات مربوط به سفارشات
- ⚠️ **Report** - گزارش مشکلات

✅ **مدیریت در Telegram Forum:**

- هر نوع تیکت در یک **Topic** جداگانه
- هر تیکت = یک **Thread** مستقل
- پیام‌های کاربر و پشتیبان در یک Thread

✅ **امکانات پیشرفته:**

- شماره‌گذاری خودکار تیکت (T-1001, O-5001, R-8001)
- Sync دوطرفه بین بات و Forum
- پیگیری وضعیت و SLA
- تخصیص به تیم پشتیبانی

---

## 🏗️ معماری

```
┌─────────────────┐
│   User (Bot)    │
└────────┬────────┘
         │ Creates Ticket
         ↓
┌─────────────────────────────┐
│   TicketService             │
│  - createTicket()           │
│  - sendUserMessageToForum() │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Telegram Forum Group       │
│                             │
│  📌 Topic: Support (ID: 2)  │
│     ├─ Thread: T-1001       │
│     ├─ Thread: T-1002       │
│     └─ Thread: T-1003       │
│                             │
│  📌 Topic: Orders (ID: 3)   │
│     ├─ Thread: O-5001       │
│     └─ Thread: O-5002       │
│                             │
│  📌 Topic: Reports (ID: 4)  │
│     └─ Thread: R-8001       │
└────────┬────────────────────┘
         │ Support replies
         ↓
┌─────────────────────────────┐
│  TicketService              │
│  - handleForumMessage()     │
│  - sendSupportMessageToUser()│
└────────┬────────────────────┘
         │
         ↓
┌─────────────────┐
│   User (Bot)    │
└─────────────────┘
```

---

## 🚀 نصب و راه‌اندازی

### 1️⃣ Migration را اجرا کنید

```bash
cd bot
npm run db:push
# یا
bun run db:push
```

این دستور تغییرات Schema را اعمال می‌کند:

- اضافه کردن ستون‌های Forum-related به جدول `tickets`
- ایجاد indexes مورد نیاز

### 2️⃣ بررسی فایل‌های ایجاد شده

فایل‌های جدید:

```
bot/src/
├── services/
│   └── ticket.ts                 # TicketService - منطق اصلی
├── repositories/
│   └── TicketRepository.ts       # عملیات دیتابیس
├── handlers/
│   └── support.ts                # Handler های بات
├── scenes/
│   └── support-tickets.ts        # Scene های ایجاد تیکت
└── config.ts                     # پیکربندی (بروزرسانی شده)
```

### 3️⃣ بررسی اتصالات

```typescript
// bot/src/bot.ts - خط 44
supportHandler(bot); // ✅ باید وجود داشته باشد

// bot/src/plugins/index.ts - خط 7-10
import {
  createSupportTicketScene,
  createOrderTicketScene,
  createReportTicketScene,
  replyToTicketScene,
} from "../scenes/support-tickets.ts"; // ✅ باید وجود داشته باشد
```

---

## 🔧 پیکربندی Telegram Forum Group

### مرحله 1: ساخت Forum Group

1. در Telegram یک **گروه جدید** بسازید
2. به **Group Settings** بروید
3. **Topics** را فعال کنید (Enable Topics)
4. گروه به Forum تبدیل می‌شود

### مرحله 2: ساخت Topics

در گروه Forum سه Topic ایجاد کنید:

1. **🎫 Support Tickets** (Topic ID احتمالاً: 2)
2. **📦 Order Issues** (Topic ID احتمالاً: 3)
3. **⚠️ Problem Reports** (Topic ID احتمالاً: 4)

> ⚠️ **نکته مهم:** Topic ID ها را یادداشت کنید!

### مرحله 3: اضافه کردن بات به گروه

1. بات را به گروه Forum اضافه کنید
2. به بات دسترسی **Admin** بدهید با مجوزهای:
   - ✅ Post messages
   - ✅ Delete messages (اختیاری)
   - ✅ Pin messages (اختیاری)

### مرحله 4: پیدا کردن Group Chat ID

روش 1 - از طریق بات:

```typescript
// موقتاً این کد را به بات اضافه کنید
bot.on("message", (ctx) => {
  console.log("Chat ID:", ctx.chat.id);
});
```

روش 2 - از طریق getUpdates API:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

Chat ID به شکل `-1001234567890` خواهد بود.

### مرحله 5: پیدا کردن Topic IDs

1. در بات موقتاً این کد را اضافه کنید:

```typescript
bot.on("message", (ctx) => {
  if (ctx.message.message_thread_id) {
    console.log("Topic ID:", ctx.message.message_thread_id);
  }
});
```

2. در هر Topic یک پیام بفرستید
3. Topic ID را در کنسول ببینید و یادداشت کنید

---

## ⚙️ متغیرهای محیطی

فایل `.env` را ویرایش کنید:

```env
# Telegram Bot
BOT_TOKEN=your_bot_token_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Support Forum Group Configuration
SUPPORT_GROUP_ID=-1001234567890        # Chat ID گروه Forum
SUPPORT_TOPIC_ID=2                     # Topic ID برای تیکت‌های Support
ORDERS_TOPIC_ID=3                      # Topic ID برای تیکت‌های Order
REPORTS_TOPIC_ID=4                     # Topic ID برای تیکت‌های Report
```

### نکات مهم:

- `SUPPORT_GROUP_ID` باید با `-100` شروع شود (SuperGroup ID)
- Topic ID ها باید عدد صحیح باشند
- اگر Topic ID ها متفاوت است، در `.env` آنها را تغییر دهید

---

## 📖 نحوه استفاده

### برای کاربران (User Flow)

#### 1. ایجاد تیکت پشتیبانی عمومی

```
User: کلیک روی "💬 پشتیبانی" در منوی اصلی
  ↓
Bot: نمایش منوی پشتیبانی
  ↓
User: کلیک روی "🎫 تیکت پشتیبانی جدید"
  ↓
Bot: "لطفاً مشکل خود را توضیح دهید"
  ↓
User: تایپ پیام
  ↓
Bot: "✅ تیکت T-1001 ایجاد شد"
```

#### 2. ایجاد تیکت برای سفارش

```
User: رفتن به "📦 سفارشات من"
  ↓
User: انتخاب یک سفارش
  ↓
User: کلیک روی "💬 باز کردن تیکت"
  ↓
Bot: "لطفاً مشکل سفارش را توضیح دهید"
  ↓
User: تایپ پیام
  ↓
Bot: "✅ تیکت O-5001 ایجاد شد"
```

#### 3. پاسخ به تیکت

```
User: رفتن به "📋 تیکت‌های من"
  ↓
User: انتخاب یک تیکت
  ↓
User: کلیک روی "💬 پاسخ"
  ↓
Bot: "لطفاً پیام خود را تایپ کنید"
  ↓
User: تایپ پیام
  ↓
Bot: "✅ پیام شما ارسال شد"
```

### برای پشتیبانی (Admin Flow)

#### 1. مشاهده تیکت جدید در Forum

```
[Forum Group - Topic: Support]

🎫 New Support Ticket

🎫 Ticket: T-1001
👤 User: @username (123456789)
🟡 Priority: normal
⏰ Time: 29/04/2026, 14:30

━━━━━━━━━━━━━━━━
من مشکلی با محصول دارم...

━━━━━━━━━━━━━━━━
Reply to this thread to communicate with the user

[👤 View Profile] [✅ Resolve] [🔒 Close]
[🔁 Assign to Me] [⚠️ Priority]
```

#### 2. پاسخ به کاربر

```
Support Agent: Reply در همان Thread
  ↓
Message: "سلام، چطور می‌تونم کمکتون کنم?"
  ↓
System:
  - پیام در دیتابیس ذخیره می‌شود
  - پیام به کاربر در بات ارسال می‌شود
```

#### 3. مدیریت تیکت

**حل شدن تیکت:**

```
Support: کلیک روی "✅ Resolve"
  ↓
System:
  - وضعیت تیکت → "resolved"
  - پیام به کاربر: "✅ تیکت شما حل شد"
```

**بستن تیکت:**

```
Support: کلیک روی "🔒 Close"
  ↓
System:
  - وضعیت تیکت → "closed"
  - پیام به کاربر: "🔒 تیکت شما بسته شد"
```

**تخصیص به خود:**

```
Support: کلیک روی "🔁 Assign to Me"
  ↓
System:
  - تیکت به این پشتیبان تخصیص داده می‌شود
  - وضعیت → "in_progress"
```

---

## 🔌 API و توابع

### TicketService

#### `createTicket()`

ایجاد تیکت جدید و ارسال به Forum

```typescript
const ticketService = new TicketService(bot.api);

const ticket = await ticketService.createTicket({
  userId: 123456789,
  type: "support", // "support" | "order" | "report"
  title: "عنوان تیکت",
  description: "توضیحات کامل",
  orderId: 42, // اختیاری - فقط برای type: "order"
  priority: "normal", // "low" | "normal" | "high" | "urgent"
});
```

#### `sendUserMessageToForum()`

ارسال پیام کاربر به Forum Thread

```typescript
await ticketService.sendUserMessageToForum(ticketId, userId, "پیام کاربر");
```

#### `resolveTicket()`

حل کردن تیکت

```typescript
await ticketService.resolveTicket(ticketId, supportUserId);
```

#### `closeTicket()`

بستن تیکت

```typescript
await ticketService.closeTicket(ticketId, supportUserId);
```

#### `assignTicket()`

تخصیص تیکت به پشتیبان

```typescript
await ticketService.assignTicket(ticketId, agentId);
```

### TicketRepository

#### `getUserTickets()`

دریافت تمام تیکت‌های یک کاربر

```typescript
const tickets = await TicketRepository.getUserTickets(userId);
```

#### `getTicketById()`

دریافت تیکت با ID

```typescript
const ticket = await TicketRepository.getTicketById(ticketId);
```

#### `getTicketWithMessages()`

دریافت تیکت به همراه پیام‌ها

```typescript
const { ticket, messages } =
  await TicketRepository.getTicketWithMessages(ticketId);
```

#### `addMessage()`

اضافه کردن پیام به تیکت

```typescript
await TicketRepository.addMessage({
  ticketId: 1,
  userId: 123456789,
  message: "محتوای پیام",
  isFromUser: true,
});
```

---

## 🎨 سفارشی‌سازی

### تغییر شماره‌گذاری تیکت‌ها

فایل: `bot/src/repositories/TicketRepository.ts`

```typescript
static async generateTicketNumber(type: string): Promise<string> {
  const prefixMap: Record<string, { prefix: string; startFrom: number }> = {
    support: { prefix: "T", startFrom: 1000 },   // 👈 اینجا را تغییر دهید
    order: { prefix: "O", startFrom: 5000 },     // 👈 اینجا را تغییر دهید
    report: { prefix: "R", startFrom: 8000 },    // 👈 اینجا را تغییر دهید
  };
  // ...
}
```

### تغییر متن پیام‌های Forum

فایل: `bot/src/services/ticket.ts`

```typescript
private async sendTicketToForum(ticket: Ticket, user: any) {
  // ...
  let message = `${this.getTypeEmoji(ticket.type)} <b>New ${this.getTypeLabel(ticket.type)}</b>\n\n`;
  // 👆 اینجا را سفارشی کنید
}
```

### افزودن نوع تیکت جدید

1. به `config.ts` اضافه کنید:

```typescript
export const TICKET_TOPICS = {
  support: config.SUPPORT_TOPIC_ID,
  order: config.ORDERS_TOPIC_ID,
  report: config.REPORTS_TOPIC_ID,
  billing: config.BILLING_TOPIC_ID, // 👈 جدید
} as const;
```

2. Scene جدید بسازید در `scenes/support-tickets.ts`
3. Handler جدید در `handlers/support.ts` اضافه کنید

---

## 🐛 عیب‌یابی

### مشکل: تیکت در Forum ارسال نمی‌شود

**چک کنید:**

- ✅ `SUPPORT_GROUP_ID` درست است؟
- ✅ بات در گروه Admin است؟
- ✅ Topic ID ها درست هستند؟

**تست کنید:**

```typescript
// بات را اجرا کنید و این لاگ را بررسی کنید:
console.log("[TICKET] Support group:", config.SUPPORT_GROUP_ID);
console.log("[TICKET] Topics:", TICKET_TOPICS);
```

### مشکل: پیام‌های پشتیبان به کاربر نمی‌رسد

**چک کنید:**

- ✅ بات در گروه Forum هست؟
- ✅ Handler فعال است؟

**تست کنید:**

```typescript
// در support.ts handler:
bot.on("message:text").filter(
  (ctx) => {
    console.log("Message in group:", ctx.chat.id);
    return ctx.chat.id.toString() === config.SUPPORT_GROUP_ID;
  },
  // ...
);
```

### مشکل: Topic ID ها اشتباه هستند

**راه حل:**

1. به گروه Forum بروید
2. در هر Topic یک پیام بفرستید
3. Topic ID را از Console لاگ بردارید:

```typescript
bot.on("message", (ctx) => {
  console.log({
    chatId: ctx.chat.id,
    topicId: ctx.message.message_thread_id,
  });
});
```

---

## 📊 وضعیت‌های تیکت

| وضعیت             | توضیح                     | Emoji |
| ----------------- | ------------------------- | ----- |
| `open`            | تیکت باز و منتظر پاسخ اول | 🟢    |
| `waiting_user`    | منتظر پاسخ کاربر          | 🟡    |
| `waiting_support` | منتظر پاسخ پشتیبانی       | 🟠    |
| `in_progress`     | در حال بررسی              | 🔵    |
| `resolved`        | حل شده                    | ✅    |
| `closed`          | بسته شده                  | 🔒    |
| `blocked`         | مسدود شده                 | ⛔    |

---

## ✅ چک‌لیست نهایی

قبل از Production:

- [ ] Migration اجرا شده
- [ ] Forum Group ساخته شده
- [ ] Topics ایجاد شده (3 عدد)
- [ ] بات به گروه اضافه شده (با دسترسی Admin)
- [ ] متغیرهای `.env` تنظیم شده
- [ ] Topic ID ها تست شده
- [ ] ارسال تیکت تست شده
- [ ] پاسخ پشتیبانی تست شده
- [ ] دریافت پیام توسط کاربر تست شده

---

## 🎉 پایان

سیستم تیکتینگ Forum-based شما آماده است!

برای سوالات بیشتر یا مشکلات، تیکت باز کنید 😄

**نویسنده:** GitHub Copilot  
**تاریخ:** April 29, 2026  
**نسخه:** 1.0.0
