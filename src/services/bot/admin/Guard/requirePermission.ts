import { Context } from "gramio";
import { AdminSection } from "../Admin/Section";
import { AdminService } from "../Service";

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
