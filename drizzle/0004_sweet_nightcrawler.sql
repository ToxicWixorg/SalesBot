-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 👑 ADMIN SYSTEM MIGRATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Create admins table
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"display_name" text,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'support' NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_super_admin" boolean DEFAULT false,
	"permissions" jsonb DEFAULT '{}',
	"allowed_sections" jsonb,
	"restricted_ips" jsonb,
	"last_login_at" timestamp,
	"last_activity_at" timestamp,
	"login_count" integer DEFAULT 0,
	"notes" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" bigint,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint

-- Create admin_sessions table (for TMA)
CREATE TABLE "admin_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"last_activity_at" timestamp,
	"is_valid" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint

-- Update admin_logs table
ALTER TABLE "admin_logs" DROP CONSTRAINT IF EXISTS "admin_logs_admin_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_logs" ALTER COLUMN "admin_id" SET DATA TYPE integer;
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "user_id" bigint NOT NULL;
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "user_agent" text;
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "severity" text DEFAULT 'info';
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "is_success" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "error_message" text;
--> statement-breakpoint

-- Add foreign keys for admins
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- Add foreign keys for admin_sessions
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Add foreign keys for admin_logs
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- Create indexes for admins
CREATE UNIQUE INDEX IF NOT EXISTS "admins_user_id_idx" ON "admins" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admins_role_idx" ON "admins" USING btree ("role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admins_is_active_idx" ON "admins" USING btree ("is_active");
--> statement-breakpoint

-- Create indexes for admin_sessions
CREATE UNIQUE INDEX IF NOT EXISTS "admin_sessions_token_idx" ON "admin_sessions" USING btree ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_admin_id_idx" ON "admin_sessions" USING btree ("admin_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");
--> statement-breakpoint

-- Create indexes for admin_logs
CREATE INDEX IF NOT EXISTS "admin_logs_user_id_idx" ON "admin_logs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_logs_action_idx" ON "admin_logs" USING btree ("action");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_logs_created_at_idx" ON "admin_logs" USING btree ("created_at");
