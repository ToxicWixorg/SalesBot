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
 * Format a Toman amount as a grouped integer string (no unit), e.g. `1,500,000`.
 * Append the "تومان" unit at the call site, matching existing card/admin copy.
 */
export function formatToman(
	amount: number | string | null | undefined,
): string {
	const n =
		typeof amount === "number"
			? amount
			: Number.parseFloat(String(amount ?? "0"));
	return (Number.isFinite(n) ? Math.round(n) : 0).toLocaleString("en-US");
}

/**
 * Card-to-card is a Toman-only transfer. Convert a canonical USD amount to the
 * Toman figure the user must transfer, snapshotting the live Tetherland rate so
 * the SAME amount can be shown to the user and later to the admin at review.
 * Returns `null` when the rate is unavailable — callers MUST block the card flow
 * in that case (we can't ask the user to pay an unknown Toman amount).
 */
export async function getCardTomanAmount(
	usdAmount: number,
): Promise<{ toman: number; rate: number } | null> {
	const rate = await getUsdtRate();
	if (rate === null || !(rate > 0)) return null;
	return { toman: usdToTomanWithRate(usdAmount, rate), rate };
}

/**
 * Build a display label for a USD amount.
 * - Persian (`fa`) users see the price converted to Toman via the live
 *   Tetherland rate, with NO dollar figure (e.g. `1,500,000 تومان`). This is the
 *   product price display shown to fa users.
 * - When `options.showUsd` is set, fa users instead see the dollar value first
 *   with the Toman value in parens (e.g. `$5.00 (≈ 1,500,000 تومان)`). Used by
 *   the payment/renew screens where the USD amount must stay visible.
 * - Other languages always see the plain USD label.
 * - If the live rate is unavailable for a fa user, we fall back to the USD label
 *   (a degraded state; Toman cannot be computed without a rate).
 * The dollar value is always the source of truth; Toman is a display estimate.
 */
export function formatPriceLabel(
	languageCode: string | undefined,
	usdAmount: number,
	t: TFunction,
	usdtRate: number | null | undefined,
	options?: { showUsd?: boolean },
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

	if (options?.showUsd) {
		return {
			label: `${usdLabel} (≈ ${approxToman.toLocaleString()} ${t("currency")})`,
			toman: approxToman,
		};
	}

	// fa product display: Toman only, no dollar figure. This branch is fa-only,
	// so the Toman unit word is literal (t("currency") is "دلار" post USD-migration).
	return {
		label: `${approxToman.toLocaleString()} تومان`,
		toman: approxToman,
	};
}

/**
 * Format a USD price for display to a user according to language, fetching the
 * live Tetherland rate for fa users.
 * - By default fa users see the Toman-only label (no dollar figure).
 * - Pass `{ showUsd: true }` to keep the USD amount visible (USD-first + Toman
 *   estimate) — used by the payment/renew screens.
 */
export async function formatPriceForUser(
	languageCode: string | undefined,
	usdAmount: number,
	t: TFunction,
	options?: { showUsd?: boolean },
): Promise<PriceLabel> {
	const rate = languageCode === "fa" ? await getUsdtRate() : null;
	return formatPriceLabel(languageCode, usdAmount, t, rate, options);
}
