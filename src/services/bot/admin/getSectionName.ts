import { AdminSection, AdminSections } from "./Admin/Section";

export function getSectionName(section: AdminSection): string {
  const names: Record<AdminSection, string> = {
    [AdminSections.PRODUCTS]: "محصولات",
    [AdminSections.ORDERS]: "سفارش‌ها",
    [AdminSections.TICKETS]: "تیکت‌ها",
    [AdminSections.USERS]: "کاربران",
    [AdminSections.WALLET]: "کیف پول",
    [AdminSections.DISCOUNTS]: "تخفیف‌ها",
    [AdminSections.REFERRALS]: "ریفرال",
    [AdminSections.PERKS]: "Perks",
    [AdminSections.SCHEDULES]: "زمان‌بندی",
    [AdminSections.BROADCAST]: "ارسال همگانی",
    [AdminSections.SETTINGS]: "تنظیمات",
    [AdminSections.ADMINS]: "مدیریت ادمین‌ها",
    [AdminSections.LOGS]: "لاگ‌ها",
  };
  return names[section] || section;
}
