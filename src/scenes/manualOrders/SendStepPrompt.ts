import { InlineKeyboard } from "gramio";
import { PendingOrderInfo } from "../../handlers/products/pendingOrderInfoState";
import { emojiIds } from "../../shared/locales/emojies";

function resolvePromptText(t: any, step: PendingOrderInfo["steps"][number]) {
  const legacyPromptKeyMap: Record<string, string> = {
    email: "manualOrderEmailPrompt",
    password: "manualOrderPasswordPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };

  const legacyPromptKey = legacyPromptKeyMap[step.key];
  if (legacyPromptKey) return t(legacyPromptKey as any);

  const placeholder = step.placeholder?.trim();
  return placeholder
    ? `📝 <b>${step.label}</b>\n<blockquote>${placeholder}</blockquote>`
    : `📝 <b>${step.label}</b> را وارد کنید:`;
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

  const stepIndicator = t("manualOrderStep", { current, total });
  const promptText = `${stepIndicator}\n\n${resolvePromptText(t, step)}`;

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
