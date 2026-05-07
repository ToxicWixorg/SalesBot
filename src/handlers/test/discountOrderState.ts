/**
 * State maps for the discount code flow during order placement.
 *
 * discountEntryState  → user is being asked to type a discount code for a given planId
 * appliedDiscountState → a validated discount has been applied and is waiting for order confirmation
 */

export type AppliedDiscount = {
  planId: number;
  discountCodeId: number;
  discountAmount: number;
  finalPrice: number;
  originalPrice: number;
  code: string;
};

/** userId → planId */
export const discountEntryState = new Map<number, number>();

/** userId → applied discount info */
export const appliedDiscountState = new Map<number, AppliedDiscount>();
