import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { ProductPlan } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../utils/customEmoji.ts";
import { getLocalizedName } from "../../utils/localizedFields.ts";
import { formatPriceLabel } from "../../utils/currency.ts";

export function productPlansKeyboard(
  t: TFunction,
  plans: ProductPlan[],
  productId: number,
  languageCode = "fa",
  usdtRate: number | null = null,
  categoryId: number | null = null,
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

    const safeEmojiId = normalizeCustomEmojiId(plan.customEmojiId);
    const opts = safeEmojiId
      ? { icon_custom_emoji_id: safeEmojiId }
      : undefined;

    // Price is stored in USD; show it converted to Toman with the live rate.
    // If the rate is unavailable, fall back to a USD ($) label.
    const usd = Number.parseFloat(plan.price as string);
    const priceLabel = formatPriceLabel(languageCode, usd, t, usdtRate).label;

    keyboard.text(
      `${getLocalizedName(plan, languageCode)} - ${priceLabel} (${duration})`,
      `select_plan_${plan.id}`,
      opts,
    );
    keyboard.row();
  });

  keyboard.text(
    t("btnBack"),
    categoryId != null ? `category_${categoryId}` : `categories`,
    {
      icon_custom_emoji_id: emojiIds.back,
    },
  );

  return keyboard;
}
