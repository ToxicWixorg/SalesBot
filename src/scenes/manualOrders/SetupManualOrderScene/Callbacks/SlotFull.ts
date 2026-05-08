import { Context } from "gramio";
import { UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";

export async function SlotFullCallback(ctx: Context) {
  const userId = ctx.from?.id;
  const user = userId ? await UserRepository.findById(userId) : undefined;
  const t = i18n.buildT(user?.languageCode ?? "fa");
  await ctx.answerCallbackQuery(t("scheduleSlotFullAlert"));
}
