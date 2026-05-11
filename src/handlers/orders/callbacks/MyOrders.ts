import { Context, InlineKeyboard } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { ordersListKeyboard } from "../../../shared/keyboards/index.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";

export async function MyOrderCallback(context: Context) {
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);

  const t = i18n.buildT(user?.languageCode || "fa");

  if (!user) {
    return context.answerCallbackQuery({
      text: t("userNotFound"),
    });
  }

  try {
    const orders = await OrderRepository.findByUserId(userId);

    if (orders.length === 0) {
      await context.editText(t("ordersEmpty"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text(t("btnProducts"), "products", {
            icon_custom_emoji_id: emojiIds.trolley,
            style: "primary",
          })
          .row()
          .text(t("btnMainMenu"), "main_menu", {
            icon_custom_emoji_id: emojiIds.back,
          }),
      });
      return;
    }

    const activeOrders = orders.filter((o) =>
      [
        "paid",
        "pending_admin",
        "waiting_schedule",
        "scheduled",
        "in_progress",
        "active",
        "waiting_invite",
        "invite_sent",
        "waiting_user_action",
        "join_link_sent",
        "in_queue",
      ].includes(o.status),
    );

    const completedOrders = orders.filter((o) => o.status === "completed");
    const otherOrders = orders.filter(
      (o) => !activeOrders.includes(o) && !completedOrders.includes(o),
    );

    let message = `${t("ordersTitle")}\n\n`;
    message += `${t("ordersTotal")}: ${orders.length}\n`;
    message += `${t("ordersActive")}: ${activeOrders.length}\n`;
    message += `${t("ordersCompleted")}: ${completedOrders.length}\n\n`;
    message += t("ordersSelectFilter");

    await context.editText(message, {
      reply_markup: ordersListKeyboard(t),
      parse_mode: "HTML",
    });

    await context.answerCallbackQuery();
  } catch (error) {
    console.error("[ORDERS] Error fetching orders:", error);
    await context.answerCallbackQuery({
      text: t("errorFetchingOrders"),
      show_alert: true,
    });
  }
}
