import { AdminRoles, AdminRole } from "./Admin/Roles";
import { AdminSections, AdminSection } from "./Admin/Section";

export const DefaultPermissions: Record<AdminRole, AdminSection[]> = {
  admin: Object.values(AdminSections),
  support: [AdminSections.TICKETS, AdminSections.ORDERS, AdminSections.USERS],
  manager: [
    AdminSections.PRODUCTS,
    AdminSections.ORDERS,
    AdminSections.DISCOUNTS,
    AdminSections.SCHEDULES,
    AdminSections.USERS,
  ],
  operator: [
    AdminSections.ORDERS,
    AdminSections.TICKETS,
    AdminSections.PRODUCTS,
  ],
};
