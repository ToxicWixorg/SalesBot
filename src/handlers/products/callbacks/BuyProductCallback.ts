import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  ProductPlanRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { productPlansKeyboard } from "../../../shared/keyboards/index.ts";
import { e } from "../../../shared/locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../../shared/utils/customEmoji.ts";

export async function BuyProductCallback(
  context: Context,
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

  const stock = await getEffectiveStock(product);
  if (stock <= 0) {
    await context.answerCallbackQuery({
      text: t("insufficientBalanceAlert"),
      show_alert: true,
    });
    return;
  }

  const plans = await ProductPlanRepository.findByProductId(productId);
  if (plans.length === 0) {
    await context.answerCallbackQuery({
      text: t("noPlansAvailable"),
      show_alert: true,
    });
    return;
  }

  const safeEmojiId = normalizeCustomEmojiId(product.customEmojiId);
  const title = safeEmojiId
    ? `<tg-emoji emoji-id="${safeEmojiId}">🛍️</tg-emoji> `
    : e.bag;

  await context.editText(
    `${title}<b>${product.name}</b>\n\n${t("selectPlan")}`,
    {
      parse_mode: "HTML",
      reply_markup: productPlansKeyboard(t, plans, productId),
    },
  );
}
