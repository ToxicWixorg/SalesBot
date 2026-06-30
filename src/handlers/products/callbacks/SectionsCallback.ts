import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { SectionsKeyboard } from "../../../shared/keyboards/sections/sections.ts";

export async function SectionsCallback(context: any) {
  if (!context.from || !context.queryData) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  await context.editText(t("SectionMessage"), {
    parse_mode: "HTML",
    reply_markup: SectionsKeyboard(t),
  });
}
