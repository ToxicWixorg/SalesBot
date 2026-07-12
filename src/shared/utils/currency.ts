import {
	getUsdtRate,
	usdToTomanWithRate,
} from "../../services/tetherland/index.ts";
import type { TFunction } from "../locales/index.ts";

export type PriceLabel = {
	label: string; // formatted label for display (e.g. "$5.00" or "$5.00 (≈ 1,500,000 تومان)")
	toman?: number; // numeric approximate value in Toman when rate available (display only)
};

/**
 * Format a USD amount as a plain dollar string, e.g. `$5.00`.
 * This is the canonical money-display format across the bot — every monetary
 * value (wallet balance, order price, transaction, discount, reward) is stored
 * and shown in USD.
 */
export function formatUsd(amount: number | string | null | undefined): string {
	const n =
		typeof amount === "number"
			? amount
			: Number.parseFloat(String(amount ?? "0"));
	return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

/**
 * Build a display label for a USD amount.
 * - Persian (`fa`) users additionally see an approximate Toman value in parens
 *   (e.g. `$5.00 (≈ 1,500,000 تومان)`) when the live rate is available.
 * - Other languages see the plain USD label.
 * The dollar value is always the source of truth; Toman is a courtesy estimate.
 */
export function formatPriceLabel(
	languageCode: string | undefined,
	usdAmount: number,
	t: TFunction,
	usdtRate: number | null | undefined,
): PriceLabel {
	const usdLabel = formatUsd(usdAmount);

	const approxToman =
		languageCode === "fa" &&
		usdtRate !== null &&
		usdtRate !== undefined &&
		usdtRate > 0
			? usdToTomanWithRate(usdAmount, usdtRate)
			: null;

	if (approxToman === null) return { label: usdLabel };

	return {
		label: `${usdLabel} (≈ ${approxToman.toLocaleString()} ${t("currency")})`,
		toman: approxToman,
	};
}

/**
 * Format a USD price for display to a user according to language.
 * Always USD-first; Persian users additionally get an approximate Toman value.
 */
export async function formatPriceForUser(
	languageCode: string | undefined,
	usdAmount: number,
	t: TFunction,
): Promise<PriceLabel> {
	const rate = languageCode === "fa" ? await getUsdtRate() : null;
	return formatPriceLabel(languageCode, usdAmount, t, rate);
}
