import { Composer, InlineKeyboard } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { ReferralRepository } from "../repositories/ReferralRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";
import { mainMenuKeyboard } from "../shared/keyboards/index.ts";
import { sendNewUserNotification } from "../services/bot/notifications/newUser.ts";
import { getRequiredChannels, type RequiredChannel } from "../config.ts";

function generateReferralCode(userId: number): string {
  return `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function getUnjoinedChannels(
  api: any,
  userId: number,
  channels: RequiredChannel[],
): Promise<RequiredChannel[]> {
  const notMember: RequiredChannel[] = [];
  for (const channel of channels) {
    try {
      const member = await api.getChatMember({
        chat_id: channel.id,
        user_id: userId,
      });
      if (member.status === "left" || member.status === "kicked") {
        notMember.push(channel);
      }
    } catch {
      notMember.push(channel);
    }
  }
  return notMember;
}

function buildJoinKeyboard(
  unjoined: RequiredChannel[],
  t: ReturnType<typeof i18n.buildT>,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const channel of unjoined) {
    keyboard.url(channel.name, channel.url).row();
  }
  keyboard.text(t("btnIJoined"), "check_membership");
  return keyboard;
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
      await context.scene.enter(languageSelectionScene);
      return;
    }

    const t = i18n.buildT(user.languageCode);
    const userName = firstName || username || "User";

    // Check required channel/group membership before showing main menu
    const requiredChannels = getRequiredChannels();
    if (requiredChannels.length > 0) {
      const unjoined = await getUnjoinedChannels(
        context.bot.api,
        userId,
        requiredChannels,
      );
      if (unjoined.length > 0) {
        return context.send(t("joinChannelRequired"), {
          parse_mode: "HTML",
          reply_markup: buildJoinKeyboard(unjoined, t),
        });
      }
    }

    return context.send(`${t("welcome", userName)} \n\n${t("chooseAction")}`, {
      reply_markup: mainMenuKeyboard(t),
    });
  })
  .callbackQuery("check_membership", async (context) => {
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

    const requiredChannels = getRequiredChannels();
    const unjoined = await getUnjoinedChannels(
      context.bot.api,
      userId,
      requiredChannels,
    );

    if (unjoined.length > 0) {
      // Update keyboard to reflect remaining unjoined channels
      try {
        await context.editText(t("joinChannelRequired"), {
          parse_mode: "HTML",
          reply_markup: buildJoinKeyboard(unjoined, t),
        });
      } catch {}
      return context.answerCallbackQuery({
        text: t("joinChannelNotJoinedAlert"),
        show_alert: true,
      });
    }

    await context.answerCallbackQuery();

    const firstName = context.from.firstName || null;
    const username = context.from.username || null;
    const userName = firstName || username || "User";

    try {
      await context.editText(
        `${t("welcome", userName)} \n\n${t("chooseAction")}`,
        { reply_markup: mainMenuKeyboard(t) },
      );
    } catch {
      await context.send(`${t("welcome", userName)} \n\n${t("chooseAction")}`, {
        reply_markup: mainMenuKeyboard(t),
      });
    }
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
      if (error?.message?.includes("message is not modified")) {
        await context.answerCallbackQuery();
        return;
      }
      throw error;
    }

    await context.answerCallbackQuery();
  });
