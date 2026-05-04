import { Context } from "gramio";
import { AdminService } from "../Service";
import { isOwner } from "../../../../config";

export function requireSuperAdmin() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply("❌ دسترسی غیرمجاز");
      return;
    }

    if (isOwner(userId)) {
      await next();
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
