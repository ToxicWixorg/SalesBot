import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function walletRechargeKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnRechargeCrypto"), "recharge_crypto")
    .row()
    .text(t("btnRechargeCard"), "recharge_card", {
      icon_custom_emoji_id: emojiIds.card,
    })
    .row()
    .text(t("btnRechargeZarinpal"), "recharge_zarinpal", {
      icon_custom_emoji_id: emojiIds.wallet,
    })
    .row()
    .text(t("btnBack"), "wallet", { icon_custom_emoji_id: emojiIds.back });
}
