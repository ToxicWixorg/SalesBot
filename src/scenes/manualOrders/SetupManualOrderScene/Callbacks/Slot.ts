import { type AnyBot, Context } from "gramio";
import {
  ProductPlanRepository,
  UserRepository,
} from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { ScheduleRepository } from "../../../../repositories/ScheduleRepository";
import { linkSlotToOrder } from "../../Helpers/linkSlotToOrder";
import { showDayPicker } from "../../Helpers/showDayPicker";

export async function SlotCallback(
  ctx: Context,
  showSlotPicker: any,
  finishManualOrderWithSlot: any,
  bot: AnyBot,
) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "slot") return;

  const match = ctx.queryData.match(/^slot_(\d+)_(\d{4}-\d{2}-\d{2})$/);
  if (!match) return;
  const [, templateIdStr, date] = match as [string, string, string];
  const templateId = parseInt(templateIdStr);

  // Re-check slot availability (protect against race condition)
  const slots = await ScheduleRepository.getAvailableSlots(date);
  const slot = slots.find((s) => s.template.id === templateId);

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "en");

  if (!slot || slot.isFull) {
    await ctx.answerCallbackQuery(t("scheduleSlotFullAlert"));
    // Refresh slot picker for this date (or go back to day picker)
    const plan = await ProductPlanRepository.findById(state.planId);
    if (plan) {
      const refreshDate =
        state.pendingDayOfWeek !== undefined
          ? ScheduleRepository.getNextDateForDayOfWeek(state.pendingDayOfWeek)
          : date;
      const shown = await showSlotPicker(
        (text: string, opts?: any) => ctx.editText(text, opts),
        t,
        state,
        plan,
        refreshDate,
      );
      if (!shown) {
        // All slots on this day are full — go back to day picker
        await showDayPicker(
          (text: string, opts?: any) => ctx.editText(text, opts),
          t,
          state,
          plan,
        );
      }
    }
    return;
  }

  pendingOrderInfoState.delete(userId);

  const slotInfo = { templateId, date, timeSlot: slot.timeSlot };

  if (state.paidOrderId) {
    // custom_schedule: order already paid — just link the slot
    await linkSlotToOrder(
      bot,
      userId,
      state.paidOrderId,
      state,
      slotInfo,
      (text: string, opts?: any) => ctx.editText(text, opts),
    );
  } else {
    // Legacy path: create order + book slot together (non-custom_schedule)
    await finishManualOrderWithSlot(
      bot,
      userId,
      state,
      slotInfo,
      (text: string, opts?: any) => ctx.editText(text, opts),
    );
  }
}
