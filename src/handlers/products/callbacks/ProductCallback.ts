import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { productDetailsKeyboard } from "../../../shared/keyboards/index.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { e } from "../../../shared/locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../../shared/utils/customEmoji.ts";

export async function ProductCallback(context: any, getEffectiveStock: any) {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]!);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  const stock = await getEffectiveStock(product);
  const hasStock = stock > 0;

  const safeEmojiId = normalizeCustomEmojiId(product.customEmojiId);

  let message = safeEmojiId
    ? `<tg-emoji emoji-id="${safeEmojiId}">🛍️</tg-emoji> `
    : e.bag;

  message += `<b>${product.name}</b>\n\n`;
  if (product.description) message += `${product.description}\n\n`;

  message += `${t("stock")} ${hasStock ? t("available") : t("outOfStock")}\n`;

  if (product.warrantyDays && product.warrantyDays > 0) {
    message += `\n${t("warrantyDays", { days: product.warrantyDays })}`;
  }

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: productDetailsKeyboard(t, product, hasStock),
  });
}
