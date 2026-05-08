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

  const originalPrice = state.regionPrice ?? parseFloat(plan.price as string);
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;

  const finalPrice = hasDiscount ? pendingDiscount.finalPrice : originalPrice;
  const walletBalance = parseFloat(user.walletBalance ?? "0");

  // Fetch payment settings and active cards for dynamic keyboard
  const [paySettings, activeCards] = await Promise.all([
    PaymentRepository.getSettings(),
    PaymentRepository.getActiveCards(),
  ]);

  state.phase = "payment";

  await sendFn(
    buildPaymentSummaryText(t, {
      productName: product.name,
      planName: plan.name,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      collected: state.collected,
      originalPrice,
      discountCode: hasDiscount ? pendingDiscount.code : undefined,
      discountAmount: hasDiscount ? pendingDiscount.discountAmount : undefined,
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
      }),
    },
  );
}
