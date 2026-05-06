/**
 * State for pending quantity selection in the inventory-based order flow.
 *
 * Flow:
 *   SelectPlan → sets this state → user types a number
 *   EnterQuantity handler reads/validates → shows order summary
 *   ConfirmInventoryOrder callback → clears state → processes order
 */

export interface PendingQuantityOrder {
  planId: number;
  productId: number;
  productName: string;
  pricePerUnit: number;
  availableStock: number; // live count at the time of plan selection
  maxPerUser: number;     // 0 = unlimited
}

/** userId → pending quantity state */
export const pendingQuantityState = new Map<number, PendingQuantityOrder>();
