/**
 * State management for collecting user info during manual/schedule order flow.
 * Similar to discountOrderState.ts – cleared after order is placed or cancelled.
 */

export type InfoStep = "email" | "loginUsername" | "loginPassword" | "region";

/** Which phase of the order flow we're in */
export type OrderFlowPhase = "info" | "slot" | "review" | "payment";

export interface PendingOrderInfo {
  planId: number;
  /** Product delivery type — determines whether slot selection phase runs */
  deliveryType: string;
  /** Current phase: collecting info fields, or selecting a time slot */
  phase: OrderFlowPhase;
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
  /**
   * Set while the user is re-editing a single step (from review screen).
   * After they type, return directly to review instead of continuing steps.
   */
  editingStep?: InfoStep;
  /** Price override from region selection (overrides plan.price) */
  regionPrice?: number;
}

/** userId → state */
export const pendingOrderInfoState = new Map<number, PendingOrderInfo>();
