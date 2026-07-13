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
  /**
   * Card-to-card renewal is paid in Toman. Snapshot of the Toman figure shown on
   * the card screen and the USDT→Toman rate used. `finalPrice` stays USD.
   */
  cardTomanAmount?: number;
  cardUsdtRate?: number;
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
