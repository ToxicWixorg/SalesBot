# 🎁 Referral & Discount Code System

## 📌 خلاصه پیاده‌سازی

این سیستم شامل دو بخش اصلی است:

### 1️⃣ سیستم دعوت دوستان (Referral System)

#### ویژگی‌ها:

- ✅ لینک رفرال اختصاصی برای هر کاربر
- ✅ پاداش خودکار 10,000 تومان به معرف
- ✅ نمایش آمار دعوت‌ها و پاداش‌ها
- ✅ بنر تبلیغاتی زیبا با اطلاعات کامل
- ✅ دکمه اشتراک‌گذاری مستقیم در تلگرام
- ✅ مشاهده لیست کاربران دعوت شده

#### فایل‌های مرتبط:

- `src/handlers/invite.ts` - Handler اصلی
- `src/repositories/ReferralRepository.ts` - عملیات دیتابیس
- `src/db/schema.ts` - جدول `referralRewardsTable`

#### نحوه کار:

1. هر کاربر یک کد رفرال منحصر به فرد دارد (مثال: `REF12345ABC`)
2. لینک رفرال: `https://t.me/bot_username?start=ref_CODE`
3. وقتی کاربر جدید با لینک عضو می‌شود، 10,000 تومان به کیف پول معرف واریز می‌شود
4. پاداش به صورت خودکار در `start.ts` پردازش می‌شود

---

### 2️⃣ سیستم کد تخفیف (Discount Code System)

#### ویژگی‌ها:

- ✅ تخفیف درصدی و مبلغ ثابت
- ✅ محدودیت تعداد استفاده
- ✅ محدودیت استفاده هر کاربر
- ✅ حداقل مبلغ سفارش
- ✅ تاریخ انقضا
- ✅ کدهای اختصاصی برای محصولات یا کاربران خاص
- ✅ تاریخچه استفاده از کدها

#### فایل‌های مرتبط:

- `src/handlers/discount.ts` - Handler اصلی
- `src/scenes/enter-discount-code.ts` - Scene ورود کد
- `src/repositories/DiscountCodeRepository.ts` - عملیات دیتابیس
- `src/db/schema.ts` - جداول `discountCodesTable` و `discountUsageTable`

#### نحوه کار:

1. کاربر روی دکمه "کد تخفیف" کلیک می‌کند
2. می‌تواند کد را وارد کرده و معتبر بودن آن را بررسی کند
3. در زمان خرید، کد تخفیف اعمال می‌شود
4. تاریخچه استفاده از کدها برای هر کاربر ذخیره می‌شود

---

## 🔧 استفاده در خرید

برای استفاده از کد تخفیف در پروسه خرید، می‌توانید در `handlers/products.ts` یا `handlers/checkout.ts` از `DiscountCodeRepository` استفاده کنید:

```typescript
import { DiscountCodeRepository } from "../repositories/DiscountCodeRepository.ts";

// بررسی معتبر بودن کد
const validation = await DiscountCodeRepository.validateCode(
  code,
  userId,
  orderAmount,
);

if (validation.valid && validation.discountCode) {
  // محاسبه تخفیف
  const discountAmount = DiscountCodeRepository.calculateDiscount(
    validation.discountCode,
    orderAmount,
  );

  // اعمال تخفیف
  const finalPrice = orderAmount - discountAmount;

  // ثبت استفاده از کد
  await DiscountCodeRepository.recordUsage(
    validation.discountCode.id,
    userId,
    orderId,
    discountAmount,
  );
}
```

---

## 📊 جداول دیتابیس

### `referral_rewards`

- ذخیره پاداش‌های دعوت دوستان
- وضعیت: pending, awarded, cancelled

### `discount_codes`

- ذخیره کدهای تخفیف
- نوع: percentage, fixed
- محدودیت‌های مختلف

### `discount_usage`

- تاریخچه استفاده از کدهای تخفیف

---

## 🌐 زبان‌ها

تمام متن‌ها در سه زبان پشتیبانی می‌شوند:

- 🇮🇷 فارسی
- 🇬🇧 انگلیسی
- 🇷🇺 روسی

فایل‌های locale:

- `src/shared/locales/fa.ts`
- `src/shared/locales/en.ts`
- `src/shared/locales/ru.ts`

---

## 🎨 بنر دعوت دوستان

بنر شامل اطلاعات زیر است:

- تعداد دعوت‌های موفق
- مجموع پاداش‌های دریافتی
- لینک اختصاصی رفرال
- راهنمای استفاده
- مقدار پاداش هر دعوت

---

## ✅ تست سیستم

### تست Referral:

1. کاربر A ثبت نام می‌کند
2. کاربر A لینک رفرال خود را می‌گیرد
3. کاربر B با لینک رفرال عضو می‌شود
4. 10,000 تومان به کیف پول کاربر A اضافه می‌شود

### تست Discount:

1. ادمین کد تخفیف ایجاد می‌کند (از پنل ادمین یا دیتابیس)
2. کاربر کد را وارد می‌کند
3. معتبر بودن کد بررسی می‌شود
4. در زمان خرید، تخفیف اعمال می‌شود

---

## 🔐 امنیت

- ✅ جلوگیری از استفاده مجدد از کدهای تخفیف
- ✅ محدودیت تعداد استفاده
- ✅ تاریخ انقضا
- ✅ ثبت تمام استفاده‌ها
- ✅ پاداش خودکار بدون امکان دستکاری

---

## 📝 TODO (پیشنهادات توسعه)

- [ ] پنل ادمین برای مدیریت کدهای تخفیف
- [ ] گزارش فروش با کدهای تخفیف
- [ ] پاداش چندسطحی برای ریفرال
- [ ] کد تخفیف خودکار برای کاربران جدید
- [ ] یادآوری تمدید با کد تخفیف ویژه

---

## 💡 نکات مهم

1. **پاداش ریفرال فعلی: 10,000 تومان** - برای تغییر، فایل `ReferralRepository.ts` را ویرایش کنید (متغیر `REFERRAL_REWARD`)

2. **کدهای تخفیف** باید توسط ادمین از طریق دیتابیس یا پنل ادمین (آینده) ایجاد شوند

3. برای **تست local**، می‌توانید مستقیماً کد تخفیف در دیتابیس اضافه کنید:

```sql
INSERT INTO discount_codes (code, type, value, is_active)
VALUES ('SUMMER2024', 'percentage', 20, true);
```

---

تمام کدها تست شده و آماده استفاده هستند! 🚀
