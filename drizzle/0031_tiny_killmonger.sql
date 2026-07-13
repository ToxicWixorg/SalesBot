ALTER TABLE "wallet_topups" ADD COLUMN "toman_amount" numeric(15, 0);--> statement-breakpoint
ALTER TABLE "wallet_topups" ADD COLUMN "usdt_rate" numeric(15, 2);