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
  /** NOWPayments payment id for crypto verification */
  nowpaymentsPaymentId?: string;
  /** NOWPayments order id */
  nowpaymentsOrderId?: string;
  /** Optional checkout URL returned by NOWPayments */
  nowpaymentsPayUrl?: string;
  /** Pay-to address returned by NOWPayments */
  nowpaymentsPayAddress?: string;
  /** Expected pay amount in selected crypto */
  nowpaymentsPayAmount?: string;
};

/** userId → payment state */
export const pendingPaymentState = new Map<number, PendingPaymentInfo>();
