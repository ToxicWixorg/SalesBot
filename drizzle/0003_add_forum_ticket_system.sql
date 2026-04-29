-- Add Forum-based Ticket System columns
ALTER TABLE "tickets" ADD COLUMN "forum_group_id" BIGINT;
ALTER TABLE "tickets" ADD COLUMN "topic_id" INTEGER;
ALTER TABLE "tickets" ADD COLUMN "thread_message_id" BIGINT;
ALTER TABLE "tickets" ADD COLUMN "ticket_number" TEXT NOT NULL DEFAULT '';
ALTER TABLE "tickets" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'support';
ALTER TABLE "tickets" ADD COLUMN "assigned_at" TIMESTAMP;
ALTER TABLE "tickets" ADD COLUMN "first_response_at" TIMESTAMP;
ALTER TABLE "tickets" ADD COLUMN "message_count" INTEGER DEFAULT 0;
ALTER TABLE "tickets" ADD COLUMN "last_message_at" TIMESTAMP;

-- Update status enum to include new statuses
-- status: open, waiting_user, waiting_support, in_progress, resolved, closed, blocked

-- Add ticket_number unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "tickets_ticket_number_idx" ON "tickets" ("ticket_number");
CREATE INDEX IF NOT EXISTS "tickets_type_idx" ON "tickets" ("type");
CREATE INDEX IF NOT EXISTS "tickets_thread_message_id_idx" ON "tickets" ("thread_message_id");

-- Add columns to ticket_messages for forum integration
ALTER TABLE "ticket_messages" ADD COLUMN "message_id" BIGINT;
ALTER TABLE "ticket_messages" ADD COLUMN "is_from_user" BOOLEAN DEFAULT TRUE;
ALTER TABLE "ticket_messages" ADD COLUMN "is_system_message" BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "ticket_messages_message_id_idx" ON "ticket_messages" ("message_id");
