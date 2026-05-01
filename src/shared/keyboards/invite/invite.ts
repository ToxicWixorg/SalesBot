import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

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
      )
      // .row()
      // .text(t("btnCopyLink"), `copy_invite_${referralCode}`)
      .row()
      .text(t("btnViewReferrals"), "view_referrals")
      .row()
      .text(t("btnBack"), "main_menu")
  );
}
