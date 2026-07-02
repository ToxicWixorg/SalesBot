import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  ProductPlanRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import { enterQuantityState } from "./EnterQuantity.ts";
import { appliedDiscountState } from "../discountOrderState.ts";
import {
  inventoryOrderSummaryKeyboard,
  orderConfirmationKeyboard,
} from "../../../shared/keyboards/index.ts";
import { regionSelectionKeyboard } from "../../../shared/keyboards/products/regionSelect.ts";
import { getLocalizedName } from "../../../shared/utils/localizedFields.ts";
import {
  getUsdtRate,
  usdToTomanWithRate,
} from "../../../services/tetherland/index.ts";

export async function SelectPlanCallback(context: Context<any>) {
  if (!context.from || !context.queryData) return;

  const planId = Number.parseInt(context.queryData[1]!);
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
  if (!product) {
    await context.answerCallbackQuery({
      text: t("productNotFound"),
      show_alert: true,
    });
    return;
  }

  preSelectedRegionState.delete(userId);
  const productName = getLocalizedName(product, user.languageCode);
  const planName = getLocalizedName(plan, user.languageCode);

  // Prices are stored in USD; we need the live USDT→Toman rate to show/charge.
  const usdtRate = await getUsdtRate();
  if (usdtRate === null) {
    await context.answerCallbackQuery({
      text: t("priceRateUnavailable"),
      show_alert: true,
    });
    return;
  }

  if (plan.deliveryType === "automatic") {
    const available = await InventoryRepository.countAvailable(product.id);
    if (available <= 0) {
      await context.answerCallbackQuery({
        text: t("outOfStock"),
        show_alert: true,
      });
      return;
    }

    // Ready/automatic products are sold one unit at a time — skip the quantity
    // prompt and go straight to the single-item order summary.
    enterQuantityState.delete(userId);
    const qty = 1;

    const unitPrice = usdToTomanWithRate(
      parseFloat(plan.price as string),
      usdtRate,
    );
    const discount = appliedDiscountState.get(userId);
    const hasDiscount = discount && discount.planId === planId;
    const finalTotal = hasDiscount ? discount.finalPrice * qty : unitPrice * qty;

    await context.editText(
      t("inventoryOrderSummary", {
        productName,
        qty,
        unitPrice: unitPrice.toLocaleString(),
        total: finalTotal.toLocaleString(),
        currency: t("currency"),
      }),
      {
        parse_mode: "HTML",
        reply_markup: inventoryOrderSummaryKeyboard(t, planId, qty, false),
      },
    );
    return;
  }

  if (plan.deliveryType === "manual") {
    console.log("[PlanDetail] ", plan);
    const regions: Array<{ flag: string; name: string; price?: string }> =
      plan.regions && plan.regions.length > 0 ? plan.regions : [];

    if (regions.length > 0) {
      await context.editText(t("selectRegion"), {
        parse_mode: "HTML",
        reply_markup: regionSelectionKeyboard(t, planId, regions, usdtRate),
      });
      return;
    }

    const price = usdToTomanWithRate(parseFloat(plan.price as string), usdtRate);
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
    message += `\n${t("total")} <b>${price.toLocaleString()}</b> ${t("currency")}`;

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderConfirmationKeyboard(t, planId),
    });
    return;
  }

  if (plan.deliveryType === "custom_schedule") {
    const regions: Array<{ flag: string; name: string; price?: string }> =
      plan.regions && plan.regions.length > 0 ? plan.regions : [];

    if (regions.length > 0) {
      await context.editText(t("selectRegion"), {
        parse_mode: "HTML",
        reply_markup: regionSelectionKeyboard(t, planId, regions, usdtRate),
      });
      return;
    }

    const price = usdToTomanWithRate(parseFloat(plan.price as string), usdtRate);
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
    message += `\n${t("total")} <b>${price.toLocaleString()}</b> ${t("currency")}`;

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderConfirmationKeyboard(t, planId),
    });
    return;
  }

  {
    const regions: Array<{ flag: string; name: string; price?: string }> =
      plan.regions && plan.regions.length > 0 ? plan.regions : [];

    if (regions.length > 0) {
      await context.editText(t("selectRegion"), {
        parse_mode: "HTML",
        reply_markup: regionSelectionKeyboard(t, planId, regions, usdtRate),
      });
      return;
    }

    const price = usdToTomanWithRate(parseFloat(plan.price as string), usdtRate);
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
    message += `\n${t("total")} <b>${price.toLocaleString()}</b> ${t("currency")}`;

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderConfirmationKeyboard(t, planId),
    });
  }
}
