ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "regions" jsonb DEFAULT '[]'::jsonb;
