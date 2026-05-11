ALTER TABLE "payment_settings"
ADD COLUMN IF NOT EXISTS "zarinpal_callback_url" text;

CREATE TABLE IF NOT EXISTS "zarinpal_wallet_payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" bigint NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount" numeric(15, 2) NOT NULL,
  "authority" text,
  "payment_url" text,
  "callback_url" text,
  "callback_status" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "ref_id" text,
  "verified_at" timestamp,
  "credited_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "zarinpal_wallet_payments_authority_idx"
  ON "zarinpal_wallet_payments" ("authority");
CREATE INDEX IF NOT EXISTS "zarinpal_wallet_payments_user_id_idx"
  ON "zarinpal_wallet_payments" ("user_id");
CREATE INDEX IF NOT EXISTS "zarinpal_wallet_payments_status_idx"
  ON "zarinpal_wallet_payments" ("status");
