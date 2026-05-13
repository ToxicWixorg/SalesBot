import { type AnyBot, Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../../repositories/UserRepository.ts";
import { i18n } from "../../../../shared/locales/index.ts";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState.ts";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState.ts";
import { notifyAdminNewOrder } from "../../Helpers/notifyAdminNewOrder.ts";
import { emojiIds } from "../../../../shared/locales/emojies.ts";

export async function ConfirmCryptoCallback(
  ctx: Context,
  createPendingPaymentOrder: any,
  bot: AnyBot,
) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "payment") return;

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const result = await createPendingPaymentOrder(userId, state, "crypto");
  if (!result) {
    await ctx.editText(t("errorFetchingOrderDetails"), {
      parse_mode: "HTML",
    });
    return;
  }

  pendingOrderInfoState.delete(userId);
  pendingPaymentState.delete(userId);

  await notifyAdminNewOrder(bot, {
    orderId: result.orderId,
    userId,
    username: user?.username ?? null,
    firstName: user?.firstName ?? null,
    productName: result.productName,
    planName: result.planName,
    finalPrice: result.finalPrice,
    collected: state.collected,
    deliveryType: "manual",
    paymentMethod: "crypto",
  });

  await ctx.editText(t("payCryptoPending", String(result.orderId)), {
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
