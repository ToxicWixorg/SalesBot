-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🌍 MIGRATION: Add multilingual fields for categories, products and plans
-- Phase 1 (safe rollout):
--   1) Add new localized columns
--   2) Backfill from existing name/description
--   3) Keep old columns temporarily for backward compatibility
--
-- NOTE:
-- - This migration is safe for a live server because old columns stay in place.
-- - App code can be deployed afterwards to read localized fields.
-- - A later cleanup migration should drop old name/description columns.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1️⃣ Categories
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name_fa" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name_en" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name_ru" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description_fa" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description_en" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description_ru" text;

UPDATE "categories"
SET
	"name_fa" = COALESCE("name_fa", "name"),
	"name_en" = COALESCE("name_en", "name"),
	"name_ru" = COALESCE("name_ru", "name"),
	"description_fa" = COALESCE("description_fa", "description"),
	"description_en" = COALESCE("description_en", "description"),
	"description_ru" = COALESCE("description_ru", "description")
WHERE
	"name_fa" IS NULL
	OR "name_en" IS NULL
	OR "name_ru" IS NULL
	OR "description_fa" IS NULL
	OR "description_en" IS NULL
	OR "description_ru" IS NULL;

ALTER TABLE "categories" ALTER COLUMN "name_fa" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "name_en" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "name_ru" SET NOT NULL;

--> statement-breakpoint

-- 2️⃣ Products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "name_fa" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "name_en" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "name_ru" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_fa" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_en" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_ru" text;

UPDATE "products"
SET
	"name_fa" = COALESCE("name_fa", "name"),
	"name_en" = COALESCE("name_en", "name"),
	"name_ru" = COALESCE("name_ru", "name"),
	"description_fa" = COALESCE("description_fa", "description"),
	"description_en" = COALESCE("description_en", "description"),
	"description_ru" = COALESCE("description_ru", "description")
WHERE
	"name_fa" IS NULL
	OR "name_en" IS NULL
	OR "name_ru" IS NULL
	OR "description_fa" IS NULL
	OR "description_en" IS NULL
	OR "description_ru" IS NULL;

ALTER TABLE "products" ALTER COLUMN "name_fa" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "name_en" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "name_ru" SET NOT NULL;

--> statement-breakpoint

-- 3️⃣ Product plans
ALTER TABLE "product_plans" ADD COLUMN IF NOT EXISTS "name_fa" text;
ALTER TABLE "product_plans" ADD COLUMN IF NOT EXISTS "name_en" text;
ALTER TABLE "product_plans" ADD COLUMN IF NOT EXISTS "name_ru" text;
ALTER TABLE "product_plans" ADD COLUMN IF NOT EXISTS "description_fa" text;
ALTER TABLE "product_plans" ADD COLUMN IF NOT EXISTS "description_en" text;
ALTER TABLE "product_plans" ADD COLUMN IF NOT EXISTS "description_ru" text;

UPDATE "product_plans"
SET
	"name_fa" = COALESCE("name_fa", "name"),
	"name_en" = COALESCE("name_en", "name"),
	"name_ru" = COALESCE("name_ru", "name"),
	"description_fa" = COALESCE("description_fa", "description"),
	"description_en" = COALESCE("description_en", "description"),
	"description_ru" = COALESCE("description_ru", "description")
WHERE
	"name_fa" IS NULL
	OR "name_en" IS NULL
	OR "name_ru" IS NULL
	OR "description_fa" IS NULL
	OR "description_en" IS NULL
	OR "description_ru" IS NULL;

ALTER TABLE "product_plans" ALTER COLUMN "name_fa" SET NOT NULL;
ALTER TABLE "product_plans" ALTER COLUMN "name_en" SET NOT NULL;
ALTER TABLE "product_plans" ALTER COLUMN "name_ru" SET NOT NULL;

--> statement-breakpoint

-- 4️⃣ Cleanup will be done in a later migration after bot/admin-panel are updated:
-- ALTER TABLE "categories" DROP COLUMN "name";
-- ALTER TABLE "categories" DROP COLUMN "description";
-- ALTER TABLE "products" DROP COLUMN "name";
-- ALTER TABLE "products" DROP COLUMN "description";
-- ALTER TABLE "product_plans" DROP COLUMN "name";
-- ALTER TABLE "product_plans" DROP COLUMN "description";
