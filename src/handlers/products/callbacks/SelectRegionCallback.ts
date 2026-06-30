import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  ProductPlanRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";
import { orderConfirmationKeyboard } from "../../../shared/keyboards/index.ts";
import { getLocalizedName } from "../../../shared/utils/localizedFields.ts";
import {
  getUsdtRate,
  usdToTomanWithRate,
} from "../../../services/tetherland/index.ts";

export async function SelectRegionCallback(context: Context) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]!);
  const regionIndex = Number.parseInt(context.queryData[2]!);
  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode ?? "fa");

  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.answerCallbackQuery({
      text: t("planNotFound"),
      show_alert: true,
    });
    return;
  }

  const product = await ProductRepository.findById(plan.productId);
  if (!product) return;

  const regions: Array<{ flag: string; name: string; price?: string }> =
    plan.regions && plan.regions.length > 0 ? plan.regions : [];

  const region = regions[regionIndex];
  if (!region) {
    await context.answerCallbackQuery({
      text: t("regionNotFound"),
      show_alert: true,
    });
    return;
  }

  // Prices (region + plan) are stored in USD → convert to Toman with live rate.
  const usdtRate = await getUsdtRate();
  if (usdtRate === null) {
    await context.answerCallbackQuery({
      text: t("priceRateUnavailable"),
      show_alert: true,
    });
    return;
  }

  const regionPrice = region.price
    ? usdToTomanWithRate(parseFloat(region.price), usdtRate)
    : undefined;
  preSelectedRegionState.set(userId, {
    planId,
    flag: region.flag,
    name: region.name,
    price: regionPrice,
  });

  const effectivePrice =
    regionPrice ??
    usdToTomanWithRate(parseFloat(plan.price as string), usdtRate);
  const productName = getLocalizedName(product, user.languageCode);
  const planName = getLocalizedName(plan, user.languageCode);

  let duration = t("oneTime");
  if (plan.duration) {
    const unitKey = plan.durationUnit ?? "day";
    let unitLabel = "";
    if (unitKey === "day") unitLabel = t("duration_day");
    else if (unitKey === "month") unitLabel = t("duration_month");
    else if (unitKey === "year") unitLabel = t("duration_year");
    duration = `${plan.duration} ${unitLabel}`;
  }

  let message = `${t("orderSummary")}\n\n`;
  message += `📦 ${productName}\n`;
  message += `📋 ${planName} — ${duration}\n`;
  message += `🌍 ${t("selectedRegion")}: ${region.flag} ${region.name}\n`;
  message += `\n${t("total")} <b>${effectivePrice.toLocaleString()}</b> ${t("currency")}`;

  await context.editText(message, {
    parse_mode: "HTML",
    reply_markup: orderConfirmationKeyboard(t, planId),
  });
}
