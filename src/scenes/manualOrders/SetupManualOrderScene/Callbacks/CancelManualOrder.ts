import { Context, InlineKeyboard } from "gramio";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";

export async function CancelManualOrderCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (userId) pendingOrderInfoState.delete(userId);

  const user = userId ? await UserRepository.findById(userId) : null;
  const t = i18n.buildT(user?.languageCode ?? "en");

  await ctx.editText(t("manualOrderCancelled"), {
    reply_markup: new InlineKeyboard().text(t("btnMainMenu"), "categories"),
    parse_mode: "HTML",
  });
}
