import type { AppliedDiscount } from "./discountOrderState.ts";

/**
 * Steps of info collection for manual/scheduled orders.
 * Each step corresponds to a piece of information we ask the user.
 */
export type InfoStep = string;

export type RequiredInputField = {
  key: string;
  textFA: string;
  textEN: string;
  textRU: string;
  inputType?: "text" | "email" | "password" | "number" | "url";
  required?: boolean;
  sensitive?: boolean; 
  displayText?: string;
};

/**
 * Full state object kept for a user while their order is being built.
 *
 * Phases for custom_schedule products:
 *  "payment" → "info" → "review" → "day" → "slot" → done
 *
 * Phases for non-scheduled products:
 *  "info" → "review" → "payment" → done
 *
 *  - "payment" → choosing payment method and paying
 *  - "info"    → collecting required info (email, password, region, …)
 *  - "review"  → showing collected info for confirmation
 *  - "day"     → picking a day of the week (custom_schedule only)
 *  - "slot"    → picking a time-slot within the chosen day (custom_schedule only)
 */
export type PendingOrderInfo = {
  planId: number;
  deliveryType: string;
  phase: "info" | "review" | "payment" | "day" | "slot";
  steps: RequiredInputField[];
  currentStep: number;
  collected: Record<InfoStep, string>;
  /** Discount already validated and waiting to be applied */
  discount?: AppliedDiscount;
  /** Price override when the user selected a region with its own price */
  regionPrice?: number;
  /** Which step is being re-edited from the review screen */
  editingStep?: InfoStep;
  /** The order ID created after payment (used to link the slot booking) */
  paidOrderId?: number;
  /** Day of week chosen in "day" phase (0=Sun … 6=Sat), used to load slots */
  pendingDayOfWeek?: number;
  /** Slot chosen in "slot" phase, waiting to be confirmed */
  selectedSlot?: { templateId: number; date: string; timeSlot: string };
};

/** userId → order-info state */
export const pendingOrderInfoState = new Map<number, PendingOrderInfo>();
