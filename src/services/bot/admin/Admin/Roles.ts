export const AdminRoles = {
  SUPER_ADMIN: "super_admin", // مالک ربات — بالاترین دسترسی
  ADMIN: "admin", // ادمین — دسترسی کامل
  SUPPORT: "support", // پشتیبان — تیکت‌ها و سفارش‌ها
} as const;

export type AdminRole = (typeof AdminRoles)[keyof typeof AdminRoles];
