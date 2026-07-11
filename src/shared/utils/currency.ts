import type { TFunction } from "../locales/index.ts";
import {
  getUsdtRate,
  usdToTomanWithRate,
} from "../../services/tetherland/index.ts";

export type PriceLabel = {
  label: string; // formatted label for display (e.g. "$5 (≈ 1,500,000 تومان)" or "1,500,000 تومان")
  toman?: number; // numeric value in Toman when rate available
};

export function formatPriceLabel(
  languageCode: string | undefined,
  usdAmount: number,
  t: TFunction,
  usdtRate: number | null | undefined,
): PriceLabel {
  const approxToman =
    usdtRate === null || usdtRate === undefined
      ? null
      : usdToTomanWithRate(usdAmount, usdtRate);

  if (languageCode === "fa") {
    if (approxToman === null) return { label: `$${usdAmount.toFixed(2)}` };
    return {
      label: `${approxToman.toLocaleString()} ${t("currency")}`,
      toman: approxToman,
    };
  }

  if (approxToman === null) return { label: `$${usdAmount.toFixed(2)}` };
  return {
    label: `$${usdAmount} (≈ ${approxToman.toLocaleString()} ${t("currency")})`,
    toman: approxToman,
  };
}

/**
 * Format a USD price for display to a user according to language.
 * - For Persian (`fa`) returns a Toman label (≈ converted value) and numeric toman.
 * - For other languages returns a USD label with an approximate Toman in parens.
 */
export async function formatPriceForUser(
  languageCode: string | undefined,
  usdAmount: number,
  t: TFunction,
): Promise<PriceLabel> {
  const rate = await getUsdtRate();
  return formatPriceLabel(languageCode, usdAmount, t, rate);
}
