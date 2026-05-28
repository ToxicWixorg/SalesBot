import { InlineKeyboard } from "gramio";
import { PendingOrderInfo } from "../../handlers/products/pendingOrderInfoState";
import { emojiIds } from "../../shared/locales/emojies";
import { UserRepository } from "../../repositories";

function resolvePromptText(
  t: any,
  step: PendingOrderInfo["steps"][number],
  lang: string,
) { 
  const text =
    step.displayText ||
    (lang === "en"
      ? step.textEN || step.textFA
      : lang === "ru"
        ? step.textRU || step.textFA
        : step.textFA || step.textEN || step.textRU) ||
    step.key;
  return `📝 <b>${text}</b>`;
}

export async function sendStepPrompt(
  ctx: any,
  t: any,
  state: PendingOrderInfo,
  isEdit = false,
) {
  const step = state.steps[state.currentStep];
  const total = state.steps.length;
  const current = state.currentStep + 1;
  const user = await UserRepository.findById(ctx.from?.id);
  const lang = user?.languageCode || "fa";
  const stepIndicator = t("manualOrderStep", { current, total });
  const promptText = `${stepIndicator}\n\n${resolvePromptText(t, step, lang)}`;
  const keyboard = new InlineKeyboard().text(
    t("btnCancelManualOrder"),
    "cancel_manual_order",
    { icon_custom_emoji_id: emojiIds.reject },
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
