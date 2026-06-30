/**
 * Currency conversion helpers (USD → Toman).
 *
 * Product prices are stored in USD. They are converted to Toman at display /
 * order time using the live USDT→Toman rate from Tetherland.
 *
 * The converted amount is rounded to the nearest {@link TOMAN_ROUNDING} Toman so
 * the price shown to the user looks clean (e.g. 523,470 → 523,000).
 */
export const TOMAN_ROUNDING = 1000;

/** Round a Toman amount to the nearest {@link TOMAN_ROUNDING}. */
export function roundToman(value: number): number {
  return Math.round(value / TOMAN_ROUNDING) * TOMAN_ROUNDING;
}

/**
 * Convert a USD amount to Toman with an already-fetched USDT rate.
 * Synchronous — use this inside keyboards that render many prices after the
 * caller fetched the rate once.
 */
export function usdToTomanWithRate(usd: number, usdtRate: number): number {
  return roundToman(usd * usdtRate);
}
