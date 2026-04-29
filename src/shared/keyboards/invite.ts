import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";

/**
 * کیبورد اصلی بخش دعوت دوستان
 */
export function inviteMainKeyboard(
  t: TFunction,
  referralLink: string,
  referralCode: string,
): InlineKeyboard {
  return new InlineKeyboard()
    .url(
      t("btnShareInviteLink"),
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t("inviteShareText"))}`,
    )
    .row()
    .text(t("btnCopyLink"), `copy_invite_${referralCode}`)
    .row()
    .text(t("btnBack"), "main_menu");
}
// .row()
// .text(t("btnViewReferrals"), "view_referrals")

/**
 * کیبورد لیست کاربران دعوت شده
 */
export function referralListBackKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("btnBack"), "invite");
}
