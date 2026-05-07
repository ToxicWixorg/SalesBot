/**
 * Keeps track of the region a user selected before reaching the
 * order-confirmation screen, so the confirm_order handler can pick it up.
 */

export type PreSelectedRegion = {
  planId: number;
  flag: string;
  name: string;
  /** Region-specific price override (may be undefined if the region carries no separate price) */
  price?: number;
};

/** userId → pre-selected region */
export const preSelectedRegionState = new Map<number, PreSelectedRegion>();
