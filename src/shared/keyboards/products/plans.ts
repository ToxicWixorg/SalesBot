import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { ProductPlan } from "../../../db/schema.ts";

export function productPlansKeyboard(
  t: TFunction,
  plans: ProductPlan[],
  productId: number,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  plans.forEach((plan) => {
    let duration = t("oneTime");

    if (plan.duration) {
      const unitKey = plan.durationUnit || "day";
      let durationUnit = "";

      if (unitKey === "day") durationUnit = t("duration_day");
      else if (unitKey === "month") durationUnit = t("duration_month");
      else if (unitKey === "year") durationUnit = t("duration_year");

      duration = `${plan.duration} ${durationUnit}`;
    }

    keyboard.text(
      `${plan.name} - ${plan.price} ${t("currency")} (${duration})`,
      `select_plan_${plan.id}`,
    );
    keyboard.row();
  });

  keyboard.text(t("btnBack"), `product_${productId}`);

  return keyboard;
}
