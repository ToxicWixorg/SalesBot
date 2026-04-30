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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" bigint,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_admin_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_logs" ALTER COLUMN "admin_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN "user_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN "severity" text DEFAULT 'info';--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN "is_success" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD COLUMN "message_id" bigint;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD COLUMN "is_from_user" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD COLUMN "is_system_message" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "forum_group_id" bigint;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "topic_id" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "thread_message_id" bigint;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "ticket_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "assigned_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "first_response_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "message_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "last_message_at" timestamp;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_idx" ON "admin_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "admins_user_id_idx" ON "admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admins_role_idx" ON "admins" USING btree ("role");--> statement-breakpoint
CREATE INDEX "admins_is_active_idx" ON "admins" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_logs_user_id_idx" ON "admin_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_logs_action_idx" ON "admin_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ticket_messages_message_id_idx" ON "ticket_messages" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "tickets_type_idx" ON "tickets" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_ticket_number_idx" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "tickets_thread_message_id_idx" ON "tickets" USING btree ("thread_message_id");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number");