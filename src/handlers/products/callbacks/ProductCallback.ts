import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  backKeyboard,
  productDetailsKeyboard,
  productPlansKeyboard,
} from "../../../shared/keyboards/index.ts";
import {
  ProductPlanRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { e } from "../../../shared/locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../../shared/utils/customEmoji.ts";
import {
  getLocalizedDescription,
  getLocalizedName,
} from "../../../shared/utils/localizedFields.ts";

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

  const hasStock = product.stock;

  const safeEmojiId = normalizeCustomEmojiId(product.customEmojiId);

  const productName = getLocalizedName(product, user.languageCode);
  const productDescription = getLocalizedDescription(
    product,
    user.languageCode,
  );

  let message = safeEmojiId
    ? `<tg-emoji emoji-id="${safeEmojiId}">🛍️</tg-emoji> `
    : e.bag;

  message += `<b>${productName}</b>\n\n`;
  if (productDescription) message += `${productDescription}\n\n`;

  message += `${t("stock")} ${hasStock ? t("available") : t("outOfStock")}\n`;

  if (product.warrantyDays && product.warrantyDays > 0) {
    message += `\n${t("warrantyDays", { days: product.warrantyDays })}`;
  }

  if (hasStock) {
    const plans = await ProductPlanRepository.findByProductId(productId);

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: productPlansKeyboard(
        t,
        plans,
        productId,
        user.languageCode,
      ),
    });
    return;
  }

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: backKeyboard(t, `categories`),
  });
}
