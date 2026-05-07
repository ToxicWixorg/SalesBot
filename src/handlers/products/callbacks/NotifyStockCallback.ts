import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { StockNotificationRepository } from "../../../repositories/ExtraRepositories.ts";

export async function NotifyStockCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const existing = await StockNotificationRepository.findByUserAndProduct(
    userId,
    productId,
  );

  if (existing) {
    if (!existing.isActive) {
      await StockNotificationRepository.reactivate(existing.id);
    }
    await context.answerCallbackQuery({
      text: t("stockAlreadySubscribed"),
      show_alert: true,
    });
    return;
  }

  await StockNotificationRepository.create({
    userId: userId as any,
    productId,
  });

  await context.answerCallbackQuery({
    text: t("stockSubscribed"),
    show_alert: true,
  });
}
