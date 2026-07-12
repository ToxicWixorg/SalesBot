ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "referral_reward_amount" numeric(15, 2) DEFAULT '1.00';
