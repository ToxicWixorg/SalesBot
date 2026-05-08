import { InlineKeyboard } from "gramio";
import { PendingOrderInfo } from "../../handlers/products/pendingOrderInfoState";
import { emojiIds } from "../../shared/locales/emojies";

export async function sendStepPrompt(
  ctx: any,
  t: any,
  state: PendingOrderInfo,
  isEdit = false,
  getPromptKey: any,
) {
  const step = state.steps[state.currentStep];
  const total = state.steps.length;
  const current = state.currentStep + 1;

  const stepIndicator = t("manualOrderStep", { current, total });
  const promptText = `${stepIndicator}\n\n${t(getPromptKey(step) as any)}`;

  const keyboard = new InlineKeyboard().text(
    t("btnCancelManualOrder"),
    "cancel_manual_order",
    { icon_custom_emoji_id: emojiIds.cross },
  );

  if (isEdit) {
    await ctx.editText(promptText, {
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } else {
    await ctx.send(promptText, { reply_markup: keyboard, parse_mode: "HTML" });
  }
}
