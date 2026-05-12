import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function inviteKeyboard(
  t: TFunction,
  referralLink: string,
  referralCode: string,
): InlineKeyboard {
  return (
    new InlineKeyboard()
      .url(
        t("btnShareInviteLink"),
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t("inviteShareText"))}`,
        { icon_custom_emoji_id: emojiIds.send, style: "primary" },
      )
      // .row()
      // .text(t("btnCopyLink"), `copy_invite_${referralCode}`)
      .row()
      .text(t("btnViewReferrals"), "view_referrals", {
        icon_custom_emoji_id: emojiIds.user,
      })
      .row()
      .text(t("btnBack"), "main_menu", { icon_custom_emoji_id: emojiIds.back })
  );
}
