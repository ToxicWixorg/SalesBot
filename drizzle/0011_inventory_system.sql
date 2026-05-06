-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Inventory System
-- Replaces product_configs with a richer inventory table.
-- Adds warranty / terms / maxPerUser to products.
-- Adds stock_notifications table.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. New columns on products table
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "warranty_days"  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "terms"          text,
  ADD COLUMN IF NOT EXISTS "max_per_user"   integer NOT NULL DEFAULT 0;

-- 2. New inventory table
CREATE TABLE IF NOT EXISTS "inventory" (
  "id"              serial PRIMARY KEY,
  "product_id"      integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "email"           text,
  "password"        text,
  "extra_data"      text,
  "status"          text NOT NULL DEFAULT 'available',   -- available | reserved | used | dead
  "reserved_at"     timestamp,
  "used_at"         timestamp,
  "used_by_order_id" integer REFERENCES "orders"("id") ON DELETE SET NULL,
  "dead_reason"     text,
  "created_at"      timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "inventory_product_id_idx" ON "inventory"("product_id");
CREATE INDEX IF NOT EXISTS "inventory_status_idx"     ON "inventory"("status");

-- 3. stock_notifications table
CREATE TABLE IF NOT EXISTS "stock_notifications" (
  "id"          serial PRIMARY KEY,
  "user_id"     bigint NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id"  integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "notified_at" timestamp,
  "created_at"  timestamp DEFAULT now(),
  UNIQUE ("user_id", "product_id")
);

CREATE INDEX IF NOT EXISTS "stock_notifications_product_id_idx" ON "stock_notifications"("product_id");
