-- Migration: Add notification settings to users table
-- Created: 2026-04-29

ALTER TABLE "users" ADD COLUMN "notify_orders" boolean DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_wallet" boolean DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_promotions" boolean DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_referrals" boolean DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_stock" boolean DEFAULT true;
