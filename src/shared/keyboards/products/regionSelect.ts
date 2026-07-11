import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import { formatPriceLabel } from "../../utils/currency.ts";

/**
 * Builds a region selection keyboard.
 * Each region button has callback: select_region_{planId}_{index}
 * Regions are accessed by index to avoid encoding issues in callback data.
 *
 * Region prices are stored in USD and converted to Toman with the live rate.
 */
export function regionSelectionKeyboard(
  t: TFunction,
  planId: number,
  regions: Array<{ flag: string; name: string; price?: string }>,
  languageCode = "fa",
  usdtRate: number | null = null,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i]!;
    const priceLabel = r.price
      ? ` — ${formatPriceLabel(languageCode, Number(r.price), t, usdtRate).label}`
      : "";
    kb.text(`${r.flag} ${r.name}${priceLabel}`, `select_region_${planId}_${i}`);
    if (i % 2 === 1) kb.row();
  }
  if (regions.length % 2 !== 0) kb.row();
  kb.text(t("btnCancel"), "cancel_order");
  return kb;
}
