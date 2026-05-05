-- Migration: Add session chat tracking columns to schedules table
-- Enables auto-created tickets at session start for ChatGPT delivery sessions

ALTER TABLE "schedules"
  ADD COLUMN IF NOT EXISTS "session_start_notified" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "session_ticket_id" integer REFERENCES "tickets"("id") ON DELETE SET NULL;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "schedules_session_start_notified_idx"
  ON "schedules" ("session_start_notified")
  WHERE "session_start_notified" = false;
