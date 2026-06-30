import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts"; 
import { mainKeyboard } from "../../../shared/keyboards/index.ts";

export async function mainCallback(context: any) {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  await context.editText(t("adminPanelMainMessage"), {
    parse_mode: "HTML",
    reply_markup: mainKeyboard(t),
  });
}
