import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../shared/locales/index.ts";
import type { InfoStep, PendingOrderInfo } from "./pendingOrderInfoState.ts";

/** Human-readable Persian label for each info step */
const stepLabel: Record<InfoStep, string> = {
  email: "📧 ایمیل",
  loginUsername: "👤 نام کاربری",
  loginPassword: "🔐 رمز عبور",
  region: "🌍 منطقه",
};

/**
 * Builds the review message that shows the user all collected info
 * and asks them to confirm or edit individual fields.
 */
export function buildOrderInfoReviewText(
  t: TFunction,
  state: PendingOrderInfo,
): string {
  let text = `${t("orderInfoReviewTitle")}\n${t("orderInfoReviewPrompt")}\n\n`;

  for (const step of state.steps) {
    const value = state.collected[step] ?? "—";
    text += `${stepLabel[step]}: <code>${value}</code>\n`;
  }

  return text;
}

/**
 * Inline keyboard for the review screen.
 * Provides a "Confirm & Continue" button plus an "Edit" button per step.
 */
export function orderInfoReviewKeyboard(
  t: TFunction,
  planId: number,
  steps: InfoStep[],
): InlineKeyboard {
  const kb = new InlineKeyboard();

  kb.text(t("btnConfirmInfo"), `confirm_info_${planId}`).row();

  for (const step of steps) {
    kb.text(`✏️ ${stepLabel[step]}`, `edit_info_${planId}_${step}`).row();
  }

  kb.text(t("btnCancelManualOrder"), "cancel_manual_order");

  return kb;
}
