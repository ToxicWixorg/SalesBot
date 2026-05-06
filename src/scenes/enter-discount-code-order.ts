import { Scene } from "@gramio/scenes";
import { InlineKeyboard } from "gramio";
import { UserRepository } from "../repositories/UserRepository.ts";
import { DiscountCodeRepository } from "../repositories/DiscountCodeRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../repositories/ProductRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { orderConfirmationKeyboard } from "../shared/keyboards/index.ts";
import {
  discountEntryState,
  appliedDiscountState,
} from "../handlers/products/discountOrderState.ts";
import { emojiIds } from "../shared/locales/emojies.ts";

export const enterDiscountCodeOrderScene = new Scene(
  "enter-discount-code-order",
).on("message", async (context) => {
  if (!context.from || !context.text) return;

  const userId = context.from.id;
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  // Retrieve which plan this discount is for
  const planId = discountEntryState.get(userId);
  if (!planId) {
    await context.scene.exit();
    return;
  }

  const code = context.text.trim().toUpperCase();

  // Get plan to know the price
  const plan = await ProductPlanRepository.findById(planId);
  if (!plan) {
    await context.scene.exit();
    discountEntryState.delete(userId);
    return;
  }

  const originalPrice = parseFloat(plan.price as string);

  // Validate the discount code against the real order amount
  const validation = await DiscountCodeRepository.validateCode(
    code,
    userId,
    originalPrice,
  );

  if (!validation.valid || !validation.discountCode) {
    // Invalid — let user try again or skip
    await context.scene.exit();
    discountEntryState.delete(userId);

    return context.send(t("discountCodeInvalid", validation.message), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(t("btnTryAgain"), `add_discount_${planId}`, {
          icon_custom_emoji_id: null, //emojiIds.refresh,
        })
        .row()
        .text(t("btnSkipDiscount"), `select_plan_${planId}`, {
          icon_custom_emoji_id: null, //emojiIds.zap,
        }),
    });
  }

  const discountCode = validation.discountCode;

  // Check if code is restricted to certain products
  if (discountCode.productIds) {
    const allowedProductIds = discountCode.productIds as number[];
    if (!allowedProductIds.includes(plan.productId)) {
      await context.scene.exit();
      discountEntryState.delete(userId);

      return context.send(t("discountNotApplicableForProduct"), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text(t("btnTryAgain"), `add_discount_${planId}`, {
            icon_custom_emoji_id: null, //emojiIds.refresh,
          })
          .row()
          .text(t("btnSkipDiscount"), `select_plan_${planId}`, {
            icon_custom_emoji_id: null, //emojiIds.zap,
          }),
      });
    }
  }

  const discountAmount = DiscountCodeRepository.calculateDiscount(
    discountCode,
    originalPrice,
  );
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // Store the validated discount for use when confirm is clicked
  appliedDiscountState.set(userId, {
    planId,
    discountCodeId: discountCode.id,
    discountAmount,
    finalPrice,
    originalPrice,
    code,
  });

  await context.scene.exit();
  discountEntryState.delete(userId);

  // Build duration string for display
  const product = await ProductRepository.findById(plan.productId);
  let durationStr = "";
  if (plan.duration) {
    const unitKey = plan.durationUnit || "day";
    let unitLabel = "";
    if (unitKey === "day") unitLabel = t("duration_day");
    else if (unitKey === "month") unitLabel = t("duration_month");
    else if (unitKey === "year") unitLabel = t("duration_year");
    durationStr = `${plan.duration} ${unitLabel}`;
  }

  // Show updated order summary with discount applied
  const message = t("orderSummaryWithDiscount", {
    productName: product?.name ?? "",
    planName: plan.name,
    duration: durationStr,
    originalPrice: originalPrice.toFixed(0),
    discountAmount: discountAmount.toFixed(0),
    finalPrice: finalPrice.toFixed(0),
    code,
  });

  return context.send(message, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text(t("btnConfirmOrder"), `confirm_order_${planId}`, {
        icon_custom_emoji_id: null, //emojiIds.checkBold,
      })
      .row()
      .text(t("btnRemoveDiscount"), `select_plan_${planId}`, {
        icon_custom_emoji_id: null, //emojiIds.trash,
      })
      .row()
      .text(t("btnCancel"), "cancel_order", {
        icon_custom_emoji_id: null, //emojiIds.cross,
      }),
  });
});
