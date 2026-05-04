import { AdminRole, AdminRoles } from "./Admin/Roles";

export function getRoleName(role: AdminRole): string {
  const names: Record<AdminRole, string> = {
    [AdminRoles.SUPER_ADMIN]: "مالک ربات",
    [AdminRoles.ADMIN]: "ادمین",
    [AdminRoles.SUPPORT]: "پشتیبانی",
  };
  return names[role] || role;
}
