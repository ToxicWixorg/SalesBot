import { PriceHandler } from "./handler/priceHandler.ts";
import { roundToman } from "./lib/convert.ts";

export { getCurrencies } from "./lib/getCurrencies.ts";
export {
  roundToman,
  usdToTomanWithRate,
  TOMAN_ROUNDING,
} from "./lib/convert.ts";

export const priceHandler = new PriceHandler();

/** Live USDT→Toman rate (cached). `null` if it could not be fetched yet. */
export async function getUsdtRate(): Promise<number | null> {
  return priceHandler.getUSDTPrice();
}

/**
 * Convert a USD amount to Toman using the live USDT rate, rounded to the
 * nearest 1000 Toman. Returns `null` when the rate is unavailable so callers
 * can decide whether to block the action or fall back to a USD display.
 */
export async function usdToToman(usd: number): Promise<number | null> {
  const rate = await priceHandler.getUSDTPrice();
  if (rate === null || !(rate > 0)) return null;
  return roundToman(usd * rate);
}
