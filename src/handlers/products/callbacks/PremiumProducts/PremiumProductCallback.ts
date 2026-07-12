import { UserRepository } from "../../../../repositories/UserRepository.ts";
import { i18n } from "../../../../shared/locales/index.ts";
import {
  backKeyboard,
  productDetailsKeyboard,
  productPlansKeyboard,
} from "../../../../shared/keyboards/index.ts";
import {
  ProductPlanRepository,
  ProductRepository,
} from "../../../../repositories/ProductRepository.ts";
import { e } from "../../../../shared/locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../../../shared/utils/customEmoji.ts";
import {
  getLocalizedDescription,
  getLocalizedName,
} from "../../../../shared/utils/localizedFields.ts";
import { getUsdtRate } from "../../../../services/tetherland/index.ts";

export async function PremiumProductCallback(
  context: any,
  getEffectiveStock: any,
) {
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

  // Effective stock = available inventory items, falling back to the manual
  // `stock` field. This is informational only — it must NOT hide the plans,
  // since manual/scheduled plans don't depend on inventory and automatic plans
  // enforce their own stock check at selection time (SelectPlanCallback).

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

  if (product.warrantyDays && product.warrantyDays > 0) {
    message += `\n${t("warrantyDays", { days: product.warrantyDays })}`;
  }

  const plans = await ProductPlanRepository.findByProductId(productId);

  if (plans.length > 0) {
    const usdtRate = await getUsdtRate();

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: productPlansKeyboard(
        t,
        plans,
        productId,
        user.languageCode,
        usdtRate,
        product.categoryId ?? null,
      ),
    });
    return;
  }

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: backKeyboard(
      t,
      product.categoryId != null
        ? `category_${product.categoryId}`
        : `categories`,
    ),
  });
}
