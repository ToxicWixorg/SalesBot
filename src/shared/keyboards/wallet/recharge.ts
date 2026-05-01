import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";

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
