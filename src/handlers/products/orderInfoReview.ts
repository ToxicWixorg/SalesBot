/**
 * Helpers for the order-info review screen.
 * After all steps are collected, we show a summary with Confirm / Edit buttons
 * before actually creating the order.
 */

import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../shared/locales/index.ts";
import type { InfoStep, PendingOrderInfo } from "./pendingOrderInfoState.ts";

const STEP_LABELS: Record<InfoStep, string> = {
  email: "📧 ایمیل",
  loginUsername: "👤 نام کاربری",
  loginPassword: "🔐 رمز عبور",
  region: "🌍 منطقه",
};

const STEP_LABELS_EN: Record<InfoStep, string> = {
  email: "📧 Email",
  loginUsername: "👤 Username",
  loginPassword: "🔐 Password",
  region: "🌍 Region",
};

export function buildOrderInfoReviewText(
  t: TFunction,
  state: PendingOrderInfo,
): string {
  const lines: string[] = [`${t("orderInfoReviewTitle")}`, ""];

  const allCollected: InfoStep[] = [
    "email",
    "loginUsername",
    "loginPassword",
    "region",
  ];

  for (const step of allCollected) {
    const value = state.collected[step];
    if (!value) continue;
    lines.push(`${STEP_LABELS[step]}: <code>${value}</code>`);
  }

  lines.push("", t("orderInfoReviewPrompt"));
  return lines.join("\n");
}

export function orderInfoReviewKeyboard(
  t: TFunction,
  planId: number,
  collectedSteps: InfoStep[],
): InlineKeyboard {
  const kb = new InlineKeyboard();

  kb.text(t("btnConfirmInfo"), `confirm_info_${planId}`).row();

  for (const step of collectedSteps) {
    kb.text(`✏️ ${STEP_LABELS_EN[step]}`, `edit_info_${planId}_${step}`).row();
  }

  kb.text(t("btnCancelManualOrder"), "cancel_manual_order");
  return kb;
}
