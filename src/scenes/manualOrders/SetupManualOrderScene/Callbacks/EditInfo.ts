import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";

function resolvePromptText(step: any, lang: string) {
  let text = step.textFA;
  if (lang === "en") text = step.textEN || step.textFA;
  else if (lang === "ru") text = step.textRU || step.textFA;
  text = text || step.textFA || step.textEN || step.textRU || "";
  return `📝 <b>${text}</b>`;
}

export async function EditInfoCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state) return;

  const [, , stepName] = ctx.queryData as [string, string, string];
  const step = state.steps.find((x) => x.key === stepName);
  if (!step) return;

  state.editingStep = step.key;
  state.phase = "info";

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "en");

  const lang = user?.languageCode || "fa";
  await ctx.editText(resolvePromptText(step, lang), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(
      t("btnCancelManualOrder"),
      "cancel_manual_order",
    ),
  });
}
