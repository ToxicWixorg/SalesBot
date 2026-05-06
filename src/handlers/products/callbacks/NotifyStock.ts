import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { StockNotificationRepository } from "../../../repositories/ExtraRepositories.ts";

/**
 * Handles callback: notify_stock_{productId}
 *
 * Subscribes the user to get a notification when the product is restocked.
 * If already subscribed → answers with an alert.
 */
export async function NotifyStockCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]);
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);
  const t = i18n.buildT(user?.languageCode ?? "fa");

  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery(t("productNotFound"));
    return;
  }

  // Check if already subscribed
  const existing = await StockNotificationRepository.findByUserAndProduct(
    userId,
    productId,
  );

  if (existing?.isActive) {
    await context.answerCallbackQuery(t("stockAlreadySubscribed"), {
      show_alert: true,
    });
    return;
  }

  // Re-activate or create
  if (existing) {
    await StockNotificationRepository.reactivate(existing.id);
  } else {
    await StockNotificationRepository.create({
      userId: BigInt(userId) as any,
      productId,
      isActive: true,
    });
  }

  await context.answerCallbackQuery(t("stockSubscribed"), { show_alert: true });
}
