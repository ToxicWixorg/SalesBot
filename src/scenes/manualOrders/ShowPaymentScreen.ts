import { appliedDiscountState } from "../../handlers/products/discountOrderState";
import {
  buildPaymentSummaryText,
  paymentKeyboard,
} from "../../handlers/products/orderPayment";
import { PendingOrderInfo } from "../../handlers/products/pendingOrderInfoState";
import {
  ProductPlanRepository,
  ProductRepository,
  UserRepository,
} from "../../repositories";
import { PaymentRepository } from "../../repositories/PaymentRepository";
import { i18n } from "../../shared/locales";
import { getLocalizedName } from "../../shared/utils/localizedFields";
import { formatPriceForUser, formatUsd } from "../../shared/utils/currency";
import { resolveOrderPricing } from "./Helpers/orderPricing";

export async function showPaymentScreen(
  sendFn: (text: string, opts?: any) => Promise<any>,
  userId: number,
  state: PendingOrderInfo,
) {
  const user = await UserRepository.findById(userId);
  if (!user) return;
  const t = i18n.buildT(user.languageCode || "en");

  const plan = await ProductPlanRepository.findById(state.planId);
  if (!plan) return;
  const product = await ProductRepository.findById(plan.productId);
  if (!product) return;

  // Both `state.regionPrice` and the plan base price are stored in USD.
  // Resolve the per-unit base USD price once here and cache it for downstream
  // handlers (they read `basePriceUsd` as the per-unit price).
  const unitOriginal =
    state.regionPrice ?? parseFloat(plan.price as string);
  state.basePriceUsd = unitOriginal;

  // Quantity-aware totals — single source of truth shared with every pay path.
  const pricing = resolveOrderPricing(
    userId,
    state,
    parseFloat(plan.price as string),
  );
  const quantity = pricing.quantity;

  const priceInfo = await formatPriceForUser(
    user.languageCode || "en",
    parseFloat(plan.price as string),
    t,
    { showUsd: true },
  );
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount = pricing.hasDiscount;
  const productName = getLocalizedName(product, user.languageCode);
  const planName = getLocalizedName(plan, user.languageCode);

  const finalPrice = pricing.totalFinal;
  const walletBalance = parseFloat(user.walletBalance ?? "0");

  // Fetch payment settings and active cards for dynamic keyboard
  const [paySettings, activeCards] = await Promise.all([
    PaymentRepository.getSettings(),
    PaymentRepository.getActiveCards(),
  ]);

  state.phase = "payment";

  await sendFn(
    buildPaymentSummaryText(t, {
      productName,
      planName,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      collected: state.collected,
      quantity,
      unitPriceLabel: priceInfo.label,
      originalPrice: pricing.totalOriginal,
      originalPriceLabel:
        quantity > 1 ? formatUsd(pricing.totalOriginal) : priceInfo.label,
      discountCode: hasDiscount ? pendingDiscount!.code : undefined,
      discountAmount: hasDiscount ? pricing.totalDiscount : undefined,
      finalPrice,
      walletBalance,
    }),
    {
      parse_mode: "HTML",
      reply_markup: paymentKeyboard(t, state.planId, {
        settings: paySettings,
        cards: activeCards,
        walletBalance,
        finalPrice,
        languageCode: user.languageCode || "en",
      }),
    },
  );
}
