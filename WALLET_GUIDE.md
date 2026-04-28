# 💰 راهنمای سیستم کیف پول

## 📋 فهرست محتوا

- [معرفی](#معرفی)
- [ساختار سیستم](#ساختار-سیستم)
- [حالات مختلف افزایش موجودی](#حالات-مختلف-افزایش-موجودی)
- [فلوی کاربر](#فلوی-کاربر)
- [پیاده‌سازی تکنیکال](#پیاده‌سازی-تکنیکال)
- [نکات امنیتی](#نکات-امنیتی)

---

## 📌 معرفی

سیستم کیف پول یک سیستم کامل برای مدیریت موجودی کاربران در بات تلگرام است که شامل:

- ✅ نمایش موجودی فعلی
- ✅ شارژ کیف پول با روش‌های مختلف
- ✅ تاریخچه کامل تراکنش‌ها
- ✅ استفاده از موجودی در خریدها
- ✅ دریافت پاداش از منابع مختلف

---

## 🏗️ ساختار سیستم

### دیتابیس

#### جدول `users`

```sql
wallet_balance DECIMAL(15, 2) DEFAULT 0
```

#### جدول `wallet_transactions`

```sql
- id: شناسه تراکنش
- user_id: شناسه کاربر
- order_id: شناسه سفارش (اختیاری)
- amount: مبلغ تراکنش
- type: نوع (credit / debit)
- source: منبع تراکنش
- description: توضیحات
- balance_before: موجودی قبل
- balance_after: موجودی بعد
- created_at: تاریخ ایجاد
```

### فایل‌های پیاده‌سازی

```
src/
├── handlers/
│   └── wallet.ts              # Handler اصلی کیف پول
├── scenes/
│   └── wallet-recharge.ts     # Scene شارژ کیف پول
├── repositories/
│   ├── UserRepository.ts      # مدیریت موجودی کاربر
│   └── WalletRepository.ts    # مدیریت تراکنش‌ها
└── shared/
    └── locales/
        ├── fa.ts              # متن‌های فارسی
        ├── en.ts              # متن‌های انگلیسی
        └── ru.ts              # متن‌های روسی
```

---

## 💳 حالات مختلف افزایش موجودی

### 1️⃣ شارژ مستقیم (Recharge)

کاربر خودش کیف پول را شارژ می‌کند.

#### روش‌های شارژ:

#### 🪙 کریپتو (USDT)

```
فلو:
1. کاربر مبلغ را وارد می‌کند
2. آدرس کیف پول نمایش داده می‌شود
3. کاربر USDT را ارسال می‌کند
4. کاربر TxID را ارسال می‌کند
5. سیستم تراکنش را بررسی می‌کند
6. موجودی شارژ می‌شود
```

**کد:**

```typescript
await processCryptoPayment(userId, amount, txId);
```

#### 💳 کارت بانکی

```
فلو:
1. کاربر مبلغ را وارد می‌کند
2. لینک درگاه پرداخت ارسال می‌شود
3. کاربر پرداخت را تکمیل می‌کند
4. Callback از درگاه دریافت می‌شود
5. موجودی شارژ می‌شود
```

**کد:**

```typescript
await handlePaymentCallback(userId, amount, "card", paymentId, "success");
```

#### 💰 زرین‌پال

```
فلو:
1. کاربر مبلغ را وارد می‌کند (حداقل 10,000 تومان)
2. درگاه زرین‌پال فراخوانی می‌شود
3. کاربر به صفحه پرداخت منتقل می‌شود
4. Callback دریافت می‌شود
5. موجودی شارژ می‌شود
```

**کد:**

```typescript
await handlePaymentCallback(userId, amount, "zarinpal", authority, "success");
```

---

### 2️⃣ پاداش ریفرال (Referral Reward)

وقتی کاربر جدیدی با لینک دعوت شما ثبت‌نام می‌کند، شما پاداش دریافت می‌کنید.

**مثال:**

```typescript
import { addReferralReward } from "./scenes/wallet-recharge.ts";

// وقتی کاربر جدید خرید می‌کند
const referrer = await UserRepository.findById(newUser.referredBy);
if (referrer) {
  const rewardAmount = orderAmount * 0.1; // 10% کمیسیون
  await addReferralReward(referrer.id, rewardAmount, newUser.id);
}
```

**Source:** `referral`

---

### 3️⃣ پاداش Perks

کاربر با انجام تسک‌ها پاداش دریافت می‌کند.

**مثال تسک‌ها:**

- عضویت در کانال
- دعوت 5 نفر
- خرید اول
- نوشتن نظر

**کد:**

```typescript
import { addPerkReward } from "./scenes/wallet-recharge.ts";

// وقتی کاربر تسک را کامل می‌کند
await addPerkReward(userId, 50000, "Join Telegram Channel");
```

**Source:** `perk`

---

### 4️⃣ بازگشت وجه (Refund)

وقتی سفارشی لغو می‌شود یا مشکلی پیش می‌آید.

**کد:**

```typescript
import { processRefund } from "./scenes/wallet-recharge.ts";

// لغو سفارش
await processRefund(
  userId,
  order.finalPrice,
  order.id,
  "Order cancelled by user",
);
```

**Source:** `refund`

---

### 5️⃣ تعدیل ادمین (Admin Adjustment)

ادمین می‌تواند دستی موجودی را تغییر دهد.

**کد:**

```typescript
import { adminAdjustment } from "./scenes/wallet-recharge.ts";

// افزایش موجودی
await adminAdjustment(userId, 100000, "add", "Compensation for issue #123");

// کاهش موجودی
await adminAdjustment(userId, 50000, "subtract", "Manual adjustment");
```

**Source:** `admin_adjustment`

---

### 6️⃣ جایزه (Reward)

پاداش‌های ویژه از طرف سیستم (مسابقات، جشنواره‌ها، و...)

**مثال:**

```typescript
await WalletRepository.addCredit(
  userId,
  "200000",
  "reward",
  "Winner of Black Friday Contest",
);

await UserRepository.updateWalletBalance(userId, 200000, "add");
```

**Source:** `reward`

---

## 👤 فلوی کاربر

### مشاهده کیف پول

```
کاربر در منوی اصلی روی "💰 کیف پول" کلیک می‌کند
↓
نمایش:
- موجودی فعلی
- دکمه "شارژ کیف پول"
- دکمه "تاریخچه تراکنش‌ها"
- دکمه "بازگشت"
```

### شارژ کیف پول

```
کلیک روی "💳 شارژ کیف پول"
↓
انتخاب روش پرداخت:
- 🪙 کریپتو (USDT)
- 💳 کارت بانکی
- 💰 زرین‌پال
↓
ورود مبلغ
↓
تکمیل پرداخت
↓
شارژ موفق ✅
```

### تاریخچه تراکنش‌ها

```
کلیک روی "📊 تاریخچه تراکنش‌ها"
↓
نمایش آخرین 10 تراکنش:
- نوع: ➕ واریز / ➖ برداشت
- منبع: 🛒 خرید / 💳 شارژ / ↩️ بازگشت وجه / ...
- مبلغ
- تاریخ
- توضیحات
```

---

## 🛠️ پیاده‌سازی تکنیکال

### UserRepository

```typescript
class UserRepository {
  // دریافت موجودی
  static async getWalletBalance(userId: number): Promise<string>;

  // به‌روزرسانی موجودی
  static async updateWalletBalance(
    userId: number,
    amount: number,
    operation: "add" | "subtract" | "set",
  ): Promise<User>;

  // بررسی موجودی کافی
  static async hasEnoughBalance(
    userId: number,
    requiredAmount: number,
  ): Promise<boolean>;
}
```

### WalletRepository

```typescript
class WalletRepository {
  // ایجاد تراکنش (با محاسبه خودکار balance)
  static async createTransaction(
    transaction: InsertWalletTransaction,
  ): Promise<WalletTransaction>;

  // افزایش موجودی
  static async addCredit(
    userId: number,
    amount: string,
    source: string,
    description?: string,
  ): Promise<WalletTransaction>;

  // کاهش موجودی
  static async debitBalance(
    userId: number,
    amount: string,
    source: string,
    orderId?: number,
    description?: string,
  ): Promise<WalletTransaction>;

  // دریافت تراکنش‌ها
  static async findByUserId(userId: number): Promise<WalletTransaction[]>;
  static async getRecentTransactions(userId: number, limit?: number);
}
```

### Scene Management

```typescript
// State management برای فرآیند شارژ
const rechargeState = new Map<
  number,
  {
    method: "crypto" | "card" | "zarinpal";
    amount?: number;
    step: "amount" | "txid" | "payment";
  }
>();

// ذخیره state
rechargeState.set(userId, { method: "crypto", step: "amount" });

// دریافت state
const state = rechargeState.get(userId);

// پاک کردن state
rechargeState.delete(userId);
```

---

## 🔒 نکات امنیتی

### ✅ بررسی‌های لازم

1. **جلوگیری از موجودی منفی**

```typescript
if (newBalance < 0) {
  throw new Error("Insufficient balance");
}
```

2. **ذخیره balance قبل و بعد**

```typescript
balanceBefore: currentBalance,
balanceAfter: newBalance
```

3. **Validation مبلغ ورودی**

```typescript
const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
if (isNaN(amount) || amount <= 0) {
  return context.reply(context.t("rechargeInvalidAmount"));
}
```

4. **محدودیت حداقل و حداکثر**

```typescript
if (amount < minAmount) {
  return context.reply(context.t("rechargeTooLow", minAmount.toString()));
}
```

### 🚫 مواردی که باید پیاده‌سازی شود

1. **تأیید TxID واقعی**
   - فعلاً فرضی است
   - باید با API blockchain (مثل Tron API) ادغام شود

2. **ادغام درگاه پرداخت**
   - زرین‌پال API
   - درگاه کارت بانکی

3. **Webhook برای callback**
   - مسیر `/payment/callback` برای دریافت نتیجه پرداخت

4. **Rate Limiting**
   - جلوگیری از spam شارژ

5. **لاگ‌گیری کامل**
   - تمام تراکنش‌ها
   - تمام تلاش‌های شارژ

---

## 📊 نمونه سناریوها

### سناریو 1: خرید با کیف پول

```typescript
// بررسی موجودی
const hasBalance = await UserRepository.hasEnoughBalance(userId, orderPrice);

if (hasBalance) {
  // کاهش موجودی
  await UserRepository.updateWalletBalance(userId, orderPrice, "subtract");

  // ثبت تراکنش
  await WalletRepository.debitBalance(
    userId,
    orderPrice.toString(),
    "purchase",
    orderId,
    `Purchase order #${orderId}`,
  );
}
```

### سناریو 2: پاداش ریفرال

```typescript
// کاربر جدید خرید کرد
if (newUser.referredBy) {
  const commission = orderPrice * 0.1; // 10%

  // افزایش موجودی
  await addReferralReward(newUser.referredBy, commission, newUser.id);
}
```

### سناریو 3: لغو سفارش

```typescript
// بازگشت وجه
await processRefund(
  userId,
  order.finalPrice,
  order.id,
  "Order cancelled by admin",
);
```

---

## 🎯 چک‌لیست پیاده‌سازی

- ✅ Schema دیتابیس
- ✅ UserRepository (wallet methods)
- ✅ WalletRepository (transaction methods)
- ✅ Handler کیف پول
- ✅ Scene شارژ کیف پول
- ✅ Locales (fa, en, ru)
- ✅ توابع کمکی (Referral, Perk, Refund, Admin)
- ⏳ ادغام API blockchain (Tron)
- ⏳ ادغام درگاه زرین‌پال
- ⏳ ادغام درگاه کارت بانکی
- ⏳ Webhook برای callback
- ⏳ تست کامل

---

## 📞 پشتیبانی

برای هرگونه سؤال یا مشکل، به بخش Issues مراجعه کنید.

---

**نسخه:** 1.0.0  
**تاریخ:** 2026-04-28
