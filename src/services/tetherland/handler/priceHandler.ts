import { getCurrencies } from "../lib/getCurrencies";

const CACHE_TTL_MS = 5 * 60 * 1000; // refresh the USDT rate at most every 5 minutes

export class PriceHandler {
  lastPrice: number | null = null;
  lastUpdateAt: number | null = null;

  /**
   * Live USDT→Toman price from Tetherland.
   * Cached for {@link CACHE_TTL_MS}; on a failed fetch the last known price is
   * returned (or `null` if we never managed to fetch one).
   */
  async getUSDTPrice(): Promise<number | null> {
    const now = Date.now();

    if (
      this.lastPrice !== null &&
      this.lastUpdateAt !== null &&
      now - this.lastUpdateAt < CACHE_TTL_MS
    ) {
      return this.lastPrice;
    }

    const currencies = await getCurrencies();
    const price = currencies?.USDT?.price;
    if (price && price > 0) {
      this.lastPrice = price;
      this.lastUpdateAt = now;
      return price;
    }

    // Fetch failed — fall back to the last known price (may be null on cold start).
    return this.lastPrice;
  }
}
