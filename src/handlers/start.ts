import { Composer, InlineKeyboard } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";

function generateReferralCode(userId: number): string {
  return `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const startComposer = new Composer()
  .extend(composer)
  .command("start", async (context) => {
    console.log("[START] Command received from user:", context.from?.id);

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
    }

    if (!user.languageCode || user.languageCode === "null") {
      await context.scene.enter(languageSelectionScene);
      return;
    }

    const t = i18n.buildT(user.languageCode);
    const userName = firstName || username || "User";

    await context.send(t("welcome", userName));

    const mainMenuKeyboard = new InlineKeyboard()
      .text(t("btnProducts"), "products")
      .text(t("btnMyOrders"), "my_orders")
      .row()
      .text(t("btnWallet"), "wallet")
      .text(t("btnInviteFriends"), "invite")
      .row()
      .text(t("btnDiscountCode"), "discount")
      .text(t("btnSupport"), "support")
      .row()
      .text(t("btnSettings"), "settings");

    return context.send(t("mainMenu") + "\n\n" + t("chooseAction"), {
      reply_markup: mainMenuKeyboard,
    });
  });
