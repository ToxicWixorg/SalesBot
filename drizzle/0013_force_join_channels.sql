-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: 0013_force_join_channels
-- جدول کانال‌های جوین اجباری — مدیریت از ادمین‌پنل
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
