CREATE TABLE "forum_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"support_group_id" text,
	"support_topic_id" integer,
	"orders_topic_id" integer,
	"reports_topic_id" integer,
	"new_users_topic_id" integer,
	"news_topic_id" integer,
	"new_referral_topic_id" integer,
	"payments_topic_id" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "min_stock" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "display_order" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "products_display_order_idx" ON "products" USING btree ("display_order");