import { AdminRole, AdminRoles } from "./Admin/Roles";

export function getRoleName(role: AdminRole): string {
  const names: Record<AdminRole, string> = {
    [AdminRoles.ADMIN]: "ادمین",
    [AdminRoles.SUPPORT]: "پشتیبانی",
    [AdminRoles.MANAGER]: "مدیر",
    [AdminRoles.OPERATOR]: "اپراتور",
  };
  return names[role] || role;
}
