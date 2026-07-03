import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";

/**
 * Pending "report a problem" state, keyed by the buyer's Telegram id.
 * Set when a user taps "report problem" on one of their orders; the next text
 * message they send is forwarded to the Reports topic of the forum group.
 * Consumed by setupOrderReportHandler (orderReport.ts).
 */
export const orderReportState = new Map<number, { orderId: number }>();

export async function OrderReportPeroblemCallback(context: Context) {
  const orderId = parseInt(context.queryData[1]);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const order = await OrderRepository.findById(orderId);

    if (!order || Number(order.userId) !== userId) {
      await context.answerCallbackQuery({
        text: t("orderNotFound"),
        show_alert: true,
      });
      return;
    }

    // Start the report flow — capture the user's next message as the description.
    orderReportState.set(userId, { orderId });
    await context.answerCallbackQuery();
    await context.editText(t("orderReportPrompt"), { parse_mode: "HTML" });
  } catch (error) {
    console.error("[ORDERS] Error reporting problem:", error);
    await context.answerCallbackQuery({
      text: t("errorReportingProblem"),
      show_alert: true,
    });
  }
}
