import { InlineKeyboard } from "gramio";
import { PendingOrderInfo } from "../../../handlers/products/pendingOrderInfoState";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository";
import { emojiIds } from "../../../shared/locales/emojies";

/**
 * Persian day names indexed by JS getDay() value (0=Sun … 6=Sat).
 * In Iran, Saturday (6) is the start of the work week.
 */
const FA_DAY_NAMES: Record<number, string> = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
};

/**
 * Builds and sends a day-of-week picker keyboard.
 * Shows only the days that have at least one active time-slot template.
 *
 * Transitions state to "day" phase.
 * Returns true if the keyboard was shown, false if no days are available.
 */
export async function showDayPicker(
  sendFn: (text: string, opts?: any) => Promise<any>,
  t: any,
  state: PendingOrderInfo,
  plan: { productId: number },
): Promise<boolean> {
  const availableDays = await ScheduleRepository.getAvailableDays(
    plan.productId,
  );

  if (availableDays.length === 0) {
    await sendFn(t("scheduleNoSlotsToday"), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(
        t("btnCancelManualOrder"),
        "cancel_manual_order",
      ),
    });
    return false;
  }

  const kb = new InlineKeyboard();
  for (let i = 0; i < availableDays.length; i++) {
    const day = availableDays[i]!;
    kb.text(FA_DAY_NAMES[day]!, `slot_day_${day}`);
    if ((i + 1) % 3 === 0) kb.row();
  }
  if (availableDays.length % 3 !== 0) kb.row();
  kb.text(t("btnCancelManualOrder"), "cancel_manual_order", {
    icon_custom_emoji_id: emojiIds.cross,
  });

  state.phase = "day";

  await sendFn(t("schedulePickDay"), {
    parse_mode: "HTML",
    reply_markup: kb,
  });
  return true;
}
