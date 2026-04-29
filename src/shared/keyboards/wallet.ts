import { InlineKeyboard } from "gramio";
import type { TFunction } from "../locales/index.ts";
import { backKeyboard } from "./back.ts";

export function walletKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnRechargeWallet"), "wallet_recharge")
    .row()
    .text(t("btnTransactionHistory"), "wallet_history")
    .row()
    .text(t("btnBack"), "main_menu");
}

export function walletRechargeKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard()
    .text(t("btnRechargeCrypto"), "recharge_crypto")
    .row()
    .text(t("btnRechargeCard"), "recharge_card")
    .row()
    .text(t("btnRechargeZarinpal"), "recharge_zarinpal")
    .row()
    .text(t("btnBack"), "wallet");
}

export function walletHistoryKeyboard(t: TFunction): InlineKeyboard {
  return backKeyboard(t, "wallet");
}

export function rechargeCryptoKeyboard(t: TFunction): InlineKeyboard {
  return backKeyboard(t, "wallet_recharge");
}

export function rechargeCardKeyboard(t: TFunction): InlineKeyboard {
  return backKeyboard(t, "wallet_recharge");
}

export function rechargeZarinpalKeyboard(t: TFunction): InlineKeyboard {
  return backKeyboard(t, "wallet_recharge");
}
