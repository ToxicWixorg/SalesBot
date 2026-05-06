import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { discountEnterKeyboard } from "../../../shared/keyboards/index.ts";

export async function EnterDiscountCodeCallback(context: Context) {
  if (!context.from) {
    return context.answerCallbackQuery({
      text: i18n.buildT("en")("userIdentificationError"),
      show_alert: true,
    });
  }

  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode || "en");

  if (!user) {
    return context.answerCallbackQuery({
      text: t("userNotFound"),
      show_alert: true,
    });
  }

  await context.answerCallbackQuery();

  // ذخیره state برای دریافت کد تخفیف
  if (context.scene) {
    const { enterDiscountCodeScene } =
      await import("../../../scenes/enter-discount-code.ts");
    await context.scene.enter(enterDiscountCodeScene);
  }

  return context.editText(t("enterDiscountCodePrompt"), {
    reply_markup: discountEnterKeyboard(t),
    parse_mode: "HTML",
  });
}
