# 🎫 راهنمای سیستم تیکتینگ

این فولدر شامل راهنماهای کامل سیستم تیکتینگ Forum-based است.

## 📚 فهرست مستندات

### 🚀 شروع سریع
- **[FORUM_SETUP_QUICK_GUIDE.md](../FORUM_SETUP_QUICK_GUIDE.md)** - راهنمای گام به گام تنظیم Forum Group (شروع از اینجا!)

### 📖 راهنمای کامل
- **[TICKET_SYSTEM_GUIDE.md](../TICKET_SYSTEM_GUIDE.md)** - مستندات جامع سیستم تیکتینگ

### 📝 خلاصه تغییرات
- **[TICKET_SYSTEM_SUMMARY.md](../TICKET_SYSTEM_SUMMARY.md)** - خلاصه فایل‌ها و تغییرات انجام شده

---

## 🎯 برای شروع کار

1. ابتدا [FORUM_SETUP_QUICK_GUIDE.md](../FORUM_SETUP_QUICK_GUIDE.md) را بخوانید
2. Forum Group را طبق راهنما تنظیم کنید
3. Migration را اجرا کنید: `npm run db:push`
4. بات را اجرا کنید: `npm run dev`
5. تست کنید!

---

## 💡 سیستم چطور کار می‌کند؟

```
کاربر تیکت می‌زند (در بات)
         ↓
تیکت در Forum Group ایجاد می‌شود (در Topic مربوطه)
         ↓
پشتیبان در Forum پاسخ می‌دهد
         ↓
پیام به کاربر در بات ارسال می‌شود
         ↓
کاربر پاسخ می‌دهد (در بات)
         ↓
پیام در Forum Thread نمایش داده می‌شود
```

---

## 🎨 ویژگی‌های کلیدی

✅ **3 نوع تیکت:**
- 🎫 Support - پشتیبانی عمومی
- 📦 Order - مشکلات سفارشات
- ⚠️ Report - گزارش مشکلات

✅ **مدیریت در Telegram Forum:**
- هر نوع تیکت در Topic جداگانه
- هر تیکت = یک Thread مستقل
- Sync کامل بین Bot و Forum

✅ **امکانات Admin:**
- Resolve تیکت
- Close تیکت
- Assign به خود
- مشاهده Profile کاربر

---

## 📁 ساختار فایل‌ها

```
bot/
├── src/
│   ├── services/
│   │   └── ticket.ts              # سرویس اصلی
│   ├── repositories/
│   │   └── TicketRepository.ts    # دیتابیس
│   ├── handlers/
│   │   └── support.ts             # Handler ها
│   ├── scenes/
│   │   └── support-tickets.ts     # Scene ها
│   └── config.ts                  # تنظیمات
├── drizzle/
│   └── 0003_add_forum_ticket_system.sql
├── TICKET_SYSTEM_GUIDE.md
├── TICKET_SYSTEM_SUMMARY.md
└── FORUM_SETUP_QUICK_GUIDE.md
```

---

## 🔧 متغیرهای مورد نیاز (.env)

```env
SUPPORT_GROUP_ID=-1001234567890    # Chat ID گروه Forum
SUPPORT_TOPIC_ID=2                 # Topic برای Support
ORDERS_TOPIC_ID=3                  # Topic برای Orders
REPORTS_TOPIC_ID=4                 # Topic برای Reports
```

---

## 🎓 مثال‌های کاربردی

### ایجاد تیکت از کد

```typescript
import { TicketService } from "./services/ticket";

const ticketService = new TicketService(bot.api);

const ticket = await ticketService.createTicket({
  userId: 123456789,
  type: "support",
  title: "نیاز به راهنمایی",
  description: "چطور می‌تونم محصول رو بخرم؟",
  priority: "normal",
});
```

### دریافت تیکت‌های کاربر

```typescript
import { TicketRepository } from "./repositories/TicketRepository";

const tickets = await TicketRepository.getUserTickets(userId);
console.log(`تعداد تیکت‌ها: ${tickets.length}`);
```

### حل کردن تیکت

```typescript
await ticketService.resolveTicket(ticketId, supportUserId);
```

---

## ⚠️ نکات مهم

1. بات باید در Forum Group عضو باشد با دسترسی **Admin**
2. Topic ID ها باید دقیق و صحیح باشند
3. Migration باید قبل از اجرا اعمال شود
4. برای تست، ابتدا در Development امتحان کنید

---

## 📞 پشتیبانی

- 📖 راهنماهای کامل در همین فولدر
- 🐛 برای مشکلات تیکت باز کنید
- 💬 از خود سیستم تیکتینگ استفاده کنید!

---

**آخرین بروزرسانی:** April 29, 2026  
**نسخه سیستم:** 1.0.0  
**وضعیت:** ✅ آماده برای استفاده
