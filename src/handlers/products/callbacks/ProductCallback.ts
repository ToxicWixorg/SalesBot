import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { productDetailsKeyboard } from "../../../shared/keyboards/index.ts";
import { ProductRepository } from "../../../repositories/ProductRepository.ts";

export async function ProductCallback(
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
  const hasStock = stock > 0;

  let message = `<b>${product.name}</b>\n\n`;
  if (product.description) message += `${product.description}\n\n`;

  message += `${t("stock")} ${hasStock ? t("available") : t("outOfStock")}\n`;

  message += `${t("deliveryType")} `;
  if (
    product.deliveryType === "automatic" ||
    product.deliveryType === "inventory"
  ) {
    message += t("deliveryAutomatic");
  } else if (product.deliveryType === "manual") {
    message += t("deliveryManual");
  } else {
    message += t("deliveryCoordination");
  }

  if (product.warrantyDays && product.warrantyDays > 0) {
    message += `\n${t("warrantyDays", { days: product.warrantyDays })}`;
  }

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: productDetailsKeyboard(t, product, hasStock),
  });
}
