-- Session chats: live delivery sessions for custom_schedule products.
-- Created automatically at T=0 by ReminderService instead of tickets.

CREATE TABLE IF NOT EXISTS "session_chats" (
  "id" serial PRIMARY KEY NOT NULL,
  "schedule_id" integer REFERENCES "schedules"("id") ON DELETE CASCADE,
  "order_id" integer REFERENCES "orders"("id") ON DELETE CASCADE,
  "user_id" bigint REFERENCES "users"("id") ON DELETE SET NULL,
  "status" text NOT NULL DEFAULT 'open',
  "closed_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session_chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_chat_id" integer NOT NULL REFERENCES "session_chats"("id") ON DELETE CASCADE,
  "sender_type" text NOT NULL,
  "sender_id" bigint,
  "text" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "session_chats_schedule_id_idx" ON "session_chats" ("schedule_id");
CREATE INDEX IF NOT EXISTS "session_chats_order_id_idx" ON "session_chats" ("order_id");
CREATE INDEX IF NOT EXISTS "session_chats_user_id_idx" ON "session_chats" ("user_id");
CREATE INDEX IF NOT EXISTS "session_chat_messages_chat_id_idx" ON "session_chat_messages" ("session_chat_id");
