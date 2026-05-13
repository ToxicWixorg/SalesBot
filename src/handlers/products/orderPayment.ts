import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../shared/locales/index.ts";
import type { PaymentSettings, PaymentCardNumber } from "../../db/schema.ts";
import { emojiIds } from "../../shared/locales/emojies.ts";

export type PaymentSummaryData = {
  productName: string;
  planName: string;
  duration: number | null | undefined;
  durationUnit: string | null | undefined;
  collected: Record<string, string>;
  originalPrice: number;
  discountCode?: string;
  discountAmount?: number;
  finalPrice: number;
  walletBalance: number;
};

export type PaymentKeyboardOptions = {
  settings: PaymentSettings | undefined;
  cards: PaymentCardNumber[];
  walletBalance: number;
  finalPrice: number;
};

/**
 * Builds the full payment summary message shown before the user picks a method.
 */
export function buildPaymentSummaryText(
  t: TFunction,
  data: PaymentSummaryData,
): string {
  let duration = t("oneTime");
  if (data.duration) {
    const unitKey = data.durationUnit ?? "day";
    let unitLabel = "";
    if (unitKey === "day") unitLabel = t("duration_day");
    else if (unitKey === "month") unitLabel = t("duration_month");
    else if (unitKey === "year") unitLabel = t("duration_year");
    duration = `${data.duration} ${unitLabel}`;
  }

  let text = `${t("paymentSummaryTitle")}\n\n`;
  text += `📦 ${data.productName}\n`;
  text += `📋 ${data.planName} — ${duration}\n`;
  if (data.collected.email) text += `📧 ${data.collected.email}\n`;
  if (data.collected.region) text += `🌍 ${data.collected.region}\n`;
  text += `\n`;
  text += `${t("paymentOriginalPrice")}: ${data.originalPrice.toLocaleString()} ${t("currency")}\n`;
  if (data.discountCode && data.discountAmount) {
    text += `${t("paymentDiscount")}: -${data.discountAmount.toLocaleString()} ${t("currency")} (${data.discountCode})\n`;
  }
  text += `${t("paymentFinalPrice")}: <b>${data.finalPrice.toLocaleString()}</b> ${t("currency")}\n`;
  text += `${t("paymentWalletBalance")}: ${data.walletBalance.toLocaleString()} ${t("currency")}\n`;
  text += `\n${t("paymentPrompt")}`;

  return text;
}

/**
 * Builds the payment method inline keyboard based on enabled gateways.
 * Shows "Top-up wallet" if balance is insufficient.
 */
export function paymentKeyboard(
  t: TFunction,
  planId: number,
  opts: PaymentKeyboardOptions,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  const canPayWallet = opts.walletBalance >= opts.finalPrice;

  if (canPayWallet) {
    kb.text(t("btnPayWallet"), `pay_wallet_${planId}`, {
      icon_custom_emoji_id: emojiIds.bag,
      style: "success",
    }).row();
  }

  if (opts.settings?.cardEnabled && opts.cards.length > 0) {
    kb.text(t("btnPayCard"), `pay_card_${planId}`, {
      icon_custom_emoji_id: emojiIds.card,
      style: "success",
    }).row();
  }

  if (opts.settings?.zarinpalEnabled && opts.settings.zarinpalMerchantId) {
    kb.text(t("btnPayZarinpal"), `pay_zarinpal_${planId}`, {
      icon_custom_emoji_id: emojiIds.zarinpal,
      style: "success",
    }).row();
  }

  if (
    opts.settings?.nowpaymentsEnabled &&
    opts.settings.nowpaymentsApiKey &&
    opts.settings.nowpaymentsIpnCallbackUrl &&
    (opts.settings.cryptoExchangeRate ?? 0) > 0
  ) {
    kb.text(t("btnPayCrypto"), `pay_crypto_${planId}`, {
      icon_custom_emoji_id: emojiIds.usdt,
      style: "success",
    }).row();
  }

  if (!canPayWallet) {
    kb.text(t("btnRechargeWallet"), "wallet", {
      icon_custom_emoji_id: emojiIds.wallet,
      style: "primary",
    }).row();
  }

  kb.text(t("btnCancelManualOrder"), "cancel_manual_order", {
    icon_custom_emoji_id: emojiIds.reject,
    style: "danger",
  });

  return kb;
}
