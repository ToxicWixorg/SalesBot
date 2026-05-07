/**
 * In-memory state for non-wallet order payments in progress.
 * Used during ZarinPal payment flow (waiting for user to verify).
 * Card/crypto flows also use this to pass the final price to the confirm callback.
 */

export interface PendingPaymentInfo {
  planId: number;
  finalPrice: number;
  /** ZarinPal: authority token returned by payment request */
  zarinpalAuthority?: string;
  /** ZarinPal: full payment URL to show the user */
  zarinpalPayUrl?: string;
}

/**
 * userId → PendingPaymentInfo
 * Cleared after successful payment or cancellation.
 */
export const pendingPaymentState = new Map<number, PendingPaymentInfo>();
