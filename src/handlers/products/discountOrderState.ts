export const discountEntryState = new Map<number, number>(); // userId -> planId

export interface AppliedDiscount {
  planId: number;
  discountCodeId: number;
  discountAmount: number;
  finalPrice: number;
  originalPrice: number;
  code: string;
}

export const appliedDiscountState = new Map<number, AppliedDiscount>(); // userId -> discount info
