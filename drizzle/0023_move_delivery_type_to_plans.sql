-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔄 MIGRATION: Move delivery_type from products to plans
-- Description: deliveryType تغییر می‌کند از محصول به پلن
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1️⃣ حذف delivery_type از products table
ALTER TABLE "products" DROP COLUMN IF EXISTS "delivery_type";

-- 2️⃣ اضافه کردن delivery_type به product_plans table
ALTER TABLE "product_plans"
ADD COLUMN "delivery_type" text NOT NULL DEFAULT 'automatic';

-- 3️⃣ ایجاد index برای جستجو سریع
CREATE INDEX IF NOT EXISTS "product_plans_delivery_type_idx"
ON "product_plans" USING btree ("delivery_type");
--> statement-breakpoint
