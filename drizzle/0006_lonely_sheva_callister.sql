CREATE TABLE "product_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"plan_id" integer,
	"config_data" text NOT NULL,
	"label" text,
	"is_used" boolean DEFAULT false,
	"order_id" integer,
	"assigned_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_email" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_otp" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_login" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "requires_region" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_configs" ADD CONSTRAINT "product_configs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_configs" ADD CONSTRAINT "product_configs_plan_id_product_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_configs" ADD CONSTRAINT "product_configs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_configs_product_id_idx" ON "product_configs" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_configs_plan_id_idx" ON "product_configs" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "product_configs_is_used_idx" ON "product_configs" USING btree ("is_used");