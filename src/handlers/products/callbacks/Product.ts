import { Context } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";
import { productDetailsKeyboard } from "../../../shared/keyboards/index.ts";

export async function ProductCallback(context: Context) {
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

  const hasStock = (product.stock || 0) > 0;

  // Build product details message
  let message = `${t("productDetails")}\n\n`;
  message += `📦 ${product.name}\n\n`;

  if (product.description) {
    message += `${product.description}\n\n`;
  }

  // Stock status
  message += `${t("stock")} ${hasStock ? t("available") : t("outOfStock")}\n`;

  // Delivery type
  message += `${t("deliveryType")} `;
  if (product.deliveryType === "automatic") {
    message += t("deliveryAutomatic");
  } else if (product.deliveryType === "manual") {
    message += t("deliveryManual");
  } else {
    message += t("deliveryCoordination");
  }

  await context.editText(message, {
    reply_markup: productDetailsKeyboard(t, product, hasStock),
    parse_mode: "HTML",
  });
}
