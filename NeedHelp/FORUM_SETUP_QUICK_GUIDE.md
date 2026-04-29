# 🎫 راهنمای سریع: نحوه تنظیم Forum Group

## قدم به قدم تنظیم سیستم تیکتینگ

### 1️⃣ ساخت Forum Group

```
1. Telegram را باز کنید
2. New Group → نام: "پشتیبانی فروشگاه"
3. گروه را ایجاد کنید
4. به تنظیمات گروه بروید
5. روی "Topics" کلیک کنید
6. "Enable Topics" را فعال کنید
✅ گروه شما حالا یک Forum است!
```

---

### 2️⃣ ساخت Topics

در گروه Forum خود، **3 Topic** ایجاد کنید:

#### Topic 1: Support Tickets 🎫
```
نام: 🎫 Support Tickets
رنگ: آبی (اختیاری)
```

#### Topic 2: Order Issues 📦
```
نام: 📦 Order Issues  
رنگ: قرمز (اختیاری)
```

#### Topic 3: Problem Reports ⚠️
```
نام: ⚠️ Problem Reports
رنگ: نارنجی (اختیاری)
```

---

### 3️⃣ اضافه کردن بات به گروه

```
1. در گروه Forum روی "Add Members" کلیک کنید
2. بات خود را جستجو و اضافه کنید
3. به "Administrators" بروید
4. بات را به Admin تبدیل کنید
5. مجوزهای زیر را فعال کنید:
   ✅ Post Messages
   ✅ Edit Messages of Others (اختیاری)
   ✅ Delete Messages (اختیاری)
   ✅ Pin Messages (اختیاری)
```

---

### 4️⃣ پیدا کردن Chat ID گروه

#### روش 1: استفاده از بات دیگری

```
1. @userinfobot را به گروه اضافه کنید
2. دستور /start را ارسال کنید
3. Chat ID را کپی کنید (مثل: -1001234567890)
4. بات را از گروه حذف کنید
```

#### روش 2: استفاده از کد موقت

در فایل `bot/src/bot.ts` موقتاً اضافه کنید:

```typescript
bot.on("message", (ctx) => {
  console.log("📍 Chat ID:", ctx.chat.id);
  console.log("📍 Chat Type:", ctx.chat.type);
  console.log("📍 Chat Title:", ctx.chat.title);
});
```

سپس:
1. بات را اجرا کنید
2. در گروه یک پیام ارسال کنید
3. در Console، Chat ID را ببینید
4. این کد را حذف کنید

---

### 5️⃣ پیدا کردن Topic IDs

در فایل `bot/src/bot.ts` موقتاً اضافه کنید:

```typescript
bot.on("message", (ctx) => {
  if (ctx.message.message_thread_id) {
    console.log("🔢 Topic ID:", ctx.message.message_thread_id);
    console.log("📝 Topic Name:", ctx.chat.title);
  }
});
```

سپس:
1. بات را اجرا کنید
2. در **Topic 1** (Support Tickets) یک پیام بفرستید
3. در Console Topic ID را ببینید و یادداشت کنید
4. در **Topic 2** (Order Issues) یک پیام بفرستید
5. Topic ID را یادداشت کنید
6. در **Topic 3** (Problem Reports) یک پیام بفرستید
7. Topic ID را یادداشت کنید
8. کد موقت را حذف کنید

**معمولاً Topic ID ها به این شکل هستند:**
- Topic 1 (General/اولین topic) = ID: `1` (این یک default است)
- Topic 2 (Support Tickets) = ID: `2`
- Topic 3 (Order Issues) = ID: `3`
- Topic 4 (Problem Reports) = ID: `4`

---

### 6️⃣ تنظیم فایل .env

فایل `.env` را ویرایش کنید:

```env
# مثال با مقادیر واقعی:
SUPPORT_GROUP_ID=-1001234567890
SUPPORT_TOPIC_ID=2
ORDERS_TOPIC_ID=3
REPORTS_TOPIC_ID=4
```

⚠️ **نکته مهم:**
- `SUPPORT_GROUP_ID` همیشه با `-100` شروع می‌شود
- Topic ID ها عدد صحیح مثبت هستند

---

### 7️⃣ تست سیستم

#### تست 1: ایجاد تیکت
```
1. بات را اجرا کنید: npm run dev
2. در بات به /start بروید
3. روی "💬 پشتیبانی" کلیک کنید
4. روی "🎫 تیکت پشتیبانی جدید" کلیک کنید
5. یک پیام تست بفرستید
6. به گروه Forum بروید
7. باید تیکت را در Topic "Support Tickets" ببینید ✅
```

#### تست 2: پاسخ پشتیبانی
```
1. در Forum Group، روی تیکت کلیک کنید
2. در Thread پاسخ بدهید: "سلام، چطور می‌تونم کمکتون کنم؟"
3. به بات کاربر بروید
4. باید پیام پشتیبانی را دریافت کنید ✅
```

#### تست 3: پاسخ کاربر
```
1. در لیست تیکت‌های خود، تیکت را انتخاب کنید
2. روی "💬 پاسخ" کلیک کنید
3. یک پیام جدید بفرستید
4. در Forum Thread باید پیام را ببینید ✅
```

---

## 🎯 Checklist نهایی

قبل از Production:

- [ ] ✅ Forum Group ساخته شده
- [ ] ✅ 3 Topic ایجاد شده
- [ ] ✅ بات به گروه اضافه شده (با Admin)
- [ ] ✅ Chat ID پیدا شده
- [ ] ✅ Topic IDs پیدا شده
- [ ] ✅ فایل .env تنظیم شده
- [ ] ✅ Migration اجرا شده (`npm run db:push`)
- [ ] ✅ بات اجرا شده بدون خطا
- [ ] ✅ تست ایجاد تیکت انجام شده
- [ ] ✅ تست پاسخ پشتیبانی انجام شده
- [ ] ✅ تست پاسخ کاربر انجام شده

---

## 🐛 رفع مشکلات متداول

### مشکل: تیکت در Forum ارسال نمی‌شود

**دلایل احتمالی:**
1. ❌ Chat ID اشتباه است
2. ❌ بات در گروه نیست
3. ❌ بات Admin نیست
4. ❌ Topic ID اشتباه است

**راه حل:**
```bash
# لاگ‌های بات را بررسی کنید:
npm run dev

# به دنبال این خطاها باشید:
# - "Chat not found"
# - "Bot is not a member"
# - "No rights to send message"
```

---

### مشکل: پیام پشتیبانی به کاربر نمی‌رسد

**دلایل احتمالی:**
1. ❌ Handler فعال نیست
2. ❌ پیام در Topic اشتباه فرستاده شده
3. ❌ Thread ID پیدا نشده

**راه حل:**
```typescript
// موقتاً این لاگ را اضافه کنید:
console.log("[DEBUG] Forum message received");
console.log("[DEBUG] Thread ID:", ctx.message.reply_to_message?.message_id);
```

---

### مشکل: Topic ID اشتباه است

**راه حل:**
1. تمام Topic ID ها را با روش بالا دوباره پیدا کنید
2. در `.env` آنها را بروز کنید
3. بات را restart کنید

---

## 📞 نیاز به کمک؟

اگر مشکلی دارید:
1. لاگ‌های Console را بررسی کنید
2. مستندات کامل را بخوانید: `TICKET_SYSTEM_GUIDE.md`
3. از خود سیستم تیکتینگ استفاده کنید! 😄

---

**موفق باشید!** 🎉
