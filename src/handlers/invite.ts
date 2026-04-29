import { Composer } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { ReferralRepository } from "../repositories/ReferralRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import {
  inviteMainKeyboard,
  referralListBackKeyboard,
} from "../shared/keyboards/index.ts";
import { config } from "../config.ts";

export const inviteComposer = new Composer()
  .extend(composer)
  .callbackQuery("invite", async (context) => {
    console.log("[INVITE] Callback received from user:", context.from?.id);

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

    const stats = await ReferralRepository.getReferralStats(userId);

    const botInfo = await context.bot.api.getMe();
    const botUsername = botInfo.username || "your_bot";
    const referralLink = `https://t.me/${botUsername}?start=ref_${user.referralCode}`;

    const bannerMessage = t("inviteBanner", {
      totalReferrals: stats.totalReferrals,
      totalRewards: stats.totalRewards,
      referralLink: referralLink,
    });

    const keyboard = inviteMainKeyboard(t, referralLink, user.referralCode);

    await context.answerCallbackQuery();

    return context.editText(bannerMessage, {
      reply_markup: keyboard,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  })
  .callbackQuery("view_referrals", async (context) => {
    console.log("[INVITE] View referrals callback");

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

    const t = i18n.buildT(user.languageCode || "em");

    const referredUsers = await ReferralRepository.getReferredUsers(userId);
    const rewardHistory = await ReferralRepository.getRewardHistory(userId);

    if (referredUsers.length === 0) {
      await context.answerCallbackQuery({
        text: t("noReferralsYet"),
        show_alert: true,
      });
      return;
    }

    let message = `${t("referralListTitle")}\n\n`;

    for (let i = 0; i < referredUsers.length && i < 10; i++) {
      const referred = referredUsers[i];
      const name = referred.firstName || referred.username || "User";
      const date = new Date(referred.createdAt!).toLocaleDateString("fa-IR");

      const reward = rewardHistory.find(
        (r) => r.referredUserId === referred.id,
      );
      const rewardStatus = reward
        ? reward.status === "awarded"
          ? "✅"
          : "⏳"
        : "❌";

      message += `${i + 1}. ${name} - ${date} ${rewardStatus}\n`;
    }

    if (referredUsers.length > 10) {
      message += `\n${t("andMore", referredUsers.length - 10)}`;
    }

    const keyboard = referralListBackKeyboard(t);

    await context.answerCallbackQuery();

    return context.editText(message, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  });

//   .callbackQuery(/copy_invite_(.+)/, async (context) => {
//   console.log("[INVITE] Copy link callback");

//   if (!context.from) {
//     return context.answerCallbackQuery({
//       text: "❌ Unable to identify user.",
//       show_alert: true,
//     });
//   }

//   const userId = context.from.id;
//   const user = await UserRepository.findById(userId);

//   if (!user) {
//     return context.answerCallbackQuery({
//       text: "❌ User not found.",
//       show_alert: true,
//     });
//   }

//   const t = i18n.buildT(user.languageCode || "en");

//   const botInfo = await context.bot.api.getMe();
//   const botUsername = botInfo.username || "your_bot";
//   const referralLink = `https://t.me/${botUsername}?start=ref_${user.referralCode}`;

//   const linkCopiedText = t("inviteLinkCopied", referralLink);
//   const textToSend =
//     typeof linkCopiedText === "string"
//       ? linkCopiedText
//       : String(linkCopiedText);

//   return context.answerCallbackQuery({
//     text: textToSend,
//     show_alert: true,
//   });
// })
