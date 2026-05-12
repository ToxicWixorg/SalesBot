import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";

function resolvePromptText(t: any, key: string, label: string) {
  const legacyPromptKeyMap: Record<string, string> = {
    email: "manualOrderEmailPrompt",
    password: "manualOrderPasswordPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };
  const legacy = legacyPromptKeyMap[key];
  return legacy ? t(legacy as any) : `📝 <b>${label}</b> را وارد کنید:`;
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

  await ctx.editText(resolvePromptText(t, step.key, step.label), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(
      t("btnCancelManualOrder"),
      "cancel_manual_order",
    ),
  });
}
