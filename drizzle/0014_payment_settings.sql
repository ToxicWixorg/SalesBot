CREATE TABLE IF NOT EXISTS "payment_card_numbers" (
  "id" serial PRIMARY KEY,
  "card_number" text NOT NULL,
  "holder_name" text NOT NULL,
  "bank_name" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "payment_settings" (
  "id" serial PRIMARY KEY,
  "card_enabled" boolean NOT NULL DEFAULT true,
  "zarinpal_enabled" boolean NOT NULL DEFAULT false,
  "zarinpal_merchant_id" text,
  "zarinpal_sandbox" boolean NOT NULL DEFAULT true,
  "crypto_enabled" boolean NOT NULL DEFAULT false,
  "crypto_address" text,
  "crypto_network" text DEFAULT 'TRC20',
  "crypto_exchange_rate" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp DEFAULT now()
);

-- Insert default settings row
INSERT INTO "payment_settings" ("id", "card_enabled", "zarinpal_enabled", "zarinpal_sandbox", "crypto_enabled", "crypto_network", "crypto_exchange_rate")
VALUES (1, true, false, true, false, 'TRC20', 0)
ON CONFLICT ("id") DO NOTHING;
