import { Context } from "gramio";
import { AdminService } from "../Service";

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
