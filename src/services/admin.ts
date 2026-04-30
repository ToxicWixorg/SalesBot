import { Context } from "gramio";
import {
  AdminRepository,
  AdminLogRepository,
  AdminSessionRepository,
} from "../repositories/AdminRepository.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import type { Admin, InsertAdminLog } from "../db/schema.ts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 Admin Permission Sections
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 Admin Roles
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AdminRoles = {
  ADMIN: "admin", // دسترسی کامل
  SUPPORT: "support", // پشتیبانی (تیکت‌ها + سفارش‌ها)
  MANAGER: "manager", // مدیریت محصولات و سفارش‌ها
  OPERATOR: "operator", // اپراتور (فقط مشاهده)
} as const;

export type AdminRole = (typeof AdminRoles)[keyof typeof AdminRoles];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 Default Permissions by Role
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DefaultPermissions: Record<AdminRole, AdminSection[]> = {
  admin: Object.values(AdminSections), // همه چیز
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ Admin Service
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AdminService {
  /**
   * چک کردن اینکه آیا کاربر ادمین است
   */
  static async isAdmin(userId: number): Promise<boolean> {
    const admin = await AdminRepository.findByUserId(userId);
    return !!admin && admin.isActive;
  }

  /**
   * چک کردن اینکه آیا کاربر SuperAdmin است
   */
  static async isSuperAdmin(userId: number): Promise<boolean> {
    const admin = await AdminRepository.findByUserId(userId);
    return !!admin && admin.isActive && admin.isSuperAdmin;
  }

  /**
   * دریافت اطلاعات ادمین
   */
  static async getAdmin(userId: number): Promise<Admin | undefined> {
    return await AdminRepository.findByUserId(userId);
  }

  /**
   * چک کردن دسترسی به یک بخش
   */
  static async hasPermission(
    userId: number,
    section: AdminSection,
  ): Promise<boolean> {
    const admin = await AdminRepository.findByUserId(userId);
    if (!admin || !admin.isActive) return false;

    // SuperAdmin به همه چیز دسترسی دارد
    if (admin.isSuperAdmin) return true;

    // بررسی allowedSections
    const allowedSections = admin.allowedSections as string[] | null;
    if (allowedSections && allowedSections.length > 0) {
      return allowedSections.includes(section);
    }

    // بررسی permissions object
    const permissions = admin.permissions as Record<string, boolean> | null;
    if (permissions && permissions[section] === false) {
      return false;
    }

    // اگر هیچکدام نبود، بر اساس role پیش‌فرض چک کن
    const defaultSections = DefaultPermissions[admin.role as AdminRole] || [];
    return defaultSections.includes(section);
  }

  /**
   * چک کردن دسترسی‌های متعدد
   */
  static async hasAnyPermission(
    userId: number,
    sections: AdminSection[],
  ): Promise<boolean> {
    for (const section of sections) {
      if (await this.hasPermission(userId, section)) {
        return true;
      }
    }
    return false;
  }

  /**
   * چک کردن دسترسی‌های همه
   */
  static async hasAllPermissions(
    userId: number,
    sections: AdminSection[],
  ): Promise<boolean> {
    for (const section of sections) {
      if (!(await this.hasPermission(userId, section))) {
        return false;
      }
    }
    return true;
  }

  /**
   * لاگ کردن عملیات ادمین
   */
  static async logAction(data: {
    userId: number;
    action: string;
    entityType: string;
    entityId?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    description?: string;
    severity?: "info" | "warning" | "critical";
    ipAddress?: string;
    userAgent?: string;
    isSuccess?: boolean;
    errorMessage?: string;
  }): Promise<void> {
    // پیدا کردن admin record
    const admin = await AdminRepository.findByUserId(data.userId);
    if (!admin) {
      console.warn("Admin not found for userId:", data.userId);
      return;
    }

    const logData: InsertAdminLog = {
      adminId: admin.id,
      userId: data.userId as any,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes || null,
      metadata: data.metadata || null,
      description: data.description,
      severity: data.severity || "info",
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      isSuccess: data.isSuccess !== false, // default true
      errorMessage: data.errorMessage,
    };

    await AdminLogRepository.log(logData);

    // به روزرسانی آخرین فعالیت ادمین
    await AdminRepository.updateLastActivity(admin.id);
  }

  /**
   * ایجاد ادمین جدید
   */
  static async createAdmin(data: {
    userId: number;
    role: AdminRole;
    displayName?: string;
    email?: string;
    phone?: string;
    allowedSections?: AdminSection[];
    permissions?: Record<string, boolean>;
    isSuperAdmin?: boolean;
    createdBy: number;
  }): Promise<Admin> {
    // بررسی اینکه آیا user وجود دارد
    const user = await UserRepository.findById(data.userId);
    if (!user) {
      throw new Error("کاربر یافت نشد");
    }

    // ساخت ادمین
    const admin = await AdminRepository.create(
      {
        userId: data.userId as any,
        role: data.role,
        displayName: data.displayName || user.firstName || user.username,
        email: data.email,
        phone: data.phone,
        allowedSections: data.allowedSections || DefaultPermissions[data.role],
        permissions: data.permissions || {},
        isSuperAdmin: data.isSuperAdmin || false,
        isActive: true,
      },
      data.createdBy,
    );

    // لاگ کردن
    await this.logAction({
      userId: data.createdBy,
      action: "create",
      entityType: "admin",
      entityId: admin.id.toString(),
      description: `ادمین جدید ایجاد شد: ${admin.displayName} (${admin.role})`,
      metadata: {
        targetUserId: data.userId,
        role: data.role,
      },
    });

    return admin;
  }

  /**
   * تغییر نقش ادمین
   */
  static async changeRole(
    adminId: number,
    newRole: AdminRole,
    changedBy: number,
  ): Promise<Admin> {
    const admin = await AdminRepository.findById(adminId);
    if (!admin) {
      throw new Error("ادمین یافت نشد");
    }

    const oldRole = admin.role;
    const updated = await AdminRepository.update(adminId, {
      role: newRole,
      allowedSections: DefaultPermissions[newRole],
    });

    // لاگ کردن
    await this.logAction({
      userId: changedBy,
      action: "update",
      entityType: "admin",
      entityId: adminId.toString(),
      changes: {
        role: { from: oldRole, to: newRole },
      },
      description: `نقش ادمین تغییر کرد: ${oldRole} → ${newRole}`,
    });

    return updated;
  }

  /**
   * غیرفعال/فعال کردن ادمین
   */
  static async toggleStatus(
    adminId: number,
    isActive: boolean,
    changedBy: number,
  ): Promise<Admin> {
    const admin = await AdminRepository.findById(adminId);
    if (!admin) {
      throw new Error("ادمین یافت نشد");
    }

    const updated = isActive
      ? await AdminRepository.activate(adminId)
      : await AdminRepository.deactivate(adminId);

    // لاگ کردن
    await this.logAction({
      userId: changedBy,
      action: "update",
      entityType: "admin",
      entityId: adminId.toString(),
      changes: {
        isActive: { from: admin.isActive, to: isActive },
      },
      description: `ادمین ${isActive ? "فعال" : "غیرفعال"} شد`,
      severity: isActive ? "info" : "warning",
    });

    return updated;
  }

  /**
   * حذف ادمین
   */
  static async removeAdmin(adminId: number, removedBy: number): Promise<void> {
    const admin = await AdminRepository.findById(adminId);
    if (!admin) {
      throw new Error("ادمین یافت نشد");
    }

    // لاگ کردن قبل از حذف
    await this.logAction({
      userId: removedBy,
      action: "delete",
      entityType: "admin",
      entityId: adminId.toString(),
      description: `ادمین حذف شد: ${admin.displayName} (${admin.role})`,
      severity: "critical",
      metadata: {
        deletedAdmin: {
          userId: admin.userId,
          role: admin.role,
          displayName: admin.displayName,
        },
      },
    });

    await AdminRepository.delete(adminId);
  }

  /**
   * دریافت لیست ادمین‌ها
   */
  static async getAdminsList(filters?: {
    role?: AdminRole;
    isActive?: boolean;
  }): Promise<Admin[]> {
    if (filters?.role) {
      return await AdminRepository.getByRole(filters.role);
    }
    if (filters?.isActive === false) {
      return (await AdminRepository.getAll()).filter((a) => !a.isActive);
    }
    return await AdminRepository.getAllActive();
  }

  /**
   * دریافت آمار ادمین‌ها
   */
  static async getStats(): Promise<{
    total: number;
    active: number;
    byRole: Record<string, number>;
  }> {
    const all = await AdminRepository.getAll();
    const active = all.filter((a) => a.isActive);

    const byRole: Record<string, number> = {};
    for (const admin of all) {
      byRole[admin.role] = (byRole[admin.role] || 0) + 1;
    }

    return {
      total: all.length,
      active: active.length,
      byRole,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ Admin Guard Middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Middleware برای چک کردن اینکه کاربر ادمین است
 */
export function requireAdmin() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply("❌ دسترسی غیرمجاز");
      return;
    }

    const isAdmin = await AdminService.isAdmin(userId);
    if (!isAdmin) {
      await ctx.reply("❌ شما دسترسی ادمین ندارید");
      return;
    }

    await next();
  };
}

/**
 * Middleware برای چک کردن دسترسی به یک بخش خاص
 */
export function requirePermission(section: AdminSection) {
  return async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply("❌ دسترسی غیرمجاز");
      return;
    }

    const hasPermission = await AdminService.hasPermission(userId, section);
    if (!hasPermission) {
      await ctx.reply(`❌ شما دسترسی به بخش ${section} ندارید`);
      return;
    }

    await next();
  };
}

/**
 * Middleware برای چک کردن SuperAdmin
 */
export function requireSuperAdmin() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply("❌ دسترسی غیرمجاز");
      return;
    }

    const isSuperAdmin = await AdminService.isSuperAdmin(userId);
    if (!isSuperAdmin) {
      await ctx.reply("❌ این عملیات فقط برای SuperAdmin مجاز است");
      return;
    }

    await next();
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 Helper Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * دریافت نام فارسی برای section
 */
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

/**
 * دریافت نام فارسی برای role
 */
export function getRoleName(role: AdminRole): string {
  const names: Record<AdminRole, string> = {
    [AdminRoles.ADMIN]: "ادمین",
    [AdminRoles.SUPPORT]: "پشتیبانی",
    [AdminRoles.MANAGER]: "مدیر",
    [AdminRoles.OPERATOR]: "اپراتور",
  };
  return names[role] || role;
}
