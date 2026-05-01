import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";

export async function CopyInviteCallback(context: Context) {
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

  const botInfo = await context.bot.api.getMe();
  const botUsername = botInfo.username || "your_bot";
  const referralLink = `https://t.me/${botUsername}?start=ref_${user.referralCode}`;

  const linkCopiedText = t("inviteLinkCopied", referralLink);
  const textToSend =
    typeof linkCopiedText === "string"
      ? linkCopiedText
      : String(linkCopiedText);

  return context.answerCallbackQuery({
    text: textToSend,
    show_alert: true,
  });
}
