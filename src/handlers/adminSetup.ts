import { AnyBot } from "gramio";
import { db } from "../db/index.ts";
import { adminsTable } from "../db/schema.ts";
import { eq, isNull } from "drizzle-orm";
import { i18n } from "../shared/locales/index.ts";
import { UserRepository } from "../repositories/index.ts";
import { mainMenuKeyboard } from "../shared/keyboards/index.ts";

/**
 * Listens for private text messages from users who have an admin record
 * with no password set yet, and uses their message as the new password.
 */
export function setupAdminSetupHandler(bot: AnyBot): void {
  bot.on("message", async (ctx, next) => {
    if (!ctx.text) return next?.();
    if (ctx.chat?.type !== "private") return next?.();

    const userId = ctx.from?.id;
    if (!userId) return next?.();

    // Check if user has a pending admin record (no password yet)
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.userId, userId))
      .limit(1);

    if (!admin || admin.passwordHash) return next?.();

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "fa");
    const password = ctx.text.trim();

    // Validate password length
    if (password.length < 8) {
      await ctx.send(
        `❌ رمز عبور باید حداقل ۸ کاراکتر باشد.\nلطفاً دوباره ارسال کنید:`,
        { parse_mode: "HTML" },
      );
      return; // consume message, don't pass to next handlers
    }

    // Hash and save the password
    const hash = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db
      .update(adminsTable)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(adminsTable.userId, userId));

    await ctx.send(
      `✅ <b>رمز عبور شما با موفقیت ثبت شد!</b>\n\n` +
        `اکنون می‌توانید با Telegram ID و رمز عبور خود وارد پنل ادمین شوید.\n` +
        `🆔 Telegram ID شما: <code>${userId}</code>`,
      { parse_mode: "HTML" },
    );
    return; // consume message
  });
}
