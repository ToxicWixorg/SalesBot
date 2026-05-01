import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { productPlansKeyboard } from "../../../shared/keyboards/index.ts";

export async function BuyProductCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const productId = Number.parseInt(context.queryData[1]);
  const user = await UserRepository.findById(context.from.id);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "en");

  // Get product
  const product = await ProductRepository.findById(productId);
  if (!product) {
    await context.answerCallbackQuery("❌ Product not found");
    return;
  }

  // Check stock
  if ((product.stock || 0) <= 0) {
    await context.answerCallbackQuery("❌ Out of stock");
    return;
  }

  // Get plans
  const plans = await ProductPlanRepository.findByProductId(productId);

  if (plans.length === 0) {
    await context.answerCallbackQuery("❌ No plans available");
    return;
  }

  let message = `📦 ${product.name}\n\n`;
  message += `${t("selectPlan")}`;

  await context.editText(message, {
    reply_markup: productPlansKeyboard(t, plans, productId),
  });
}
