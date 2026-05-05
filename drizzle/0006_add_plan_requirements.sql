-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔧 ADD PER-PLAN DELIVERY REQUIREMENTS
-- Allows each plan to override product-level requirements
-- e.g. ChatGPT Plus needs OTP/login, ChatGPT Team only needs email
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE "product_plans" ADD COLUMN "requires_email" boolean DEFAULT false;
ALTER TABLE "product_plans" ADD COLUMN "requires_otp" boolean DEFAULT false;
ALTER TABLE "product_plans" ADD COLUMN "requires_login" boolean DEFAULT false;
ALTER TABLE "product_plans" ADD COLUMN "requires_region" boolean DEFAULT false;
