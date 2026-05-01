import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { ReferralRepository } from "../../../repositories/ReferralRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { inviteKeyboard } from "../../../shared/keyboards/index.ts";

export async function InviteCallback(context: Context) {
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

  await context.answerCallbackQuery();

  return context.editText(bannerMessage, {
    reply_markup: inviteKeyboard(t, referralLink, user.referralCode),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
}
