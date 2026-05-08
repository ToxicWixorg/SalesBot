import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import {
  InfoStep,
  pendingOrderInfoState,
} from "../../../../handlers/products/pendingOrderInfoState";
import { getPromptKey } from "../../Helpers/getPromptKey";

export async function EditInfoCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state) return;

  const [, , stepName] = ctx.queryData as [string, string, string];
  const step = stepName as InfoStep;
  if (!state.steps.includes(step)) return;

  state.editingStep = step;
  state.phase = "info";

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "en");

  const promptKey = getPromptKey(step);
  await ctx.editText(t(promptKey as any), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(
      t("btnCancelManualOrder"),
      "cancel_manual_order",
    ),
  });
}
