import {
  bigint,
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  varchar,
  decimal,
  jsonb,
  serial,
  uniqueIndex,
  index,
  foreignKey,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const usersTable = pgTable(
  "users",
  {
    id: bigint("id", { mode: "number" }).primaryKey(),
    username: text("username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    languageCode: text("language_code"),

    // Role & Status
    role: text("role").default("customer"), // customer | support | admin | super_admin
    isBlocked: boolean("is_blocked").default(false),
    blockedReason: text("blocked_reason"),

    // Wallet
    walletBalance: decimal("wallet_balance", {
      precision: 15,
      scale: 2,
    }).default("0"),

    // Referral
    referralCode: text("referral_code").unique(),
    referredBy: bigint("referred_by", { mode: "number" }),

    // Notification Settings
    notifyOrders: boolean("notify_orders").default(true), // Order status updates
    notifyWallet: boolean("notify_wallet").default(true), // Wallet transactions
    notifyPromotions: boolean("notify_promotions").default(true), // Promotions & offers
    notifyReferrals: boolean("notify_referrals").default(true), // Referral updates
    notifyStock: boolean("notify_stock").default(true), // Stock notifications

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛍️ PRODUCTS ━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  customEmojiId: text("custom_emoji_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Category = typeof categoriesTable.$inferSelect;
export type InsertCategory = typeof categoriesTable.$inferInsert;

export const productsTable = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    image: text("image"),
    categoryId: integer("category_id").references(() => categoriesTable.id),

    // Delivery Type: automatic, manual, custom_schedule, invite, code, family_join, renewable, reservation
    deliveryType: text("delivery_type").notNull(),

    // Product Requirements
    requiresEmail: boolean("requires_email").default(false),
    requiresOtp: boolean("requires_otp").default(false),
    requiresLogin: boolean("requires_login").default(false),
    requiresRegion: boolean("requires_region").default(false),

    // Features
    isRenewable: boolean("is_renewable").default(false),
    canUnlockPerks: boolean("can_unlock_perks").default(false),
    canNotifyStock: boolean("can_notify_stock").default(true),

    // Status
    isActive: boolean("is_active").default(true),
    stock: integer("stock").default(0),
    minStock: integer("min_stock").default(5),

    // Inventory / Sale settings
    warrantyDays: integer("warranty_days").default(0),
    terms: text("terms"),
    maxPerUser: integer("max_per_user").default(0), // 0 = unlimited

    customEmojiId: text("custom_emoji_id"),

    // Regions available for this product (e.g. [{flag:"🇪🇬", name:"Egypt"}])
    regions: jsonb("regions")
      .$type<{ flag: string; name: string }[]>()
      .default([]),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
    slugIdx: index("products_slug_idx").on(table.slug),
  }),
);

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;

export const productPlansTable = pgTable(
  "product_plans",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 15, scale: 2 }).notNull(),
    duration: integer("duration"), // در روز (null = یکبار)
    durationUnit: text("duration_unit"), // day, month, year

    // Per-plan delivery requirements (override product-level defaults)
    requiresEmail: boolean("requires_email").default(false),
    requiresOtp: boolean("requires_otp").default(false),
    requiresLogin: boolean("requires_login").default(false),
    requiresRegion: boolean("requires_region").default(false),

    // Regions per plan (overrides product-level regions). Each entry can have its own price.
    regions: jsonb("regions")
      .$type<{ flag: string; name: string; price: string }[]>()
      .default([]),

    order: integer("order").default(0),
    isActive: boolean("is_active").default(true),

    customEmojiId: text("custom_emoji_id"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    productIdIdx: index("product_plans_product_id_idx").on(table.productId),
  }),
);

export type ProductPlan = typeof productPlansTable.$inferSelect;
export type InsertProductPlan = typeof productPlansTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 ORDERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ordersTable = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id),
    planId: integer("plan_id")
      .notNull()
      .references(() => productPlansTable.id),

    // Order Info
    status: text("status").default("pending_payment"), // pending_payment, paid, pending_admin, waiting_schedule, scheduled, in_progress, completed, cancelled, refunded
    quantity: integer("quantity").default(1),

    // Payment
    totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", {
      precision: 15,
      scale: 2,
    }).default("0"),
    walletUsed: decimal("wallet_used", { precision: 15, scale: 2 }).default(
      "0",
    ),
    finalPrice: decimal("final_price", { precision: 15, scale: 2 }).notNull(),
    paymentMethod: text("payment_method"), // card, zarinpal, crypto, wallet
    paymentId: text("payment_id"),

    // Discount
    discountCodeId: integer("discount_code_id"),

    // Custom Order Scheduling
    scheduledTime: timestamp("scheduled_time"),
    schedule: jsonb("schedule"), // {"date": "...", "timeSlot": "..."}

    // Delivery Data
    delivery: jsonb("delivery"), // {email, code, link, etc}
    deliveredAt: timestamp("delivered_at"),

    // Additional
    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    statusIdx: index("orders_status_idx").on(table.status),
    productIdIdx: index("orders_product_id_idx").on(table.productId),
  }),
);

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 SUBSCRIPTIONS (Renewable) ━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    orderId: integer("order_id")
      .notNull()
      .references(() => ordersTable.id),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    renewalDate: timestamp("renewal_date"),

    status: text("status").default("active"), // active, expiring_soon, expired, cancelled
    reminderSent: boolean("reminder_sent").default(false),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
    endDateIdx: index("subscriptions_end_date_idx").on(table.endDate),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  }),
);

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 WALLET ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const walletTransactionsTable = pgTable(
  "wallet_transactions",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    orderId: integer("order_id").references(() => ordersTable.id),

    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    type: text("type").notNull(), // credit, debit
    source: text("source").notNull(), // purchase, recharge, refund, referral, reward, perk
    description: text("description"),

    balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }),
    balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("wallet_transactions_user_id_idx").on(table.userId),
    typeIdx: index("wallet_transactions_type_idx").on(table.type),
  }),
);

export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
export type InsertWalletTransaction =
  typeof walletTransactionsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎫 TICKETS (Forum-Based System) ━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ticketsTable = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    orderId: integer("order_id").references(() => ordersTable.id),

    // Telegram Forum Group Info
    forumGroupId: bigint("forum_group_id", { mode: "number" }), // Support Group Chat ID
    topicId: integer("topic_id"), // 2=Support, 3=Orders, 4=Reports
    threadMessageId: bigint("thread_message_id", { mode: "number" }), // First message in thread

    // Ticket Info
    ticketNumber: text("ticket_number").notNull().unique(), // T-1001, O-5001, R-8001
    type: text("type").notNull(), // support, order, report
    title: text("title").notNull(),
    description: text("description"),

    status: text("status").default("open"), // open, waiting_user, waiting_support, in_progress, resolved, closed, blocked
    priority: text("priority").default("normal"), // low, normal, high, urgent

    // Assignment
    assignedTo: bigint("assigned_to", { mode: "number" }).references(
      () => usersTable.id,
    ),
    assignedAt: timestamp("assigned_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    closedAt: timestamp("closed_at"),
    firstResponseAt: timestamp("first_response_at"), // SLA tracking

    // Stats
    messageCount: integer("message_count").default(0),
    lastMessageAt: timestamp("last_message_at"),
  },
  (table) => ({
    userIdIdx: index("tickets_user_id_idx").on(table.userId),
    statusIdx: index("tickets_status_idx").on(table.status),
    typeIdx: index("tickets_type_idx").on(table.type),
    ticketNumberIdx: uniqueIndex("tickets_ticket_number_idx").on(
      table.ticketNumber,
    ),
    threadMessageIdIdx: index("tickets_thread_message_id_idx").on(
      table.threadMessageId,
    ),
  }),
);

export type Ticket = typeof ticketsTable.$inferSelect;
export type InsertTicket = typeof ticketsTable.$inferInsert;

export const ticketMessagesTable = pgTable(
  "ticket_messages",
  {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => ticketsTable.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id),

    // Telegram Message Info
    messageId: bigint("message_id", { mode: "number" }), // For syncing with forum

    message: text("message").notNull(),
    attachments: jsonb("attachments"), // [{url, filename, type}]

    // Message Type
    isFromUser: boolean("is_from_user").default(true), // true = user, false = support
    isSystemMessage: boolean("is_system_message").default(false), // Auto messages

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index("ticket_messages_ticket_id_idx").on(table.ticketId),
    messageIdIdx: index("ticket_messages_message_id_idx").on(table.messageId),
  }),
);

export type TicketMessage = typeof ticketMessagesTable.$inferSelect;
export type InsertTicketMessage = typeof ticketMessagesTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎁 DISCOUNT CODES ━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const discountCodesTable = pgTable(
  "discount_codes",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    description: text("description"),

    // Discount Type
    type: text("type").notNull(), // percentage, fixed
    value: decimal("value", { precision: 15, scale: 2 }).notNull(),
    maxDiscount: decimal("max_discount", { precision: 15, scale: 2 }), // برای percentage

    // Limitations
    minOrderAmount: decimal("min_order_amount", { precision: 15, scale: 2 }),
    maxUses: integer("max_uses"),
    maxUsesPerUser: integer("max_uses_per_user").default(1),
    currentUses: integer("current_uses").default(0),

    // Product & User Specific
    productIds: jsonb("product_ids"), // null = همه محصولات
    userIds: jsonb("user_ids"), // null = همه کاربران

    // Date
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("discount_codes_code_idx").on(table.code),
  }),
);

export type DiscountCode = typeof discountCodesTable.$inferSelect;
export type InsertDiscountCode = typeof discountCodesTable.$inferInsert;

export const discountUsageTable = pgTable(
  "discount_usage",
  {
    id: serial("id").primaryKey(),
    codeId: integer("code_id")
      .notNull()
      .references(() => discountCodesTable.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id),
    orderId: integer("order_id").references(() => ordersTable.id),

    discountAmount: decimal("discount_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    usedAt: timestamp("used_at").defaultNow(),
  },
  (table) => ({
    codeIdIdx: index("discount_usage_code_id_idx").on(table.codeId),
    userIdIdx: index("discount_usage_user_id_idx").on(table.userId),
  }),
);

export type DiscountUsage = typeof discountUsageTable.$inferSelect;
export type InsertDiscountUsage = typeof discountUsageTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 REFERRAL ━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const referralRewardsTable = pgTable(
  "referral_rewards",
  {
    id: serial("id").primaryKey(),
    referrerId: bigint("referrer_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    referredUserId: bigint("referred_user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id),

    rewardType: text("reward_type").notNull(), // wallet_credit, discount
    rewardValue: decimal("reward_value", { precision: 15, scale: 2 }).notNull(),

    status: text("status").default("pending"), // pending, awarded, cancelled
    awardedAt: timestamp("awarded_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    referrerIdIdx: index("referral_rewards_referrer_id_idx").on(
      table.referrerId,
    ),
  }),
);

export type ReferralReward = typeof referralRewardsTable.$inferSelect;
export type InsertReferralReward = typeof referralRewardsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 PERKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const perksTasksTable = pgTable("perks_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),

  // Task Type
  type: text("type").notNull(), // join_channel, invite_friend, instagram_story, tweet, review, first_purchase, renew_subscription, complete_profile
  taskData: jsonb("task_data"), // {channel_username, followers_count, etc}

  rewardType: text("reward_type").notNull(), // wallet_credit, discount, free_product
  rewardValue: decimal("reward_value", { precision: 15, scale: 2 }),
  rewardProductId: integer("reward_product_id").references(
    () => productsTable.id,
  ),

  maxRewards: integer("max_rewards"), // null = unlimited
  currentRewards: integer("current_rewards").default(0),

  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").defaultNow(),
});

export type PerksTask = typeof perksTasksTable.$inferSelect;
export type InsertPerksTask = typeof perksTasksTable.$inferInsert;

export const userPerksTable = pgTable(
  "user_perks",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    taskId: integer("task_id")
      .notNull()
      .references(() => perksTasksTable.id),

    status: text("status").default("pending"), // pending, completed, verified, claimed
    verificationData: jsonb("verification_data"),

    completedAt: timestamp("completed_at"),
    claimedAt: timestamp("claimed_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_perks_user_id_idx").on(table.userId),
    taskIdIdx: index("user_perks_task_id_idx").on(table.taskId),
  }),
);

export type UserPerks = typeof userPerksTable.$inferSelect;
export type InsertUserPerks = typeof userPerksTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏰ TIME SLOT TEMPLATES (Admin-defined)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const timeSlotTemplatesTable = pgTable("time_slot_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. "Morning Session"
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "10:00"
  capacity: integer("capacity").notNull().default(1), // max concurrent sessions per day
  productIds: jsonb("product_ids"), // null = all products
  daysOfWeek: jsonb("days_of_week").default([0, 1, 2, 3, 4, 5, 6]).notNull(), // 0=Sun ... 6=Sat
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TimeSlotTemplate = typeof timeSlotTemplatesTable.$inferSelect;
export type InsertTimeSlotTemplate = typeof timeSlotTemplatesTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏰ SCHEDULES (Per-booking) ━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const schedulesTable = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(),
    // Link to the template that defines this time window
    templateId: integer("template_id").references(
      () => timeSlotTemplatesTable.id,
      { onDelete: "set null" },
    ),
    // The order this booking belongs to (nullable for admin-created slots)
    orderId: integer("order_id").references(() => ordersTable.id, {
      onDelete: "cascade",
    }),
    // The user who booked (for quick lookup without joining orders)
    userId: bigint("user_id", { mode: "number" }).references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),

    date: text("date").notNull(), // YYYY-MM-DD
    timeSlot: text("time_slot").notNull(), // "09:00-10:00"
    capacity: integer("capacity").notNull().default(1),
    currentBookings: integer("current_bookings").default(0),

    reminderSent: boolean("reminder_sent").default(false),
    reminderTime: timestamp("reminder_time"),

    // Session chat tracking (for custom_schedule / ChatGPT delivery sessions)
    sessionStartNotified: boolean("session_start_notified").default(false), // true after T=0 notifications sent
    sessionTicketId: integer("session_ticket_id").references(
      () => ticketsTable.id,
      { onDelete: "set null" },
    ),

    status: text("status").default("available"), // available, full, in_progress, completed
    completedAt: timestamp("completed_at"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("schedules_order_id_idx").on(table.orderId),
    userIdIdx: index("schedules_user_id_idx").on(table.userId),
    dateIdx: index("schedules_date_idx").on(table.date),
    templateDateIdx: index("schedules_template_date_idx").on(
      table.templateId,
      table.date,
    ),
  }),
);

export type Schedule = typeof schedulesTable.$inferSelect;
export type InsertSchedule = typeof schedulesTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔔 STOCK NOTIFICATIONS ━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const stockNotificationsTable = pgTable(
  "stock_notifications",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),

    isActive: boolean("is_active").default(true),
    notificationSent: boolean("notification_sent").default(false),
    notificationSentAt: timestamp("notification_sent_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdProductIdIdx: uniqueIndex("stock_notifications_user_product_idx").on(
      table.userId,
      table.productId,
    ),
  }),
);

export type StockNotification = typeof stockNotificationsTable.$inferSelect;
export type InsertStockNotification =
  typeof stockNotificationsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 PRODUCT CONFIGS (VPN / Digital Keys)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const productConfigsTable = pgTable(
  "product_configs",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    planId: integer("plan_id").references(() => productPlansTable.id, {
      onDelete: "set null",
    }),

    // The actual config/key/link to deliver
    configData: text("config_data").notNull(), // VPN config link, activation key, etc.
    label: text("label"), // Optional label (e.g. "Server US-1")

    // Usage tracking
    isUsed: boolean("is_used").default(false),
    orderId: integer("order_id").references(() => ordersTable.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    productIdIdx: index("product_configs_product_id_idx").on(table.productId),
    planIdIdx: index("product_configs_plan_id_idx").on(table.planId),
    isUsedIdx: index("product_configs_is_used_idx").on(table.isUsed),
  }),
);

export type ProductConfig = typeof productConfigsTable.$inferSelect;
export type InsertProductConfig = typeof productConfigsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// � INVENTORY ━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const inventoryTable = pgTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),

    // Credentials / delivery data
    email: text("email"),
    password: text("password"),
    extraData: text("extra_data"), // any extra info (e.g. backup codes, notes)
    content: text("content"), // free-form delivery content (replaces email/password for simple items)

    // Status: available | reserved | used | dead
    status: text("status").notNull().default("available"),

    reservedAt: timestamp("reserved_at"),
    usedAt: timestamp("used_at"),
    usedByOrderId: integer("used_by_order_id").references(
      () => ordersTable.id,
      { onDelete: "set null" },
    ),
    deadReason: text("dead_reason"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    productIdIdx: index("inventory_product_id_idx").on(table.productId),
    statusIdx: index("inventory_status_idx").on(table.status),
  }),
);

export type Inventory = typeof inventoryTable.$inferSelect;
export type InsertInventory = typeof inventoryTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// �📝 ADMIN LOGS ━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminLogsTable = pgTable(
  "admin_logs",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => adminsTable.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id), // Link to user account

    // Action Info
    action: text("action").notNull(), // create, update, delete, approve, reject, manual_delivery, assign_ticket, broadcast, etc
    entityType: text("entity_type").notNull(), // product, order, user, ticket, discount, wallet, admin, settings, etc
    entityId: text("entity_id"),

    // Changes & Details
    changes: jsonb("changes"), // {field: {from, to}}
    metadata: jsonb("metadata"), // Additional context data
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    description: text("description"),

    // Severity
    severity: text("severity").default("info"), // info, warning, critical

    // Status
    isSuccess: boolean("is_success").default(true),
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    adminIdIdx: index("admin_logs_admin_id_idx").on(table.adminId),
    userIdIdx: index("admin_logs_user_id_idx").on(table.userId),
    entityTypeIdx: index("admin_logs_entity_type_idx").on(table.entityType),
    actionIdx: index("admin_logs_action_idx").on(table.action),
    createdAtIdx: index("admin_logs_created_at_idx").on(table.createdAt),
  }),
);

export type AdminLog = typeof adminLogsTable.$inferSelect;
export type InsertAdminLog = typeof adminLogsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 INVITE TRACKING ━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const invitesTable = pgTable(
  "invites",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id),

    email: text("email").notNull(),
    status: text("status").default("pending"), // pending, sent, accepted, rejected
    sentAt: timestamp("sent_at"),
    acceptedAt: timestamp("accepted_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("invites_order_id_idx").on(table.orderId),
    userIdIdx: index("invites_user_id_idx").on(table.userId),
  }),
);

export type Invite = typeof invitesTable.$inferSelect;
export type InsertInvite = typeof invitesTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 ADMINS & PERMISSIONS ━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminsTable = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .unique()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Admin Info
    displayName: text("display_name"),
    email: text("email"),
    phone: text("phone"),

    // Role & Status
    role: text("role").notNull().default("support"), // super_admin | admin | support
    isActive: boolean("is_active").default(true),
    isSuperAdmin: boolean("is_super_admin").default(false),

    // Permissions (flexible permission system)
    permissions: jsonb("permissions").default("{}"), // {"products": true, "orders": true, "tickets": true, etc}

    // Access Control
    allowedSections: jsonb("allowed_sections"), // ["products", "orders", "tickets", "users", "wallet", "discounts", "referrals", "perks", "schedules", "broadcast", "settings"]
    restrictedIPs: jsonb("restricted_ips"), // ["192.168.1.1"] - if set, only these IPs

    // Stats & Activity
    lastLoginAt: timestamp("last_login_at"),
    lastActivityAt: timestamp("last_activity_at"),
    loginCount: integer("login_count").default(0),

    // Notes
    notes: text("notes"), // Internal notes about this admin

    // Auth
    passwordHash: text("password_hash"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: bigint("created_by", { mode: "number" }).references(
      () => usersTable.id,
    ),
  },
  (table) => ({
    userIdIdx: uniqueIndex("admins_user_id_idx").on(table.userId),
    roleIdx: index("admins_role_idx").on(table.role),
    isActiveIdx: index("admins_is_active_idx").on(table.isActive),
  }),
);

export type Admin = typeof adminsTable.$inferSelect;
export type InsertAdmin = typeof adminsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 ADMIN SESSIONS (for TMA) ━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminSessionsTable = pgTable(
  "admin_sessions",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => adminsTable.id, { onDelete: "cascade" }),

    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    expiresAt: timestamp("expires_at").notNull(),
    lastActivityAt: timestamp("last_activity_at"),

    isValid: boolean("is_valid").default(true),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("admin_sessions_token_idx").on(table.token),
    adminIdIdx: index("admin_sessions_admin_id_idx").on(table.adminId),
    expiresAtIdx: index("admin_sessions_expires_at_idx").on(table.expiresAt),
  }),
);

export type AdminSession = typeof adminSessionsTable.$inferSelect;
export type InsertAdminSession = typeof adminSessionsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 FORCE JOIN CHANNELS ━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const forceJoinChannelsTable = pgTable("force_join_channels", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull(), // e.g. "@MyChannel" or "-1001234567890"
  channelUrl: text("channel_url").notNull(), // invite link or t.me link
  channelName: text("channel_name").notNull(), // display name shown to user
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ForceJoinChannel = typeof forceJoinChannelsTable.$inferSelect;
export type InsertForceJoinChannel = typeof forceJoinChannelsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 PAYMENT SETTINGS ━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// شماره کارت‌های بانکی (چند کارت)
export const paymentCardNumbersTable = pgTable("payment_card_numbers", {
  id: serial("id").primaryKey(),
  cardNumber: text("card_number").notNull(), // e.g. 6037-9975-1234-5678
  holderName: text("holder_name").notNull(), // نام صاحب کارت
  bankName: text("bank_name"), // نام بانک
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PaymentCardNumber = typeof paymentCardNumbersTable.$inferSelect;
export type InsertPaymentCardNumber =
  typeof paymentCardNumbersTable.$inferInsert;

// تنظیمات درگاه‌های پرداخت (ردیف واحد id=1)
export const paymentSettingsTable = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  // Card
  cardEnabled: boolean("card_enabled").default(true),
  // Zarinpal
  zarinpalEnabled: boolean("zarinpal_enabled").default(false),
  zarinpalMerchantId: text("zarinpal_merchant_id"),
  zarinpalSandbox: boolean("zarinpal_sandbox").default(true),
  // Crypto / USDT
  cryptoEnabled: boolean("crypto_enabled").default(false),
  cryptoAddress: text("crypto_address"),
  cryptoNetwork: text("crypto_network").default("TRC20"), // TRC20 | ERC20 | BEP20
  cryptoExchangeRate: integer("crypto_exchange_rate").default(0), // نرخ تومان به USDT (دستی)
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PaymentSettings = typeof paymentSettingsTable.$inferSelect;
export type InsertPaymentSettings = typeof paymentSettingsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 BACKUP SETTINGS ━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const backupSettingsTable = pgTable("backup_settings", {
  id: serial("id").primaryKey(),
  isEnabled: boolean("is_enabled").default(false),
  telegramChannelId: text("telegram_channel_id"), // channel to send backup file
  cronSchedule: text("cron_schedule").default("0 3 * * *"), // daily 3am
  lastBackupAt: timestamp("last_backup_at"),
  lastBackupStatus: text("last_backup_status"), // success | failed
  lastBackupSize: integer("last_backup_size"), // bytes
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BackupSettings = typeof backupSettingsTable.$inferSelect;
export type InsertBackupSettings = typeof backupSettingsTable.$inferInsert;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ BOT SETTINGS ━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Single-row table (id=1) — global bot configuration
export const botSettingsTable = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  maintenanceMode: boolean("maintenance_mode").default(false),
  maintenanceMessage: text("maintenance_message"), // optional custom message
  referralEnabled: boolean("referral_enabled").default(true),
  shopEnabled: boolean("shop_enabled").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BotSettings = typeof botSettingsTable.$inferSelect;
export type InsertBotSettings = typeof botSettingsTable.$inferInsert;
