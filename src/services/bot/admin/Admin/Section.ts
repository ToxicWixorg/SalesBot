export const AdminSections = {
  PRODUCTS: "products",
  ORDERS: "orders",
  TICKETS: "tickets",
  USERS: "users",
  WALLET: "wallet",
  DISCOUNTS: "discounts",
  REFERRALS: "referrals",
  PERKS: "perks",
  SCHEDULES: "schedules",
  BROADCAST: "broadcast",
  SETTINGS: "settings",
  ADMINS: "admins",
  LOGS: "logs",
} as const;

export type AdminSection = (typeof AdminSections)[keyof typeof AdminSections];
