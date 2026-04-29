# راهنمای استفاده از Inline Keyboards

## ساختار پوشه

همه کیبوردهای اینلاین در پوشه `src/shared/keyboards/` قرار دارند:

```
src/shared/keyboards/
├── index.ts              # فایل اصلی که همه کیبوردها را export می‌کند
├── main-menu.ts          # منوی اصلی
├── back.ts               # دکمه‌های بازگشت و لغو
├── confirmation.ts       # کیبوردهای تایید
├── settings.ts           # منوی تنظیمات
└── pagination.ts         # کیبوردهای صفحه‌بندی و لیست
```

## نحوه استفاده

### 1. Import کردن کیبورد

```typescript
import { mainMenuKeyboard, backKeyboard } from "../shared/keyboards/index.ts";
```

### 2. استفاده در Handler

```typescript
const t = i18n.buildT(user.languageCode);

// ارسال کیبورد منوی اصلی
await context.send("پیام خود را اینجا بنویسید", {
  reply_markup: mainMenuKeyboard(t),
});
```

## کیبوردهای موجود

### 1. Main Menu (`mainMenuKeyboard`)

منوی اصلی ربات با گزینه‌های: محصولات، سفارشات من، کیف پول، دعوت دوستان، کد تخفیف، پشتیبانی، تنظیمات

```typescript
await context.send(t("mainMenu"), {
  reply_markup: mainMenuKeyboard(t),
});
```

### 2. Back Buttons (`backKeyboard`, `cancelKeyboard`, `backToMainKeyboard`)

دکمه‌های برگشت و لغو

```typescript
// دکمه برگشت
await context.send("پیام", {
  reply_markup: backKeyboard(t, "custom_callback"),
});

// دکمه لغو
await context.send("پیام", {
  reply_markup: cancelKeyboard(t),
});

// برگشت به منوی اصلی
await context.send("پیام", {
  reply_markup: backToMainKeyboard(t),
});
```

### 3. Confirmation (`confirmationKeyboard`, `confirmWithCancelKeyboard`)

کیبوردهای تایید بله/خیر

```typescript
// بله/خیر
await context.send("آیا مطمئن هستید؟", {
  reply_markup: confirmationKeyboard(t, "yes_callback", "no_callback"),
});

// تایید/لغو
await context.send("لطفا تایید کنید", {
  reply_markup: confirmWithCancelKeyboard(t, "confirm", "cancel"),
});
```

### 4. Settings (`settingsKeyboard`)

منوی تنظیمات

```typescript
await context.send(t("settings"), {
  reply_markup: settingsKeyboard(t),
});
```

### 5. Pagination (`paginationKeyboard`)

صفحه‌بندی لیست‌ها

```typescript
await context.send("صفحه 1 از 5", {
  reply_markup: paginationKeyboard(t, 1, 5, "products_page"),
});
```

### 6. List Items (`listItemKeyboard`)

دکمه‌های اقدام برای آیتم‌های لیست

```typescript
const actions = [
  { text: "👁️ مشاهده", callback: "view" },
  { text: "🛒 خرید", callback: "buy" },
  { text: "❤️ علاقه‌مندی", callback: "favorite" },
];

await context.send("محصول شماره 1", {
  reply_markup: listItemKeyboard(productId, actions),
});
```

## افزودن کیبورد جدید

برای افزودن کیبورد جدید:

1. فایل جدید در `src/shared/keyboards/` بسازید (مثلا `products.ts`)
2. کیبورد را تعریف کنید:

```typescript
import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

export function productsKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnCategory1"), "cat_1")
    .text(t("btnCategory2"), "cat_2")
    .row()
    .text(t("btnBack"), "back");
}
```

3. آن را در `index.ts` export کنید:

```typescript
export { productsKeyboard } from "./products.ts";
```

## مزایا

✅ **سازمان‌دهی بهتر**: همه کیبوردها در یک مکان مشخص  
✅ **قابلیت استفاده مجدد**: از کیبوردها در چندین جا استفاده کنید  
✅ **نگهداری آسان‌تر**: تغییرات فقط در یک فایل  
✅ **Type-Safe**: با TypeScript کاملا type-safe  
✅ **پشتیبانی از چند زبان**: با استفاده از تابع ترجمه `t`

## نکات مهم

- همیشه تابع ترجمه `t` را به کیبوردها پاس دهید
- از callback data های معنی‌دار استفاده کنید
- برای کیبوردهای پیچیده، پارامترهای سفارشی اضافه کنید
- کیبوردهای مشابه را در یک فایل گروه‌بندی کنید
