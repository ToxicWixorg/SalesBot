-- Make the legacy single-language `name` columns nullable.
--
-- 0025_add_multilang_support added name_fa/name_en/name_ru but left the old
-- `name` columns NOT NULL (its header noted "a later cleanup migration should
-- drop old name/description columns" — that migration was never created).
-- The current Drizzle schema no longer knows about `name`, so inserts omit it
-- and hit a NOT NULL violation. Dropping NOT NULL unblocks inserts while
-- keeping existing data and any code that still reads the column.
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'categories' AND column_name = 'name'
	) THEN
		ALTER TABLE "categories" ALTER COLUMN "name" DROP NOT NULL;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'products' AND column_name = 'name'
	) THEN
		ALTER TABLE "products" ALTER COLUMN "name" DROP NOT NULL;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'product_plans' AND column_name = 'name'
	) THEN
		ALTER TABLE "product_plans" ALTER COLUMN "name" DROP NOT NULL;
	END IF;
END $$;
