import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { ReferralRepository } from "../repositories/ReferralRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";
import { mainMenuKeyboard } from "../shared/keyboards/index.ts";
import { sendNewUserNotification } from "../services/forum-notifications.ts";

function generateReferralCode(userId: number): string {
  return `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const startComposer = new Composer()
  .extend(composer)
  .command("start", async (context) => {
    if (context.scene?.current) {
      await context.scene.exit();
    }

    if (!context.from) {
      return context.send("❌ Unable to identify user.");
    }

    const userId = context.from.id;
    const username = context.from.username || null;
    const firstName = context.from.firstName || null;
    const lastName = context.from.lastName || null;

    let user = await UserRepository.findById(userId);

    if (!user) {
      const startPayload = context.args;
      let referrerId: number | null = null;

      if (startPayload && startPayload.startsWith("ref_")) {
        const referralCode = startPayload.replace("ref_", "");
        const referrer = await UserRepository.findByReferralCode(referralCode);
        if (referrer) {
          referrerId = referrer.id;
          console.log("[START] Referrer found:", referrerId);
        }
      }

      const { user: newUser } = await UserRepository.create({
        id: userId,
        username,
        firstName,
        lastName,
        languageCode: null,
        referralCode: generateReferralCode(userId),
        referredBy: referrerId,
      });
      user = newUser;

      sendNewUserNotification(context.bot.api as any, user).catch(() => {});

      if (referrerId) {
        try {
          await ReferralRepository.autoRewardReferrer(referrerId, userId);

          try {
            const referrer = await UserRepository.findById(referrerId);
            if (referrer) {
              const referrerT = i18n.buildT(referrer.languageCode || "en");
              const newUserName = firstName || username || `User ${userId}`;
              const rewardAmount = "10,000";

              const message = referrerT("referralRewardNotification", {
                userName: newUserName,
                amount: rewardAmount,
              });

              await context.bot.api.sendMessage({
                chat_id: referrerId,
                text: message,
              });
            }
          } catch (msgError) {
            console.error(
              "[START] Failed to send message to referrer:",
              msgError,
            );
          }
        } catch (error) {
          console.error("[START] Failed to grant referral reward:", error);
        }
      }
    }

    if (!user.languageCode || user.languageCode === "null") {
      // console.log("[START] No language set, entering language selection scene");
      await context.scene.enter(languageSelectionScene);
      return;
    }

    // console.log("[START] Sending welcome message and main menu");

    const t = i18n.buildT(user.languageCode);
    const userName = firstName || username || "User";

    await context.send(t("welcome", userName));

    return context.send(`${t("mainMenu")} \n\n${t("chooseAction")}`, {
      reply_markup: mainMenuKeyboard(t),
    });
  })
  .callbackQuery("main_menu", async (context) => {
    if (!context.from) {
      return context.answerCallbackQuery({
        text: "❌ Unable to identify user.",
        show_alert: true,
      });
    }

    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      return context.answerCallbackQuery({
        text: "❌ User not found.",
        show_alert: true,
      });
    }

    const userLang =
      user.languageCode && user.languageCode !== "null"
        ? user.languageCode
        : "en";
    const t = i18n.buildT(userLang);

    try {
      await context.editText(t("mainMenu") + "\n\n" + t("chooseAction"), {
        reply_markup: mainMenuKeyboard(t),
      });
    } catch (error: any) {
      // Ignore "message is not modified" error
      if (error?.message?.includes("message is not modified")) {
        await context.answerCallbackQuery();
        return;
      }
      throw error;
    }

    await context.answerCallbackQuery();
  });
