import { InlineKeyboard } from "gramio";
import { PendingOrderInfo } from "../../../handlers/products/pendingOrderInfoState";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository";
import { todayDate } from "./todayDate";
import { emojiIds } from "../../../shared/locales/emojies";

export async function showSlotPicker(
  sendFn: (text: string, opts?: any) => Promise<any>,
  t: any,
  state: PendingOrderInfo,
  plan: { productId: number },
  date?: string, // defaults to today; pass a specific date from day picker
) {
  const targetDate = date ?? todayDate();
  const slots = await ScheduleRepository.getAvailableSlots(
    targetDate,
    plan.productId,
  );

  if (slots.length === 0) {
    // No slots available for this date – inform the user and let them cancel
    await sendFn(t("scheduleNoSlotsToday"), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
    return false;
  }

  // Build inline keyboard — 2 slots per row
  const kb = new InlineKeyboard();
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    const label = slot.isFull
      ? `❌ ${slot.timeSlot}`
      : `✅ ${slot.timeSlot} (${slot.capacity - slot.booked} ${t("scheduleSlotFree")})`;
    const callbackData = slot.isFull
      ? `slot_full`
      : `slot_${slot.template.id}_${targetDate}`;
    kb.text(label, callbackData);
    if (i % 2 === 1) kb.row();
  }
  kb.row().text(t("btnCancelManualOrder"), "cancel_manual_order", {
    icon_custom_emoji_id: emojiIds.cross,
  });

  const dateLabel = new Date(targetDate + "T12:00:00").toLocaleDateString(
    "fa-IR",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  await sendFn(t("schedulePickSlot", { date: dateLabel }), {
    parse_mode: "HTML",
    reply_markup: kb,
  });
  return true;
}
