import { InlineKeyboard } from "gramio";
import type { PaymentCardNumber, PaymentSettings } from "../../db/schema.ts";
import { emojiIds } from "../../shared/locales/emojies.ts";
import type { TFunction } from "../../shared/locales/index.ts";
import { formatUsd } from "../../shared/utils/currency.ts";

export type PaymentSummaryData = {
	productName: string;
	planName: string;
	duration: number | null | undefined;
	durationUnit: string | null | undefined;
	collected: Record<string, string>;
	/** Units being purchased (manual products); omit/1 for single-unit orders */
	quantity?: number;
	/** Per-unit price label, shown alongside quantity when quantity > 1 */
	unitPriceLabel?: string;
	originalPrice: number;
	originalPriceLabel?: string;
	discountCode?: string;
	discountAmount?: number;
	finalPrice: number;
	walletBalance: number;
	/**
	 * Money formatter for this user's language. fa users get Toman (no dollar),
	 * others get USD. Defaults to {@link formatUsd} when omitted.
	 */
	formatMoney?: (usd: number) => string;
};

export type PaymentKeyboardOptions = {
	settings: PaymentSettings | undefined;
	cards: PaymentCardNumber[];
	walletBalance: number;
	finalPrice: number;
	languageCode?: string;
	/**
	 * Plan delivery type. Scheduled (`custom_schedule`) orders must be paid from
	 * the wallet: their time-slot picker only runs on the wallet path, so the
	 * receipt-based methods (card / ZarinPal / crypto) are hidden to avoid an
	 * order that can never get its slot. Users can top up the wallet via
	 * card-to-card first, then pay.
	 */
	deliveryType?: string | null;
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

	// fa → Toman, others → USD (falls back to plain USD if no formatter given).
	const money = data.formatMoney ?? formatUsd;

	let text = `${t("paymentSummaryTitle")}\n\n`;
	text += `📦 ${data.productName}\n`;
	text += `📋 ${data.planName} — ${duration}\n`;
	if (data.collected.email) text += `📧 ${data.collected.email}\n`;
	if (data.collected.region) text += `🌍 ${data.collected.region}\n`;
	text += `\n`;
	const quantity = data.quantity ?? 1;
	if (quantity > 1) {
		const unitLabel =
			data.unitPriceLabel ?? money(data.originalPrice / quantity);
		text += `${t("paymentQuantity")}: <b>${quantity}</b> × ${unitLabel}\n`;
	}
	const originalPriceLabel =
		data.originalPriceLabel ?? money(data.originalPrice);
	text += `${t("paymentOriginalPrice")}: ${originalPriceLabel}\n`;
	if (data.discountCode && data.discountAmount) {
		text += `${t("paymentDiscount")}: -${money(data.discountAmount)} (${data.discountCode})\n`;
	}
	text += `${t("paymentFinalPrice")}: <b>${money(data.finalPrice)}</b>\n`;
	text += `${t("paymentWalletBalance")}: ${money(data.walletBalance)}\n`;
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
	const isPersian = opts.languageCode === "fa";
	// Scheduled products are wallet-only (see PaymentKeyboardOptions.deliveryType).
	const walletOnly = opts.deliveryType === "custom_schedule";

	if (canPayWallet) {
		kb.text(t("btnPayWallet"), `pay_wallet_${planId}`, {
			icon_custom_emoji_id: emojiIds.bag,
			style: "success",
		}).row();
	}

	if (
		!walletOnly &&
		isPersian &&
		opts.settings?.cardEnabled &&
		opts.cards.length > 0
	) {
		kb.text(t("btnPayCard"), `pay_card_${planId}`, {
			icon_custom_emoji_id: emojiIds.card,
			style: "success",
		}).row();
	}

	if (
		!walletOnly &&
		isPersian &&
		opts.settings?.zarinpalEnabled &&
		opts.settings.zarinpalMerchantId
	) {
		kb.text(t("btnPayZarinpal"), `pay_zarinpal_${planId}`, {
			icon_custom_emoji_id: emojiIds.zarinpal,
			style: "success",
		}).row();
	}

	if (
		!walletOnly &&
		opts.settings?.nowpaymentsEnabled &&
		opts.settings.cryptoAddress?.trim()
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
