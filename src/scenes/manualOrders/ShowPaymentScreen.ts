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
import { getUsdtRate, usdToTomanWithRate } from "../../services/tetherland";

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

  // `state.regionPrice` is already Toman. The plan base price is stored in USD,
  // so convert it once here and cache it on the state for downstream handlers.
  let originalPrice = state.regionPrice;
  if (originalPrice === undefined) {
    const usdtRate = await getUsdtRate();
    if (usdtRate === null) {
      await sendFn(t("priceRateUnavailable"), { parse_mode: "HTML" });
      return;
    }
    originalPrice = usdToTomanWithRate(parseFloat(plan.price as string), usdtRate);
  }
  state.basePriceToman = originalPrice;
  const pendingDiscount = state.discount ?? appliedDiscountState.get(userId);
  const hasDiscount =
    pendingDiscount !== undefined && pendingDiscount.planId === state.planId;
  const productName = getLocalizedName(product, user.languageCode);
  const planName = getLocalizedName(plan, user.languageCode);

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
      productName,
      planName,
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
