-- ═══════════════════════════════════════════════════════════════════════════
-- Missing Migrations: 0013 → 0017
-- Run this on the server DB if drizzle-kit migrate hasn't been executed yet.
-- All statements use IF NOT EXISTS / ON CONFLICT so they're safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- 0013: force_join_channels
CREATE TABLE IF NOT EXISTS "force_join_channels" (
  "id"           serial PRIMARY KEY,
  "channel_id"   text NOT NULL,
  "channel_url"  text NOT NULL,
  "channel_name" text NOT NULL,
  "is_active"    boolean NOT NULL DEFAULT true,
  "order"        integer NOT NULL DEFAULT 0,
  "created_at"   timestamp DEFAULT now(),
  "updated_at"   timestamp DEFAULT now()
);

-- 0014: payment_card_numbers + payment_settings
CREATE TABLE IF NOT EXISTS "payment_card_numbers" (
  "id"           serial PRIMARY KEY,
  "card_number"  text NOT NULL,
  "holder_name"  text NOT NULL,
  "bank_name"    text,
  "is_active"    boolean NOT NULL DEFAULT true,
  "order"        integer NOT NULL DEFAULT 0,
  "created_at"   timestamp DEFAULT now(),
  "updated_at"   timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "payment_settings" (
  "id"                   serial PRIMARY KEY,
  "card_enabled"         boolean NOT NULL DEFAULT true,
  "zarinpal_enabled"     boolean NOT NULL DEFAULT false,
  "zarinpal_merchant_id" text,
  "zarinpal_sandbox"     boolean NOT NULL DEFAULT true,
  "crypto_enabled"       boolean NOT NULL DEFAULT false,
  "crypto_address"       text,
  "crypto_network"       text DEFAULT 'TRC20',
  "crypto_exchange_rate" integer NOT NULL DEFAULT 0,
  "updated_at"           timestamp DEFAULT now()
);

INSERT INTO "payment_settings" ("id", "card_enabled", "zarinpal_enabled", "zarinpal_sandbox", "crypto_enabled", "crypto_network", "crypto_exchange_rate")
VALUES (1, true, false, true, false, 'TRC20', 0)
ON CONFLICT ("id") DO NOTHING;

-- 0015: backup_settings
CREATE TABLE IF NOT EXISTS "backup_settings" (
  "id"                  serial PRIMARY KEY,
  "is_enabled"          boolean NOT NULL DEFAULT false,
  "telegram_channel_id" text,
  "cron_schedule"       text DEFAULT '0 3 * * *',
  "last_backup_at"      timestamp,
  "last_backup_status"  text,
  "last_backup_size"    integer,
  "updated_at"          timestamp DEFAULT now()
);

INSERT INTO "backup_settings" ("id", "is_enabled", "cron_schedule")
VALUES (1, false, '0 3 * * *')
ON CONFLICT ("id") DO NOTHING;

-- 0016: bot_settings
CREATE TABLE IF NOT EXISTS "bot_settings" (
  "id"                  serial PRIMARY KEY,
  "maintenance_mode"    boolean NOT NULL DEFAULT false,
  "maintenance_message" text,
  "referral_enabled"    boolean NOT NULL DEFAULT true,
  "shop_enabled"        boolean NOT NULL DEFAULT true,
  "updated_at"          timestamp DEFAULT now()
);

INSERT INTO "bot_settings" ("id", "maintenance_mode", "referral_enabled", "shop_enabled")
VALUES (1, false, true, true)
ON CONFLICT ("id") DO NOTHING;

-- 0017: product_regions
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "regions" jsonb DEFAULT '[]'::jsonb;

-- 0020: wallet_topups
CREATE TABLE IF NOT EXISTS "wallet_topups" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" bigint NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount" numeric(15, 2) NOT NULL,
  "currency" text DEFAULT 'IRR',
  "receipt_path" text NOT NULL,
  "status" text DEFAULT 'pending',
  "notes" text,
  "approved_by" integer REFERENCES "admins"("id") ON DELETE SET NULL,
  "approved_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "wallet_topups_user_id_idx" ON "wallet_topups" ("user_id");
CREATE INDEX IF NOT EXISTS "wallet_topups_status_idx" ON "wallet_topups" ("status");
