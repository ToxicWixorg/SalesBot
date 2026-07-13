import { appliedDiscountState } from "../../../handlers/products/discountOrderState.ts";
import type { PendingOrderInfo } from "../../../handlers/products/pendingOrderInfoState.ts";

/**
 * Resolved money math for a manual order, in USD (the canonical unit).
 *
 * A single source of truth so every payment path (wallet / card / crypto /
 * zarinpal) and the payment summary agree on the same quantity-aware totals.
 * The applied discount (if any) is a per-unit amount, so it scales with qty
 * exactly like the inventory order flow does.
 */
export type OrderPricing = {
  quantity: number;
  /** Per-unit original price (region override > plan base), USD */
  unitOriginal: number;
  /** unitOriginal × quantity */
  totalOriginal: number;
  /** Discount amount across all units, USD */
  totalDiscount: number;
  /** Amount actually payable across all units, USD */
  totalFinal: number;
  hasDiscount: boolean;
  discountCodeId?: number;
};

export function resolveOrderPricing(
  userId: number,
  state: PendingOrderInfo,
  planPriceUsd: number,
): OrderPricing {
  const quantity = state.quantity && state.quantity > 0 ? state.quantity : 1;

  const unitOriginal =
    state.basePriceUsd ?? state.regionPrice ?? planPriceUsd;

  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;

  const unitDiscount = hasDiscount ? pendingDiscount.discountAmount : 0;
  const unitFinal = hasDiscount ? pendingDiscount.finalPrice : unitOriginal;

  return {
    quantity,
    unitOriginal,
    totalOriginal: unitOriginal * quantity,
    totalDiscount: unitDiscount * quantity,
    totalFinal: unitFinal * quantity,
    hasDiscount,
    discountCodeId: hasDiscount ? pendingDiscount.discountCodeId : undefined,
  };
}
