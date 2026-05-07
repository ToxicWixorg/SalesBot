/**
 * Helpers for the payment confirmation screen.
 * Shows final order summary + dynamic payment method keyboard.
 */

import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../shared/locales/index.ts";
import type { InfoStep } from "./pendingOrderInfoState.ts";
import type { PaymentSettings, PaymentCardNumber } from "../../db/schema.ts";

export interface PaymentKeyboardOptions {
  settings?: PaymentSettings;
  cards?: PaymentCardNumber[];
  walletBalance: number;
  finalPrice: number;
}

export interface PaymentSummaryData {
  productName: string;
  planName: string;
  duration?: number | null;
  durationUnit?: string | null;
  collected: Partial<Record<InfoStep, string>>;
  originalPrice: number;
  discountCode?: string;
  discountAmount?: number;
  finalPrice: number;
  walletBalance: number;
}

export function buildPaymentSummaryText(
  t: TFunction,
  data: PaymentSummaryData,
): string {
  const lines: string[] = [`${t("paymentSummaryTitle")}`, ""];

  lines.push(`📦 ${data.productName}`);
  lines.push(`📋 ${data.planName}`);

  if (data.duration) {
    const unitKey = data.durationUnit || "day";
    let unit = "";
    if (unitKey === "day") unit = t("duration_day");
    else if (unitKey === "month") unit = t("duration_month");
    else if (unitKey === "year") unit = t("duration_year");
    lines.push(`⏱ ${data.duration} ${unit}`);
  }

  if (data.collected.region) {
    lines.push(`🌍 ${data.collected.region}`);
  }

  lines.push("");

  if (data.discountCode && data.discountAmount) {
    lines.push(
      `💵 ${t("paymentOriginalPrice")}: <s>${data.originalPrice.toLocaleString()}</s> ${t("currency")}`,
    );
    lines.push(
      `🎫 ${t("paymentDiscount")} (${data.discountCode}): -${data.discountAmount.toLocaleString()} ${t("currency")}`,
    );
    lines.push(
      `✅ ${t("paymentFinalPrice")}: <b>${data.finalPrice.toLocaleString()}</b> ${t("currency")}`,
    );
  } else {
    lines.push(
      `💰 ${t("paymentFinalPrice")}: <b>${data.finalPrice.toLocaleString()}</b> ${t("currency")}`,
    );
  }

  lines.push(
    `👛 ${t("paymentWalletBalance")}: ${data.walletBalance.toLocaleString()} ${t("currency")}`,
  );

  lines.push("", t("paymentPrompt"));
  return lines.join("\n");
}

export function paymentKeyboard(
  t: TFunction,
  planId: number,
  opts?: PaymentKeyboardOptions,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  // Wallet — only if balance covers the price
  const canPayWallet = !opts || opts.walletBalance >= opts.finalPrice;
  if (canPayWallet) {
    kb.text(t("btnPayWallet"), `pay_wallet_${planId}`).row();
  }

  // Card (if enabled and at least one active card exists)
  if (opts?.settings?.cardEnabled && (opts.cards?.length ?? 0) > 0) {
    kb.text(t("btnPayCard"), `pay_card_${planId}`).row();
  }

  // ZarinPal (if enabled and merchant ID is set)
  if (opts?.settings?.zarinpalEnabled && opts.settings?.zarinpalMerchantId) {
    kb.text(t("btnPayZarinpal"), `pay_zarinpal_${planId}`).row();
  }

  // Crypto / USDT (if enabled, address and exchange rate set)
  if (
    opts?.settings?.cryptoEnabled &&
    opts.settings?.cryptoAddress &&
    (opts.settings?.cryptoExchangeRate ?? 0) > 0
  ) {
    kb.text(t("btnPayCrypto"), `pay_crypto_${planId}`).row();
  }

  kb.text(t("btnCancelManualOrder"), "cancel_manual_order");
  return kb;
}
