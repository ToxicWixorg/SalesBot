import { InlineKeyboard } from "gramio";
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
import { resolveOrderPricing } from "../../Helpers/orderPricing";

export async function PayCryptoCallback(ctx: any) {
	await ctx.answerCallbackQuery();
	const userId = ctx.from?.id;
	if (!userId) return;

	const state = pendingOrderInfoState.get(userId);
	if (!state || state.phase !== "payment") return;

	const user = await UserRepository.findById(userId);
	const t = i18n.buildT(user?.languageCode ?? "fa");

	const settings = await PaymentRepository.getSettings();
	// Manual crypto flow: a static wallet address configured in the admin panel is
	// shown to the user, who then submits a tx hash / receipt for admin review.
	const cryptoReady =
		!!settings?.nowpaymentsEnabled && !!settings.cryptoAddress?.trim();

	if (!cryptoReady) {
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

	const address = settings.cryptoAddress!.trim();
	const network = settings.cryptoNetwork ?? "TRC20";

	pendingPaymentState.set(userId, {
		planId: state.planId,
		finalPrice,
		awaitingCryptoProof: true,
	});

	// fa users see the price in Toman (no dollar). The USDT amount to actually
	// send stays in USDT below — crypto is a dollar-denominated transfer.
	const usdtRate = user?.languageCode === "fa" ? await getUsdtRate() : null;
	const priceLabel = formatPriceLabel(
		user?.languageCode,
		finalPrice,
		t,
		usdtRate,
	).label;

	await ctx.editText(
		`${t("rechargeCryptoTitle")}\n\n` +
			`💰 <b>${priceLabel}</b>\n\n` +
			`${t("rechargeCryptoAddress", address)}\n\n` +
			`${t("rechargeCryptoAmount", finalPrice.toFixed(2))}\n` +
			`${t("rechargeCryptoNetwork", network)}\n\n` +
			`${t("orderCryptoProofInstructions")}`,
		{
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().text(
				t("btnCancelManualOrder"),
				"cancel_manual_order",
			),
		},
	);
}
