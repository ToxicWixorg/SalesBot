-- Migration: Add time_slot_templates table and update schedules
-- This enables admin-defined time slots for custom_schedule products (e.g. AI accounts)

CREATE TABLE "time_slot_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"product_ids" jsonb,
	"days_of_week" jsonb DEFAULT '[0,1,2,3,4,5,6]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE "schedules" ADD COLUMN "template_id" integer REFERENCES "time_slot_templates"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "user_id" bigint REFERENCES "users"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "order_id" DROP NOT NULL;
