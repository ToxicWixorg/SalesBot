/**
 * Tracks an in-flight card / ZarinPal / crypto payment for a manual order.
 * Stored while the user is on the "payment pending" screen so we can
 * verify / confirm it when they press the confirmation button.
 */

export type PendingPaymentInfo = {
  planId: number;
  finalPrice: number;
  /** ZarinPal authority token — set when a ZarinPal payment URL was generated */
  zarinpalAuthority?: string;
  /** Direct ZarinPal payment URL shown to the user */
  zarinpalPayUrl?: string;
};

/** userId → payment state */
export const pendingPaymentState = new Map<number, PendingPaymentInfo>();
