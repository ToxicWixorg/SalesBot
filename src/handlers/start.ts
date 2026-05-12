import { Composer, InlineKeyboard } from "gramio";
import { composer } from "../plugins/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { ReferralRepository } from "../repositories/ReferralRepository.ts";
import { ForceJoinRepository } from "../repositories/ForceJoinRepository.ts";
import type { ForceJoinChannel } from "../db/schema.ts";
import { i18n } from "../shared/locales/index.ts";
import { languageSelectionScene } from "../scenes/language-selection.ts";
import { mainMenuKeyboard } from "../shared/keyboards/index.ts";
import { sendNewUserNotification } from "../services/bot/notifications/newUser.ts";
import { emojiIds } from "../shared/locales/emojies.ts";
import { config } from "../config.ts";

function generateReferralCode(userId: number): string {
  return `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function getUnjoinedChannels(
  api: any,
  userId: number,
  channels: ForceJoinChannel[],
): Promise<ForceJoinChannel[]> {
  const notMember: ForceJoinChannel[] = [];
  for (const channel of channels) {
    try {
      const member = await api.getChatMember({
        chat_id: channel.channelId,
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
  unjoined: ForceJoinChannel[],
  t: ReturnType<typeof i18n.buildT>,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const channel of unjoined) {
    keyboard.url(channel.channelName, channel.channelUrl).row();
  }
  keyboard.text(t("btnIJoined"), "check_membership", {
    icon_custom_emoji_id: emojiIds.checkBold,
  });
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

    if (user) {
      user = await UserRepository.update(userId, {
        username,
        firstName,
        lastName,
      });
    }

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
                parse_mode: "HTML",
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

    const requiredChannels = await ForceJoinRepository.getActiveChannels();
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

    // await context.send(
    //   `<tg-emoji emoji-id="5314310000531766389">©️</tg-emoji> This is a demo , so if you see any bugs or have suggestions, please let us know!`,
    //   {
    //     parse_mode: "HTML",
    //   },
    // );

    return context.send(t("main_menu", userName), {
      reply_markup: mainMenuKeyboard(t, user.role),
      parse_mode: "HTML",
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

    const requiredChannels = await ForceJoinRepository.getActiveChannels();
    const unjoined = await getUnjoinedChannels(
      context.bot.api,
      userId,
      requiredChannels,
    );

    if (unjoined.length > 0) {
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
      await context.editText(t("main_menu", userName), {
        reply_markup: mainMenuKeyboard(t, user.role),
        parse_mode: "HTML",
      });
    } catch {
      await context.send(t("main_menu", userName), {
        reply_markup: mainMenuKeyboard(t,user.role),
        parse_mode: "HTML",
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
    const firstName = context.from.firstName || null;
    const username = context.from.username || null;
    const userName = firstName || username || "User";

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
      await context.editText(t("main_menu", userName), {
        reply_markup: mainMenuKeyboard(t),
        parse_mode: "HTML",
      });
    } catch (error: any) {
      if (error?.message?.includes("message is not modified")) {
        await context.answerCallbackQuery();
        return;
      }
      throw error;
    }

    await context.answerCallbackQuery();
  })
  .callbackQuery("admin_panel", async (context) => {
    if (!context.from) {
      return context.answerCallbackQuery("❌ Unable to identify user.");
    }

    const userId = context.from.id;

    let user = await UserRepository.findById(userId);
    const t = i18n.buildT(user.languageCode || "en");
    if (!user) {
      return context.answerCallbackQuery("❌ Unable to identify user.");
    }

    if (user.role === "customer") {
      await context.editReplyMarkup(mainMenuKeyboard(t, user.role));
      return context.answerCallbackQuery("⛔ Staff only");
    }

    const keyboard = new InlineKeyboard()
      .url(t("adminpanelBtnUrl"), config.ADMIN_PANEL_URL, {
        style: "success",
        icon_custom_emoji_id: "5258096772776991776",
      })
      .row()
      .text(t("adminpanelBtnEmojies"), "get_custom_emoji", {
        icon_custom_emoji_id: "6136464120779638846",
      });

    await context.send(t("adminpanelText", userId, user.role), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  });
