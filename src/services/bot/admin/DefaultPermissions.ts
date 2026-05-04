import { AdminRoles, AdminRole } from "./Admin/Roles";
import { AdminSections, AdminSection } from "./Admin/Section";

export const DefaultPermissions: Record<AdminRole, AdminSection[]> = {
  super_admin: Object.values(AdminSections),
  admin: Object.values(AdminSections),
  support: [AdminSections.TICKETS, AdminSections.ORDERS, AdminSections.USERS],
};
