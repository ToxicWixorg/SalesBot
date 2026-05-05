import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { emojiIds } from "../../locales/emojies.ts";

export function walletKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnRechargeWallet"), "wallet_recharge", {
      icon_custom_emoji_id: emojiIds.card,
    })
    .row()
    .text(t("btnTransactionHistory"), "wallet_history", {
      icon_custom_emoji_id: emojiIds.chart,
    })
    .row()
    .text(t("btnBack"), "main_menu", { icon_custom_emoji_id: emojiIds.back });
}
