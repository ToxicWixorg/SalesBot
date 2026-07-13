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
import { formatPriceLabel } from "../../shared/utils/currency";
import { getUsdtRate } from "../../services/tetherland/index.ts";
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

  // fa users see every figure in Toman (no dollar); others see USD. Fetch the
  // rate once and reuse it for all money on this screen.
  const usdtRate = user.languageCode === "fa" ? await getUsdtRate() : null;
  const money = (usd: number) =>
    formatPriceLabel(user.languageCode, usd, t, usdtRate).label;
  const unitPriceLabel = money(parseFloat(plan.price as string));
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
      unitPriceLabel,
      originalPrice: pricing.totalOriginal,
      originalPriceLabel:
        quantity > 1 ? money(pricing.totalOriginal) : unitPriceLabel,
      discountCode: hasDiscount ? pendingDiscount!.code : undefined,
      discountAmount: hasDiscount ? pricing.totalDiscount : undefined,
      finalPrice,
      walletBalance,
      formatMoney: money,
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
