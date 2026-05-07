/**
 * State for region pre-selected via inline keyboard (before ConfirmOrder).
 * Cleared after order is placed or cancelled.
 *
 * key: userId
 * value: { planId, region }
 */
export interface PreSelectedRegion {
  planId: number;
  region: string; // e.g. "🇪🇬 Egypt"
  /** Region-specific price override (from plan.regions[i].price). Overrides plan.price */
  price?: number;
}

export const preSelectedRegionState = new Map<number, PreSelectedRegion>();
