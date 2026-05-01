import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { ReferralRepository } from "../../../repositories/ReferralRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { referralListKeyboard } from "../../../shared/keyboards/index.ts";

export async function ViewReferralsCallBack(context: Context) {
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

    const reward = rewardHistory.find((r) => r.referredUserId === referred.id);
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

  await context.answerCallbackQuery();

  return context.editText(message, {
    reply_markup: referralListKeyboard(t),
    parse_mode: "HTML",
  });
}
