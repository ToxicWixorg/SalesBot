import { InlineKeyboard } from "gramio";
import type { TFunction } from "../../locales/index.ts";
import type { ProductPlan } from "../../../db/schema.ts";
import { emojiIds } from "../../locales/emojies.ts";
import { normalizeCustomEmojiId } from "../../utils/customEmoji.ts";
import { getLocalizedName } from "../../utils/localizedFields.ts";

export function productPlansKeyboard(
  t: TFunction,
  plans: ProductPlan[],
  productId: number,
  languageCode = "fa",
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

    keyboard.text(
      `${getLocalizedName(plan, languageCode)} - ${plan.price} ${t("currency")} (${duration})`,
      `select_plan_${plan.id}`,
      opts,
    );
    keyboard.row();
  });

  keyboard.text(t("btnBack"), `categories`, {
    icon_custom_emoji_id: emojiIds.back,
  });

  return keyboard;
}
