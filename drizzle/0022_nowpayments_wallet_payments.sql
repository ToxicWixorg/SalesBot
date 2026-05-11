ALTER TABLE "payment_settings"
  ADD COLUMN IF NOT EXISTS "nowpayments_enabled" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "nowpayments_api_key" text,
  ADD COLUMN IF NOT EXISTS "nowpayments_ipn_secret" text,
  ADD COLUMN IF NOT EXISTS "nowpayments_ipn_callback_url" text,
  ADD COLUMN IF NOT EXISTS "nowpayments_pay_currency" text DEFAULT 'usdttrc20';

CREATE TABLE IF NOT EXISTS "nowpayments_wallet_payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" bigint NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "order_id" text NOT NULL,
  "pay_currency" text,
  "pay_address" text,
  "pay_amount" numeric(24, 12),
  "nowpayments_payment_id" text,
  "payment_url" text,
  "payment_status" text DEFAULT 'waiting' NOT NULL,
  "callback_payload" jsonb,
  "credited_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "nowpayments_wallet_payments_order_id_unique" UNIQUE("order_id"),
  CONSTRAINT "nowpayments_wallet_payments_payment_id_unique" UNIQUE("nowpayments_payment_id")
);

CREATE INDEX IF NOT EXISTS "nowpayments_wallet_payments_user_id_idx"
  ON "nowpayments_wallet_payments" ("user_id");

CREATE INDEX IF NOT EXISTS "nowpayments_wallet_payments_status_idx"
  ON "nowpayments_wallet_payments" ("payment_status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'nowpayments_wallet_payments_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "nowpayments_wallet_payments"
      ADD CONSTRAINT "nowpayments_wallet_payments_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;
