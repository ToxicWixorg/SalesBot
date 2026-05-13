import { type AnyBot, Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../../repositories";
import { i18n } from "../../../../shared/locales";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";
import { emojiIds } from "../../../../shared/locales/emojies";

export async function ConfirmCardCallback(
  ctx: Context,
  createPendingPaymentOrder: any,
  notifyAdminNewOrder: any,
  bot: AnyBot,
) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const result = await createPendingPaymentOrder(userId, state, "card");
  if (!result) {
    await ctx.editText(t("errorFetchingOrderDetails"), {
      parse_mode: "HTML",
    });
    return;
  }

  pendingOrderInfoState.delete(userId);
  pendingPaymentState.delete(userId);

  // Notify admin
  await notifyAdminNewOrder(bot, {
    orderId: result.orderId,
    userId,
    username: user?.username ?? null,
    firstName: user?.firstName ?? null,
    productName: result.productName,
    planName: result.planName,
    finalPrice: result.finalPrice,
    collected: state.collected,
    steps: state.steps,
    deliveryType: "manual",
    paymentMethod: "card",
  });

  await ctx.editText(t("payCardPending", String(result.orderId)), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text(t("btnMyOrders"), "orders", {
        icon_custom_emoji_id: emojiIds.bag,
      })
      .row()
      .text(t("btnBackToMenu"), "categories", {
        icon_custom_emoji_id: emojiIds.home,
      }),
  });
}
