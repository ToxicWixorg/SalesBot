import { InlineKeyboard } from "gramio";
import { i18n } from "../shared/locales/index.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import { ProductRepository } from "../repositories/ProductRepository.ts";
import { StockNotificationRepository } from "../repositories/ExtraRepositories.ts";
import { getBotInstance } from "../botInstance.ts";

/**
 * After inventory items are added to a product, call this to notify
 * all users who subscribed to "notify when back in stock".
 *
 * Uses the shared bot singleton (getBotInstance), so it must be called
 * after setBotInstance() has been called (i.e., after bot startup).
 *
 * Called from: InventoryRepository.bulkCreate (via wrapper) or any place
 * that increases available stock for a product.
 */
export async function notifyRestockedUsers(productId: number): Promise<void> {
  const subscribers = await StockNotificationRepository.findActiveByProductId(productId);
  if (subscribers.length === 0) return;

  const product = await ProductRepository.findById(productId);
  if (!product) return;

  const bot = getBotInstance();

  for (const sub of subscribers) {
    const userId = Number(sub.userId);

    try {
      const user = await UserRepository.findById(userId);

      // Respect per-user global stock notification setting
      if (user?.notifyStock === false) continue;

      const t = i18n.buildT(user?.languageCode ?? "fa");

      const keyboard = new InlineKeyboard()
        .text(t("btnBuyProduct"), `buy_product_${productId}`)
        .row()
        .text(t("btnBack"), `product_${productId}`);

      await (bot.api as any).sendMessage({
        chat_id: userId,
        text: t("stockRestocked", { productName: product.name }),
        parse_mode: "HTML",
        reply_markup: keyboard,
      });

      await StockNotificationRepository.markAsSent(sub.id);
    } catch {
      // User may have blocked the bot — silently skip
    }
  }
}
