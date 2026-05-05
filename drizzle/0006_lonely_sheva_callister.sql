ALTER TABLE "product_plans" ADD COLUMN "requires_email" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_otp" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_login" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_region" boolean DEFAULT false;
