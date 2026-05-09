-- Wallet topups: card-to-card receipts awaiting admin approval

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
