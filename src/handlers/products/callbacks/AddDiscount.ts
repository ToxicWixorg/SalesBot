import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  discountEntryState,
  appliedDiscountState,
} from "../discountOrderState.ts";
import { enterDiscountCodeOrderScene } from "../../../scenes/enter-discount-code-order.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";

export async function AddDiscountCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]);
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  // Clear any previously applied discount for this user
  appliedDiscountState.delete(userId);

  // Store the planId so the scene can look it up
  discountEntryState.set(userId, planId);

  // Enter the discount code scene
  if (context.scene) {
    await context.scene.enter(enterDiscountCodeOrderScene);
  }

  await context.editText(t("enterDiscountCodeForOrder"), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text(t("btnSkipDiscount"), `select_plan_${planId}`, {
        icon_custom_emoji_id: null, //emojiIds.zap,
      })
      .row()
      .text(t("btnCancel"), "cancel_order", {
        icon_custom_emoji_id: null, //emojiIds.cross,
      }),
  });
}
