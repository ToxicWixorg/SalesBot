import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { ReferralRepository } from "../repositories/ReferralRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";
import { mainMenuKeyboard } from "../shared/keyboards/index.ts";

function generateReferralCode(userId: number): string {
  return `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const startComposer = new Composer()
  .extend(composer)
  .command("start", async (context) => {
    // console.log("[START] Command received from user:", context.from?.id);

    if (context.scene?.current) {
      // console.log("[START] Exiting active scene:", context.scene.current);
      await context.scene.exit();
    }

    if (!context.from) {
      // console.log("[START] No user context, returning error");
      return context.send("❌ Unable to identify user.");
    }

    const userId = context.from.id;
    const username = context.from.username || null;
    const firstName = context.from.firstName || null;
    const lastName = context.from.lastName || null;

    // console.log("[START] Looking up user in database:", userId);
    let user = await UserRepository.findById(userId);

    if (!user) {
      // console.log("[START] User not found, creating new user");
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
      console.log("[START] New user created successfully");

      // اگر کاربر توسط شخصی دعوت شده، پاداش بده
      if (referrerId) {
        try {
          await ReferralRepository.autoRewardReferrer(referrerId, userId);
          console.log("[START] Referral reward granted to:", referrerId);
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

    return context.send(`${t("mainMenu")} :`, {
      reply_markup: mainMenuKeyboard(t),
    });
  })
  .callbackQuery("main_menu", async (context) => {
    console.log("[MAIN_MENU] Callback received from user:", context.from?.id);

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

    const t = i18n.buildT(user.languageCode || "en");

    await context.editText(t("mainMenu") + "\n\n" + t("chooseAction"), {
      reply_markup: mainMenuKeyboard(t),
    });

    await context.answerCallbackQuery();
  });
