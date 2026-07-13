import { type AnyBot, type Context, InlineKeyboard } from "gramio";
import { pendingOrderInfoState } from "../../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../../handlers/products/pendingPaymentState";
import {
	ProductPlanRepository,
	UserRepository,
} from "../../../../repositories";
import { PaymentRepository } from "../../../../repositories/PaymentRepository";
import { getUsdtRate } from "../../../../services/tetherland";
import { formatPriceLabel } from "../../../../shared/utils/currency";
import { i18n } from "../../../../shared/locales";
import { emojiIds } from "../../../../shared/locales/emojies";
import { resolveOrderPricing } from "../../Helpers/orderPricing";

export async function PayZarinpalCallback(ctx: Context, bot: AnyBot) {
	await ctx.answerCallbackQuery();
	const userId = ctx.from?.id;
	if (!userId) return;

	const state = pendingOrderInfoState.get(userId);
	if (!state || state.phase !== "payment") return;

	const user = await UserRepository.findById(userId);
	const t = i18n.buildT(user?.languageCode ?? "fa");

	const settings = await PaymentRepository.getSettings();
	if (!settings?.zarinpalEnabled || !settings.zarinpalMerchantId) {
		await ctx.answerCallbackQuery({
			text: t("rechargeMethodDisabled"),
			show_alert: true,
		});
		return;
	}

	const plan = await ProductPlanRepository.findById(state.planId);
	const finalPrice = resolveOrderPricing(
		userId,
		state,
		parseFloat((plan?.price as string) ?? "0"),
	).totalFinal;

	// Zarinpal charges in Iranian Rial, but the order amount is USD. Convert at
	// gateway time using the live USD→Toman rate. If the rate is unavailable,
	// abort rather than sending a wrong amount.
	const usdtRate = await getUsdtRate();
	if (usdtRate === null || !(usdtRate > 0)) {
		await ctx.editText(t("priceRateUnavailable"), {
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().text(
				t("btnCancelManualOrder"),
				"cancel_manual_order",
			),
		});
		return;
	}
	const amountRial = Math.round(finalPrice * usdtRate) * 10;

	const apiUrl = settings.zarinpalSandbox
		? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
		: "https://api.zarinpal.com/pg/v4/payment/request.json";

	try {
		const botInfo = await (bot.api as any).getMe();
		const resp = await fetch(apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				merchant_id: settings.zarinpalMerchantId,
				amount: amountRial, // USD → Rial at live rate
				description: `سفارش اشتراک - کاربر ${userId}`,
				callback_url: `https://t.me/${botInfo.username}`,
			}),
			signal: AbortSignal.timeout(10_000),
		});

		const data = (await resp.json()) as any;
		if (data?.data?.code !== 100)
			throw new Error(JSON.stringify(data?.errors ?? data));

		const authority: string = data.data.authority;
		const gateway = settings.zarinpalSandbox
			? "https://sandbox.zarinpal.com/pg/StartPay/"
			: "https://www.zarinpal.com/pg/StartPay/";
		const payUrl = gateway + authority;

		pendingPaymentState.set(userId, {
			planId: state.planId,
			finalPrice,
			zarinpalAuthority: authority,
			zarinpalPayUrl: payUrl,
			awaitingZarinpalProof: true,
		});

		// fa users see the amount in Toman (no dollar); the Rial charge above is
		// derived from the same USD price + rate.
		const priceLabel = formatPriceLabel(
			user?.languageCode,
			finalPrice,
			t,
			usdtRate,
		).label;
		await ctx.editText(
			`${t("rechargeZarinpalTitle")}\n\n💰 <b>${priceLabel}</b>\n\n${t("orderZarinpalProofInstructions")}`,
			{
				parse_mode: "HTML",
				reply_markup: new InlineKeyboard()
					.url(t("btnPayNow"), payUrl, {
						icon_custom_emoji_id: emojiIds.card,
						style: "success",
					})
					.row()
					.text(t("btnCancelManualOrder"), "cancel_manual_order"),
			},
		);
	} catch (err) {
		console.error("[manual-order] ZarinPal request error:", err);
		await ctx.editText(t("rechargeZarinpalFailed"), {
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().text(
				t("btnCancelManualOrder"),
				"cancel_manual_order",
			),
		});
	}
}
