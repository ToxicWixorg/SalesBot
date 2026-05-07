import type { AppliedDiscount } from "./discountOrderState.ts";

/**
 * Steps of info collection for manual/scheduled orders.
 * Each step corresponds to a piece of information we ask the user.
 */
export type InfoStep = "email" | "loginUsername" | "loginPassword" | "region";

/**
 * Full state object kept for a user while their order is being built.
 *
 * Phases:
 *  - "info"    → collecting required info (email, password, region, …)
 *  - "review"  → showing collected info for confirmation
 *  - "slot"    → picking a time-slot (custom_schedule products)
 *  - "payment" → choosing payment method and confirming purchase
 */
export type PendingOrderInfo = {
  planId: number;
  deliveryType: string;
  phase: "info" | "review" | "payment" | "slot";
  steps: InfoStep[];
  currentStep: number;
  collected: Partial<Record<InfoStep, string>>;
  /** Discount already validated and waiting to be applied */
  discount?: AppliedDiscount;
  /** Price override when the user selected a region with its own price */
  regionPrice?: number;
  /** Which step is being re-edited from the review screen */
  editingStep?: InfoStep;
};

/** userId → order-info state */
export const pendingOrderInfoState = new Map<number, PendingOrderInfo>();
