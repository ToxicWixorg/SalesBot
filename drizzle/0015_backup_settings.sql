CREATE TABLE IF NOT EXISTS "backup_settings" (
  "id" serial PRIMARY KEY,
  "is_enabled" boolean NOT NULL DEFAULT false,
  "telegram_channel_id" text,
  "cron_schedule" text DEFAULT '0 3 * * *',
  "last_backup_at" timestamp,
  "last_backup_status" text,
  "last_backup_size" integer,
  "updated_at" timestamp DEFAULT now()
);

-- Insert default row
INSERT INTO "backup_settings" ("id", "is_enabled", "cron_schedule")
VALUES (1, false, '0 3 * * *')
ON CONFLICT ("id") DO NOTHING;
