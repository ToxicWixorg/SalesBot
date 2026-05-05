/**
 * State management for collecting user info during manual/schedule order flow.
 * Similar to discountOrderState.ts – cleared after order is placed or cancelled.
 */

export type InfoStep = "email" | "loginUsername" | "loginPassword" | "region";

export interface PendingOrderInfo {
  planId: number;
  /** Ordered list of fields we still need to collect */
  steps: InfoStep[];
  /** Index into `steps` – which field we're currently asking for */
  currentStep: number;
  /** Values collected so far */
  collected: Partial<Record<InfoStep, string>>;
  /** Discount info forwarded from the discount state, if any */
  discount?: {
    planId: number;
    discountCodeId: number;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
    code: string;
  };
}

/** userId → state */
export const pendingOrderInfoState = new Map<number, PendingOrderInfo>();
