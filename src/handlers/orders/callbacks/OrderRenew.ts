import { InlineKeyboard } from "gramio";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { OrderRepository } from "../../../repositories/OrderRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { PaymentRepository } from "../../../repositories/PaymentRepository.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { renewalPendingState } from "../renewState.ts";

export async function OrderRenewCallback(context: any) {
  await context.answerCallbackQuery();
  const orderId = parseInt(context.queryData[1]);
  const userId = context.from.id;

  const user = await UserRepository.findById(userId);
  if (!user) return;

  const t = i18n.buildT(user.languageCode || "fa");

  try {
    const order = await OrderRepository.findById(orderId);

    if (!order || Number(order.userId) !== userId) {
      await context.answerCallbackQuery({
        text: t("orderNotFound"),
        show_alert: true,
      });
      return;
    }

    const product = await ProductRepository.findById(order.productId);
    if (!product?.isRenewable) {
      await context.answerCallbackQuery({
        text: t("orderNotRenewable"),
        show_alert: true,
      });
      return;
    }

    const plan = await ProductPlanRepository.findById(order.planId);
    if (!plan) {
      await context.answerCallbackQuery({
        text: t("orderNotFound"),
        show_alert: true,
      });
      return;
    }

    const finalPrice = parseFloat(plan.price as string);
    const walletBalance = parseFloat(user.walletBalance ?? "0");

    // Build delivery map from existing order
    const delivery = (order.delivery ?? {}) as Record<string, string>;

    // Save renewal state
    renewalPendingState.set(userId, {
      originalOrderId: orderId,
      planId: plan.id,
      productId: product.id,
      finalPrice,
      delivery,
    });

    // Fetch payment settings
    const [settings, cards] = await Promise.all([
      PaymentRepository.getSettings(),
      PaymentRepository.getActiveCards(),
    ]);

    // Build summary text
    const deliveryLines = Object.entries(delivery)
      .map(([k, v]) => `• <b>${k}</b>: <code>${v}</code>`)
      .join("\n");

    const summaryText =
      `🔄 <b>${t("renewScreenTitle" as any)}</b>\n\n` +
      `📦 ${product.name}\n` +
      `📋 ${plan.name}\n` +
      (delivery && Object.keys(delivery).length > 0
        ? `\n${deliveryLines}\n`
        : "") +
      `\n💰 ${finalPrice.toLocaleString()} ${t("currency")}\n` +
      `👛 ${t("paymentWalletBalance")}: ${walletBalance.toLocaleString()} ${t("currency")}\n\n` +
      t("paymentPrompt");

    // Build payment keyboard (renew_ prefix)
    const kb = new InlineKeyboard();

    if (walletBalance >= finalPrice) {
      kb.text(t("btnPayWallet"), `renew_wallet_${orderId}`).row();
    }
    if (settings?.cardEnabled && (cards?.length ?? 0) > 0) {
      kb.text(t("btnPayCard"), `renew_card_${orderId}`).row();
    }
    if (settings?.zarinpalEnabled && settings.zarinpalMerchantId) {
      kb.text(t("btnPayZarinpal"), `renew_zarinpal_${orderId}`).row();
    }
    if (
      settings?.nowpaymentsEnabled &&
      settings.nowpaymentsApiKey &&
      settings.nowpaymentsIpnCallbackUrl &&
      (settings.cryptoExchangeRate ?? 0) > 0
    ) {
      kb.text(t("btnPayCrypto"), `renew_crypto_${orderId}`).row();
    }
    kb.text(t("btnBackToOrders"), `order_${orderId}`);

    await context.editText(summaryText, {
      parse_mode: "HTML",
      reply_markup: kb,
    });
  } catch (error) {
    console.error("[ORDERS] Error showing renew screen:", error);
    await context.answerCallbackQuery({
      text: t("errorRenewingOrder"),
      show_alert: true,
    });
  }
}
