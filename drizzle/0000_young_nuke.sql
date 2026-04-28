CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" bigint NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"changes" jsonb,
	"ip_address" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"max_discount" numeric(15, 2),
	"min_order_amount" numeric(15, 2),
	"max_uses" integer,
	"max_uses_per_user" integer DEFAULT 1,
	"current_uses" integer DEFAULT 0,
	"product_ids" jsonb,
	"user_ids" jsonb,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "discount_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_id" integer NOT NULL,
	"user_id" bigint NOT NULL,
	"order_id" integer,
	"discount_amount" numeric(15, 2) NOT NULL,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"user_id" bigint NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending',
	"sent_at" timestamp,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"product_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" text DEFAULT 'pending_payment',
	"quantity" integer DEFAULT 1,
	"total_price" numeric(15, 2) NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"wallet_used" numeric(15, 2) DEFAULT '0',
	"final_price" numeric(15, 2) NOT NULL,
	"payment_method" text,
	"payment_id" text,
	"discount_code_id" integer,
	"scheduled_time" timestamp,
	"schedule" jsonb,
	"delivery" jsonb,
	"delivered_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "perks_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"task_data" jsonb,
	"reward_type" text NOT NULL,
	"reward_value" numeric(15, 2),
	"reward_product_id" integer,
	"max_rewards" integer,
	"current_rewards" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(15, 2) NOT NULL,
	"duration" integer,
	"duration_unit" text,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"category_id" integer,
	"delivery_type" text NOT NULL,
	"requires_email" boolean DEFAULT false,
	"requires_otp" boolean DEFAULT false,
	"requires_login" boolean DEFAULT false,
	"requires_region" boolean DEFAULT false,
	"is_renewable" boolean DEFAULT false,
	"can_unlock_perks" boolean DEFAULT false,
	"can_notify_stock" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"stock" integer DEFAULT 0,
	"min_stock" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" bigint NOT NULL,
	"referred_user_id" bigint NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" numeric(15, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"awarded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"date" text NOT NULL,
	"time_slot" text NOT NULL,
	"capacity" integer NOT NULL,
	"current_bookings" integer DEFAULT 0,
	"reminder_sent" boolean DEFAULT false,
	"reminder_time" timestamp,
	"status" text DEFAULT 'available',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"product_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"notification_sent" boolean DEFAULT false,
	"notification_sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"renewal_date" timestamp,
	"status" text DEFAULT 'active',
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" bigint NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"order_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'normal',
	"assigned_to" bigint,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_perks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"task_id" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"verification_data" jsonb,
	"completed_at" timestamp,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"language_code" text DEFAULT 'en',
	"role" text DEFAULT 'customer',
	"is_blocked" boolean DEFAULT false,
	"blocked_reason" text,
	"wallet_balance" numeric(15, 2) DEFAULT '0',
	"referral_code" text,
	"referred_by" bigint,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"order_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"description" text,
	"balance_before" numeric(15, 2),
	"balance_after" numeric(15, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_code_id_discount_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_id_product_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perks_tasks" ADD CONSTRAINT "perks_tasks_reward_product_id_products_id_fk" FOREIGN KEY ("reward_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_plans" ADD CONSTRAINT "product_plans_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_perks" ADD CONSTRAINT "user_perks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_perks" ADD CONSTRAINT "user_perks_task_id_perks_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."perks_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_logs_admin_id_idx" ON "admin_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_logs_entity_type_idx" ON "admin_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE UNIQUE INDEX "discount_codes_code_idx" ON "discount_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "discount_usage_code_id_idx" ON "discount_usage" USING btree ("code_id");--> statement-breakpoint
CREATE INDEX "discount_usage_user_id_idx" ON "discount_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invites_order_id_idx" ON "invites" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "invites_user_id_idx" ON "invites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_product_id_idx" ON "orders" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_plans_product_id_idx" ON "product_plans" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "referral_rewards_referrer_id_idx" ON "referral_rewards" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "schedules_order_id_idx" ON "schedules" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "schedules_date_idx" ON "schedules" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_notifications_user_product_idx" ON "stock_notifications" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_end_date_idx" ON "subscriptions" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ticket_messages_ticket_id_idx" ON "ticket_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "tickets_user_id_idx" ON "tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_perks_user_id_idx" ON "user_perks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_perks_task_id_idx" ON "user_perks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "wallet_transactions_user_id_idx" ON "wallet_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions" USING btree ("type");