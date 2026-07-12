/**
 * Temporary state for in-progress renewal payments.
 * Keyed by Telegram userId.
 */
export interface RenewalPendingInfo {
  originalOrderId: number;
  planId: number;
  productId: number;
  /** Final renewal price in USD */
  finalPrice: number;
  delivery: Record<string, string>;
  zarinpalAuthority?: string;
  zarinpalPayUrl?: string;
  nowpaymentsPaymentId?: string;
  nowpaymentsOrderId?: string;
  nowpaymentsPayUrl?: string;
  nowpaymentsPayAddress?: string;
  nowpaymentsPayAmount?: string;
}

export const renewalPendingState = new Map<number, RenewalPendingInfo>();
