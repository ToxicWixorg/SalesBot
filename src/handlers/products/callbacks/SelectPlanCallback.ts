import { Context } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import {
  ProductPlanRepository,
  ProductRepository,
  ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import { enterQuantityState } from "./EnterQuantity.ts";
import {
  enterQuantityKeyboard,
  orderConfirmationKeyboard,
} from "../../../shared/keyboards/index.ts";
import { languageSelectionScene } from "../../../scenes/language-selection.ts";
import { regionSelectionKeyboard } from "../../../shared/keyboards/products/regionSelect.ts";

export async function SelectPlanCallback(context: Context) {
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

  if (product.deliveryType === "inventory") {
    const available = await InventoryRepository.countAvailable(product.id);
    if (available <= 0) {
      await context.answerCallbackQuery({
        text: t("outOfStock"),
        show_alert: true,
      });
      return;
    }

    enterQuantityState.set(userId, { planId, productId: product.id });

    await context.editText(t("enterQuantityPrompt"), {
      parse_mode: "HTML",
      reply_markup: enterQuantityKeyboard(t, product.id),
    });
    return;
  }

  if (product.deliveryType === "manual") {
    console.log("[PlanDetail] ", plan);
    const regions: Array<{ flag: string; name: string; price?: string }> =
      plan.regions && plan.regions.length > 0 ? plan.regions : [];

    if (regions.length > 0) {
      await context.editText(t("selectRegion"), {
        parse_mode: "HTML",
        reply_markup: regionSelectionKeyboard(t, planId, regions),
      });
      return;
    }

    const price = parseFloat(plan.price as string);
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
    message += `📦 ${product.name}\n`;
    message += `📋 ${plan.name} — ${duration}\n`;
    message += `\n${t("total")} <b>${price.toLocaleString()}</b> ${t("currency")}`;

    await context.editText(message, {
      parse_mode: "HTML",
      reply_markup: orderConfirmationKeyboard(t, planId),
    });
  }
}
