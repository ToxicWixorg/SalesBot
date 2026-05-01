import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";

export async function OrderOpenTicketCallback(context: Context) {
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

    // Trigger ticket creation flow
    await context.answerCallbackQuery();
    // The callback is already registered in ticket-scenes.ts
  } catch (error) {
    console.error("[ORDERS] Error opening ticket:", error);
    await context.answerCallbackQuery({
      text: "❌ خطا در باز کردن تیکت",
      show_alert: true,
    });
  }
}
