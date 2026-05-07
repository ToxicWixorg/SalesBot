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
}

export const preSelectedRegionState = new Map<number, PreSelectedRegion>();
