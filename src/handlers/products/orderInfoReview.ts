import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../shared/locales/index.ts";
import type { PendingOrderInfo } from "./pendingOrderInfoState.ts";
import { emojiIds } from "../../shared/locales/emojies.ts";

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
    const rawValue = state.collected[step.key] ?? "—";
    const value = step.sensitive && rawValue !== "—" ? "••••••" : rawValue;
    const label =
      (step as any).displayText ||
      (step as any).textFA ||
      (step as any).textEN ||
      (step as any).textRU ||
      step.key;
    text += `${label}: <code>${value}</code>\n`;
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
  steps: PendingOrderInfo["steps"],
): InlineKeyboard {
  const kb = new InlineKeyboard();

  kb.text(t("btnConfirmInfo"), `confirm_info_${planId}`, {
    icon_custom_emoji_id: emojiIds.confirm,
    style: "success",
  }).row();

  for (const step of steps) {
    const label =
      (step as any).displayText ||
      (step as any).textFA ||
      (step as any).textEN ||
      (step as any).textRU ||
      step.key;
    kb.text(`✏️ ${label}`, `edit_info_${planId}_${step.key}`).row();
  }

  kb.text(t("btnCancelManualOrder"), "cancel_manual_order");

  return kb;
}
