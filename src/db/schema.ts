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
    role: text("role").default("customer"), // customer, support, admin
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

    order: integer("order").default(0),
    isActive: boolean("is_active").default(true),

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
    ticketNumberIdx: uniqueIndex("tickets_ticket_number_idx").on(table.ticketNumber),
    threadMessageIdIdx: index("tickets_thread_message_id_idx").on(table.threadMessageId),
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
// ⏰ SCHEDULES (Custom Orders) ━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const schedulesTable = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),

    date: text("date").notNull(), // YYYY-MM-DD
    timeSlot: text("time_slot").notNull(), // 09:00-10:00
    capacity: integer("capacity").notNull(),
    currentBookings: integer("current_bookings").default(0),

    reminderSent: boolean("reminder_sent").default(false),
    reminderTime: timestamp("reminder_time"),

    status: text("status").default("available"), // available, full, in_progress, completed
    completedAt: timestamp("completed_at"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("schedules_order_id_idx").on(table.orderId),
    dateIdx: index("schedules_date_idx").on(table.date),
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
// 📝 ADMIN LOGS ━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminLogsTable = pgTable(
  "admin_logs",
  {
    id: serial("id").primaryKey(),
    adminId: bigint("admin_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id),

    action: text("action").notNull(), // create, update, delete, manual_delivery, etc
    entityType: text("entity_type").notNull(), // product, order, user, discount, etc
    entityId: text("entity_id"),

    changes: jsonb("changes"), // {field: {from, to}}
    ipAddress: text("ip_address"),
    description: text("description"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    adminIdIdx: index("admin_logs_admin_id_idx").on(table.adminId),
    entityTypeIdx: index("admin_logs_entity_type_idx").on(table.entityType),
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
