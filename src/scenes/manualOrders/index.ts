import { type AnyBot } from "gramio";
import { i18n } from "../../shared/locales/index.ts";
import { UserRepository } from "../../repositories/UserRepository.ts";
import { ProductPlanRepository } from "../../repositories/ProductRepository.ts";

import {
  pendingOrderInfoState,
  type InfoStep,
  type PendingOrderInfo,
} from "../../handlers/products/pendingOrderInfoState.ts";
import { appliedDiscountState } from "../../handlers/products/discountOrderState.ts";
import { preSelectedRegionState } from "../../handlers/products/preSelectedRegionState.ts";
import { showSlotPicker } from "./Helpers/showSlotPicker.ts";

import { showPaymentScreen } from "./ShowPaymentScreen.ts";
export { showPaymentScreen };

export { sendStepPrompt } from "./SendStepPrompt.ts";

export { setupManualOrderScene } from "./SetupManualOrderScene/index.ts";

export async function createManualOrderDirect(
  bot: AnyBot,
  userId: number,
  planId: number,
  deliveryType: string,
  editFn: (text: string, opts?: any) => Promise<any>,
  preCollected?: Record<InfoStep, string>,
) {
  const preRegion = preSelectedRegionState.get(userId);
  const regionPrice =
    preRegion?.planId === planId ? preRegion.price : undefined;
  if (preRegion?.planId === planId) preSelectedRegionState.delete(userId);

  const state: PendingOrderInfo = {
    planId,
    deliveryType,
    phase: "info",
    steps: [],
    currentStep: 0,
    collected: preCollected ?? {},
    discount: appliedDiscountState.get(userId),
    regionPrice,
  };

  // If custom_schedule with no info steps, show slot picker immediately
  if (deliveryType === "custom_schedule") {
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");
    const plan = await ProductPlanRepository.findById(planId);
    if (plan) {
      state.phase = "slot";
      pendingOrderInfoState.set(userId, state);
      try {
        const shown = await showSlotPicker(editFn, t, state, plan);
        if (shown) return; // wait for slot callback
      } catch (err) {
        console.error("[createManualOrderDirect] showSlotPicker error:", err);
      }
      // No slots shown (empty or error) — clean up state, do NOT create order
      pendingOrderInfoState.delete(userId);
      return;
    }
  }

  // Show payment confirmation screen
  pendingOrderInfoState.set(userId, state);
  await showPaymentScreen(editFn, userId, state);
}
