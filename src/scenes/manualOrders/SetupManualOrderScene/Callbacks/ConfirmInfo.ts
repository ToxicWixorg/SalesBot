import { Context } from "gramio";
import { showPaymentScreen } from "../..";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";

export async function ConfirmInfoCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = pendingOrderInfoState.get(userId);
  if (!state || state.phase !== "review") return;

  await showPaymentScreen(
    (text, opts) => ctx.editText(text, opts),
    userId,
    state,
  );
}
