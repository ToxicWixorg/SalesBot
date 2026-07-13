/**
 * Tracks an in-flight card / ZarinPal / crypto payment for a manual order.
 * Stored while the user is on the "payment pending" screen so we can
 * verify / confirm it when they press the confirmation button.
 */

export type PendingPaymentInfo = {
	planId: number;
	finalPrice: number;
	/** User is in card-to-card flow and must send receipt photo */
	awaitingCardReceipt?: boolean;
	/** Telegram file id of uploaded card receipt photo */
	cardReceiptFileId?: string;
	/**
	 * User is in the manual crypto flow: a static wallet address was shown and we
	 * now wait for a transaction hash (text) or a receipt photo for admin review.
	 */
	awaitingCryptoProof?: boolean;
	/**
	 * User is in the manual ZarinPal flow: the gateway link was shown and we now
	 * wait for a tracking code (text) or a receipt photo for admin review.
	 */
	awaitingZarinpalProof?: boolean;
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
