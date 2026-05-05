import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

export function walletKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnRechargeWallet"), "wallet_recharge",)
    .row()
    .text(t("btnTransactionHistory"), "wallet_history")
    .row()
    .text(t("btnBack"), "main_menu");
}
