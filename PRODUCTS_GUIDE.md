# راهنمای بخش محصولات

## ساختار پیاده‌سازی شده

بخش محصولات طبق فلوی زیر پیاده‌سازی شده:

```
کاربر کلیک می‌کند روی "🛒 محصولات"
    ↓
نمایش دسته‌بندی‌ها: 🎵 موزیک | 🤖 هوش مصنوعی | 🌐 VPN | 🎮 سایر
    ↓
انتخاب دسته‌بندی
    ↓
نمایش لیست محصولات در آن دسته
    ↓
انتخاب محصول
    ↓
نمایش جزئیات محصول (توضیح، قیمت، موجودی، نوع تحویل)
    ↓
کلیک روی "خرید"
    ↓
انتخاب پلن (1 ماهه، 3 ماهه، ...)
    ↓
خلاصه سفارش و تایید
```

## فایل‌های ایجاد شده

### 1. کیبوردها

📁 `src/shared/keyboards/products.ts`

- `categoriesKeyboard()` - نمایش دسته‌بندی‌ها
- `productsListKeyboard()` - لیست محصولات
- `productDetailsKeyboard()` - جزئیات محصول
- `productPlansKeyboard()` - انتخاب پلن
- `orderConfirmationKeyboard()` - تایید سفارش

### 2. Handler

📁 `src/handlers/products.ts`
شامل تمام callback handler های بخش محصولات:

- `products` - نمایش دسته‌بندی‌ها
- `category_{id}` - نمایش محصولات یک دسته
- `product_{id}` - جزئیات محصول
- `buy_product_{id}` - نمایش پلن‌ها
- `select_plan_{id}` - خلاصه سفارش
- `notify_stock_{id}` - درخواست اطلاع‌رسانی موجودی

### 3. ترجمه‌ها

تمام متن‌های لازم به سه زبان فارسی، انگلیسی و روسی اضافه شده:

- `src/shared/locales/en.ts`
- `src/shared/locales/fa.ts`
- `src/shared/locales/ru.ts`

### 4. Scripts برای Seed کردن دیتا

📁 `src/scripts/seed-categories.ts` - ایجاد دسته‌بندی‌های پیش‌فرض
📁 `src/scripts/seed-products.ts` - ایجاد محصولات نمونه

## نحوه اجرا

### 1. راه‌اندازی دیتابیس

اگر هنوز migration ها را اجرا نکرده‌اید:

```bash
npm run db:push
# یا
bun run db:push
```

### 2. ایجاد دسته‌بندی‌های اولیه

```bash
bun run src/scripts/seed-categories.ts
```

این دستور 4 دسته‌بندی پیش‌فرض را ایجاد می‌کند:

- 🎵 موزیک
- 🤖 هوش مصنوعی
- 🌐 VPN
- 🎮 سایر

### 3. ایجاد محصولات نمونه (اختیاری)

```bash
bun run src/scripts/seed-products.ts
```

این دستور 3 محصول نمونه ایجاد می‌کند:

- **Spotify Premium** (موزیک) - خودکار
- **ChatGPT Plus** (AI) - دستی
- **Premium VPN** (VPN) - خودکار

### 4. راه‌اندازی بات

```bash
bun run dev
# یا
npm run dev
```

## تست کردن

1. ربات را استارت کنید: `/start`
2. روی دکمه "🛒 محصولات" کلیک کنید
3. یک دسته‌بندی را انتخاب کنید
4. محصول را انتخاب کنید
5. جزئیات محصول را مشاهده کنید
6. روی "خرید" کلیک کنید
7. پلن مورد نظر را انتخاب کنید
8. خلاصه سفارش را مشاهده کنید

## ویژگی‌ها

✅ **دسته‌بندی محصولات** - سازمان‌دهی محصولات در دسته‌های مختلف
✅ **نمایش موجودی** - نمایش وضعیت موجودی هر محصول
✅ **انواع تحویل** - پشتیبانی از تحویل خودکار، دستی و هماهنگی
✅ **پلن‌های متعدد** - امکان تعریف چندین پلن برای هر محصول
✅ **چند زبانه** - پشتیبانی از فارسی، انگلیسی و روسی
✅ **UI کاربرپسند** - کیبوردهای اینلاین با آیکون‌های مناسب

## مراحل بعدی (TODO)

این بخش تکمیل است اما نیاز به موارد زیر دارد:

1. **سیستم پرداخت** - اتصال به درگاه پرداخت
2. **تایید سفارش** - پردازش سفارش و ذخیره در دیتابیس
3. **کد تخفیف** - اعمال کد تخفیف به سفارش
4. **استفاده از کیف پول** - پرداخت با موجودی کیف پول
5. **اطلاع‌رسانی موجودی** - سیستم notify برای محصولات ناموجود
6. **تحویل محصول** - ارسال اطلاعات محصول به کاربر بعد از پرداخت

## نکات مهم

- همه Repository ها از قبل آماده هستند در `src/repositories/ProductRepository.ts`
- Schema های دیتابیس کامل است و نیازی به تغییر ندارد
- کیبوردها به صورت ماژولار طراحی شده‌اند و قابل استفاده مجدد هستند
- همه Callback های محصولات با regex pattern مدیریت می‌شوند

## ساختار دیتابیس

```typescript
categoriesTable
├─ id (serial)
├─ name (text)
├─ slug (text)
├─ description (text)
├─ icon (text)
└─ createdAt

productsTable
├─ id (serial)
├─ name (text)
├─ slug (text)
├─ description (text)
├─ categoryId → categories.id
├─ deliveryType (automatic/manual/coordination)
├─ stock (integer)
├─ isActive (boolean)
└─ ...

productPlansTable
├─ id (serial)
├─ productId → products.id
├─ name (text)
├─ price (decimal)
├─ duration (integer)
├─ durationUnit (day/month/year)
└─ ...
```

## مثال کد برای افزودن محصول جدید

```typescript
// Create a new product
const product = await ProductRepository.create({
  name: "Apple Music",
  slug: "apple-music",
  description: "اشتراک Apple Music",
  categoryId: musicCategory.id,
  deliveryType: "automatic",
  stock: 15,
  isActive: true,
});

// Add plans
await ProductPlanRepository.create({
  productId: product.id,
  name: "1 ماهه",
  price: "18000",
  duration: 30,
  durationUnit: "day",
});
```
