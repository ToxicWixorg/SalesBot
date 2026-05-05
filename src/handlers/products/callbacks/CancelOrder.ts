import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { backToMainKeyboard } from "../../../shared/keyboards/index.ts";

export async function CancelOrderCallback(context: Context) {
  if (!context.from) return;

  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  await context.editText("❌ Order cancelled", {
    reply_markup: backToMainKeyboard(t),
    parse_mode: "HTML",
  });
}
