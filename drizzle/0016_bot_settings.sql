CREATE TABLE IF NOT EXISTS "bot_settings" (
  "id" serial PRIMARY KEY,
  "maintenance_mode" boolean NOT NULL DEFAULT false,
  "maintenance_message" text,
  "referral_enabled" boolean NOT NULL DEFAULT true,
  "shop_enabled" boolean NOT NULL DEFAULT true,
  "updated_at" timestamp DEFAULT now()
);

-- Insert default row
INSERT INTO "bot_settings" ("id", "maintenance_mode", "referral_enabled", "shop_enabled")
VALUES (1, false, true, true)
ON CONFLICT ("id") DO NOTHING;
