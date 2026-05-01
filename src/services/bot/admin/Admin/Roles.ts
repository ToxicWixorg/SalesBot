export const AdminRoles = {
  ADMIN: "admin", // دسترسی کامل
  SUPPORT: "support", // پشتیبانی (تیکت‌ها + سفارش‌ها)
  MANAGER: "manager", // مدیریت محصولات و سفارش‌ها
  OPERATOR: "operator", // اپراتور (فقط مشاهده)
} as const;

export type AdminRole = (typeof AdminRoles)[keyof typeof AdminRoles];
