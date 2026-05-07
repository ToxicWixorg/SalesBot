import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { discountEntryState } from "../discountOrderState";
import { enterDiscountCodeOrderScene } from "../../../scenes/enter-discount-code-order";

export async function AddDiscountCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  discountEntryState.set(userId, planId);

  await context.editText(t("enterDiscountCodeForOrder"), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text(t("btnSkipDiscount"), `select_plan_${planId}`)
      .row()
      .text(t("btnCancel"), "cancel_order"),
  });

  await context.scene.enter(enterDiscountCodeOrderScene);
}
