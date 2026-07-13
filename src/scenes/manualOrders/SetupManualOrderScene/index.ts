import { type AnyBot, InlineKeyboard } from "gramio";
import { db } from "../../../db/index.ts";
import { walletTopupsTable } from "../../../db/schema.ts";
import {
	buildOrderInfoReviewText,
	orderInfoReviewKeyboard,
} from "../../../handlers/products/orderInfoReview";
import {
	type PendingOrderInfo,
	pendingOrderInfoState,
} from "../../../handlers/products/pendingOrderInfoState";
import { pendingPaymentState } from "../../../handlers/products/pendingPaymentState";
import {
	OrderRepository,
	ProductPlanRepository,
	ProductRepository,
	UserRepository,
} from "../../../repositories";
import { ScheduleRepository } from "../../../repositories/ScheduleRepository";
import { i18n } from "../../../shared/locales";
import { emojiIds } from "../../../shared/locales/emojies";
import { getLocalizedName } from "../../../shared/utils/localizedFields.ts";
import { finishManualOrder } from "../Helpers/finishManualOrder";
import { finishManualOrderWithSlot } from "../Helpers/finishManualOrderWithSlot";
import { notifyAdminNewOrder } from "../Helpers/notifyAdminNewOrder";
import { resolveOrderPricing } from "../Helpers/orderPricing";
import { showDayPicker } from "../Helpers/showDayPicker";
import { showSlotPicker } from "../Helpers/showSlotPicker";
import { sendStepPrompt } from "../SendStepPrompt";
import { showPaymentScreen } from "../ShowPaymentScreen";
import { CancelManualOrderCallback } from "./Callbacks/CancelManualOrder";
import { ConfirmCardCallback } from "./Callbacks/ConfirmCard";
import { ConfirmInfoCallback } from "./Callbacks/ConfirmInfo";
import { PayCardCallback } from "./Callbacks/PayCard";
import { PayCryptoCallback } from "./Callbacks/PayCrypto";
import { PayWalletCallback } from "./Callbacks/PayWallet";
import { PayZarinpalCallback } from "./Callbacks/PayZarinpal";
import { SlotCallback } from "./Callbacks/Slot";
import { SlotFullCallback } from "./Callbacks/SlotFull";

/** Upper bound on manual-order quantity when a product sets no per-user limit. */
const MAX_MANUAL_ORDER_QTY = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create an unpaid order (card / crypto / zarinpal flow)
// Returns the created order ID.
// ─────────────────────────────────────────────────────────────────────────────

async function createPendingPaymentOrder(
	userId: number,
	state: PendingOrderInfo,
	paymentMethod: "card" | "zarinpal" | "crypto",
	paymentId?: string,
): Promise<{
	orderId: number;
	finalPrice: number;
	productName: string;
	planName: string;
} | null> {
	const plan = await ProductPlanRepository.findById(state.planId);
	if (!plan) return null;
	const product = await ProductRepository.findById(plan.productId);
	if (!product) return null;
	const user = await UserRepository.findById(userId);
	const productName = getLocalizedName(product, user?.languageCode);
	const planName = getLocalizedName(plan, user?.languageCode);

	// Quantity-aware USD totals — same source of truth as the payment screen.
	const pricing = resolveOrderPricing(
		userId,
		state,
		parseFloat(plan.price as string),
	);
	const finalPrice = pricing.totalFinal;

	const delivery: Record<string, string> = Object.fromEntries(
		Object.entries(state.collected).filter(
			([, value]) => typeof value === "string" && value.trim() !== "",
		),
	);

	const order = await OrderRepository.create({
		userId: userId as any,
		productId: plan.productId,
		planId: plan.id,
		status: "pending_payment",
		quantity: pricing.quantity,
		totalPrice: pricing.totalOriginal.toFixed(2) as any,
		discountAmount: pricing.totalDiscount.toFixed(2) as any,
		walletUsed: "0.00" as any,
		finalPrice: finalPrice.toFixed(2) as any,
		paymentMethod,
		paymentId: paymentId ?? null,
		discountCodeId: pricing.discountCodeId,
		delivery,
	});

	return {
		orderId: order.id,
		finalPrice,
		productName,
		planName,
	};
}

async function createPendingOrderCardTopup(opts: {
	userId: number;
	orderId: number;
	amount: number;
	receiptFileId: string;
}) {
	await db.insert(walletTopupsTable).values({
		userId: opts.userId,
		amount: opts.amount.toString() as any,
		currency: "IRR",
		receiptPath: `telegram-file-id:${opts.receiptFileId}`,
		status: "pending",
		notes: `order_payment:${opts.orderId}`,
	});
}

export function setupManualOrderScene(bot: AnyBot) {
	/** User cancels info collection or slot selection mid-flow */
	bot.callbackQuery("cancel_manual_order", async (ctx) => {
		return await CancelManualOrderCallback(ctx);
	});

	/** Alert when a user taps a full slot */
	bot.callbackQuery("slot_full", async (ctx) => {
		return await SlotFullCallback(ctx);
	});

	/** User selected a time slot — slot_{templateId}_{date} */
	bot.callbackQuery(/^slot_(\d+)_(\d{4}-\d{2}-\d{2})$/, async (ctx) => {
		return await SlotCallback(
			ctx,
			showSlotPicker,
			finishManualOrderWithSlot,
			bot,
		);
	});

	/** Intercept every incoming text message to collect pending info */
	bot.on("message", async (ctx, next) => {
		const userId = ctx.from?.id;
		if (!userId) return next?.();

		const state = pendingOrderInfoState.get(userId);
		if (!state) return next?.();

		const paymentState = pendingPaymentState.get(userId);

		// ── Card payment receipt flow (fixed order amount) ───────────────────
		if (state.phase === "payment" && paymentState?.awaitingCardReceipt) {
			const user = await UserRepository.findById(userId);
			const t = i18n.buildT(user?.languageCode ?? "fa");
			const photo = (ctx as any).update?.message?.photo as
				| { file_id: string }[]
				| undefined;

			if (!photo || photo.length === 0) {
				await ctx.reply(t("rechargeCardExpectPhoto" as any), {
					parse_mode: "HTML",
				});
				return;
			}

			const receiptFileId = photo[photo.length - 1].file_id;

			const result = await createPendingPaymentOrder(userId, state, "card");
			if (!result) {
				await ctx.reply(t("errorFetchingOrderDetails"), {
					parse_mode: "HTML",
				});
				return;
			}

			try {
				await createPendingOrderCardTopup({
					userId,
					orderId: result.orderId,
					amount: result.finalPrice,
					receiptFileId,
				});
			} catch (err) {
				console.error("[MANUAL-ORDER] failed to create wallet topup:", err);
				await ctx.reply(t("errorFetchingOrderDetails"), {
					parse_mode: "HTML",
				});
				return;
			}

			pendingOrderInfoState.delete(userId);
			pendingPaymentState.delete(userId);

			await notifyAdminNewOrder(bot, {
				orderId: result.orderId,
				userId,
				username: user?.username ?? null,
				firstName: user?.firstName ?? null,
				productName: result.productName,
				planName: result.planName,
				finalPrice: result.finalPrice,
				quantity: state.quantity,
				collected: state.collected,
				steps: state.steps,
				deliveryType: "manual",
				paymentMethod: "card",
				paymentReceiptFileId: receiptFileId,
			});

			await ctx.reply(t("payCardPending", String(result.orderId)), {
				parse_mode: "HTML",
				reply_markup: new InlineKeyboard()
					.text(t("btnMyOrders"), "my_orders", {
						icon_custom_emoji_id: emojiIds.bag,
					})
					.row()
					.text(t("btnBackToMenu"), "categories", {
						icon_custom_emoji_id: emojiIds.home,
					}),
			});

			return;
		}

		// ── Crypto / ZarinPal proof flow (tx hash text OR receipt photo) ─────
		if (
			state.phase === "payment" &&
			(paymentState?.awaitingCryptoProof || paymentState?.awaitingZarinpalProof)
		) {
			const user = await UserRepository.findById(userId);
			const t = i18n.buildT(user?.languageCode ?? "fa");
			const method = paymentState.awaitingCryptoProof ? "crypto" : "zarinpal";

			const photo = (ctx as any).update?.message?.photo as
				| { file_id: string }[]
				| undefined;
			const receiptFileId =
				photo && photo.length > 0 ? photo[photo.length - 1].file_id : undefined;
			const caption = (ctx as any).update?.message?.caption as
				| string
				| undefined;
			const hashText = (ctx.text ?? caption)?.trim() || undefined;

			// Accept either a transaction hash / tracking code (text) or a receipt
			// photo. Anything else (sticker, etc.) is rejected with a hint.
			if (!receiptFileId && !hashText) {
				await ctx.reply(t("orderProofExpect"), { parse_mode: "HTML" });
				return;
			}

			const result = await createPendingPaymentOrder(
				userId,
				state,
				method,
				hashText,
			);
			if (!result) {
				await ctx.reply(t("errorFetchingOrderDetails"), { parse_mode: "HTML" });
				return;
			}

			pendingOrderInfoState.delete(userId);
			pendingPaymentState.delete(userId);

			await notifyAdminNewOrder(bot, {
				orderId: result.orderId,
				userId,
				username: user?.username ?? null,
				firstName: user?.firstName ?? null,
				productName: result.productName,
				planName: result.planName,
				finalPrice: result.finalPrice,
				quantity: state.quantity,
				collected: state.collected,
				steps: state.steps,
				deliveryType: "manual",
				paymentMethod: method,
				paymentReceiptFileId: receiptFileId,
				paymentHash: hashText,
			});

			await ctx.reply(t("payCardPending", String(result.orderId)), {
				parse_mode: "HTML",
				reply_markup: new InlineKeyboard()
					.text(t("btnMyOrders"), "my_orders", {
						icon_custom_emoji_id: emojiIds.bag,
					})
					.row()
					.text(t("btnBackToMenu"), "categories", {
						icon_custom_emoji_id: emojiIds.home,
					}),
			});

			return;
		}

		if (!ctx.text) return next?.();

		// ── Quantity entry for manual products (before info / payment) ───────
		if (state.phase === "quantity") {
			const user = await UserRepository.findById(userId);
			const t = i18n.buildT(user?.languageCode ?? "fa");

			// Normalise Persian/Arabic digits, then parse a positive integer.
			const normalized = ctx.text
				.trim()
				.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
				.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
			const qty = Number.parseInt(normalized, 10);

			if (Number.isNaN(qty) || qty < 1) {
				await ctx.reply(t("quantityInvalid"), { parse_mode: "HTML" });
				return;
			}

			const plan = await ProductPlanRepository.findById(state.planId);
			const product = plan
				? await ProductRepository.findById(plan.productId)
				: null;

			// Cap by per-user limit if the product sets one, else a sane default.
			const maxAllowed =
				product?.maxPerUser && product.maxPerUser > 0
					? product.maxPerUser
					: MAX_MANUAL_ORDER_QTY;
			if (qty > maxAllowed) {
				await ctx.reply(t("quantityExceedsLimit", { max: maxAllowed }), {
					parse_mode: "HTML",
				});
				return;
			}

			state.quantity = qty;

			if (state.steps.length > 0) {
				// Collect required info next.
				state.phase = "info";
				state.currentStep = 0;
				await sendStepPrompt(ctx, t, state, false);
			} else {
				// No info to collect — go straight to the payment screen.
				await showPaymentScreen(
					(text, opts) => ctx.send(text, opts),
					userId,
					state,
				);
			}
			return;
		}

		// Ignore text during non-input phases
		if (
			state.phase === "slot" ||
			state.phase === "review" ||
			state.phase === "day" ||
			state.phase === "payment"
		)
			return next?.();

		const answer = ctx.text.trim();
		if (!answer) return next?.();

		// ── Re-edit mode: user is fixing a single field from review ──────────
		if (state.editingStep) {
			state.collected[state.editingStep] = answer;
			state.editingStep = undefined;
			state.phase = "review";

			const user = await UserRepository.findById(userId);
			const t = i18n.buildT(user?.languageCode ?? "en");

			await ctx.send(buildOrderInfoReviewText(t, state), {
				parse_mode: "HTML",
				reply_markup: orderInfoReviewKeyboard(t, state.planId, state.steps),
			});
			return;
		}

		// ── Normal info-collection flow ───────────────────────────────────────
		const step = state.steps[state.currentStep];
		if (!step) return next?.();
		state.collected[step.key] = answer;
		state.currentStep++;

		if (state.currentStep >= state.steps.length) {
			const user = await UserRepository.findById(userId);
			const t = i18n.buildT(user?.languageCode ?? "en");
			const plan = await ProductPlanRepository.findById(state.planId);

			const needsSlot = state.deliveryType === "custom_schedule" && plan;

			if (needsSlot) {
				// For custom_schedule: after info collection, show day picker
				const shown = await showDayPicker(
					(text, opts) => ctx.send(text, opts),
					t,
					state,
					plan,
				);
				if (!shown) {
					pendingOrderInfoState.delete(userId);
				}
			} else {
				// All info done — show review screen
				state.phase = "review";
				await ctx.send(buildOrderInfoReviewText(t, state), {
					parse_mode: "HTML",
					reply_markup: orderInfoReviewKeyboard(t, state.planId, state.steps),
				});
			}
		} else {
			// Ask next step
			const user = await UserRepository.findById(userId);
			const t = i18n.buildT(user?.languageCode ?? "en");
			await sendStepPrompt(ctx, t, state, false);
		}
	});

	/** User confirms collected info — show payment screen */
	bot.callbackQuery(/^confirm_info_(\d+)$/, async (ctx) => {
		return await ConfirmInfoCallback(ctx);
	});

	/** User pays from wallet — create the order */
	bot.callbackQuery(/^pay_wallet_(\d+)$/, async (ctx) => {
		return await PayWalletCallback(ctx, finishManualOrder);
	});

	/** User chooses card payment */
	bot.callbackQuery(/^pay_card_(\d+)$/, async (ctx) => {
		return await PayCardCallback(ctx);
	});

	/** User confirms they transferred via card */
	bot.callbackQuery(/^confirm_card_(\d+)$/, async (ctx) => {
		return await ConfirmCardCallback(
			ctx,
			createPendingPaymentOrder,
			notifyAdminNewOrder,
			bot,
		);
	});

	/** User chooses ZarinPal payment */
	bot.callbackQuery(/^pay_zarinpal_(\d+)$/, async (ctx) => {
		return await PayZarinpalCallback(ctx, bot);
	});

	/** User chooses crypto/USDT payment */
	bot.callbackQuery(/^pay_crypto_(\d+)$/, async (ctx) => {
		return await PayCryptoCallback(ctx);
	});

	/** User wants to re-edit a specific field */
	bot.callbackQuery(/^edit_info_(\d+)_(\w+)$/, async (ctx) => {
		await ctx.answerCallbackQuery();

		const userId = ctx.from?.id;
		if (!userId) return;

		const state = pendingOrderInfoState.get(userId);
		if (!state) return;

		const user = await UserRepository.findById(userId);
		const t = i18n.buildT(user?.languageCode ?? "fa");

		const stepRaw = Array.isArray(ctx.queryData) ? ctx.queryData[2] : undefined;

		if (!stepRaw) {
			await ctx.answerCallbackQuery({
				text: t("errorFetchingOrderDetails"),
				show_alert: true,
			});
			return;
		}

		const hasStep = state.steps.some((s) => s.key === stepRaw);
		if (!hasStep) {
			await ctx.answerCallbackQuery({
				text: t("errorFetchingOrderDetails"),
				show_alert: true,
			});
			return;
		}

		state.editingStep = stepRaw;
		state.phase = "info";

		const stepIndex = state.steps.findIndex((s) => s.key === stepRaw);
		if (stepIndex >= 0) {
			state.currentStep = stepIndex;
		}

		await sendStepPrompt(ctx, t, state, true);
	});

	/** User selected a day of week — slot_day_{0-6} */
	bot.callbackQuery(/^slot_day_([0-6])$/, async (ctx) => {
		await ctx.answerCallbackQuery();
		const userId = ctx.from?.id;
		if (!userId) return;

		const state = pendingOrderInfoState.get(userId);
		if (!state || state.phase !== "day") return;

		// When registered with a regex, ctx.queryData is the array of match groups
		const dayStr = Array.isArray(ctx.queryData)
			? ctx.queryData[1]
			: ctx.queryData;
		const dayOfWeek = parseInt(dayStr as string);
		if (isNaN(dayOfWeek)) return;

		const user = await UserRepository.findById(userId);
		const t = i18n.buildT(user?.languageCode ?? "fa");

		const plan = await ProductPlanRepository.findById(state.planId);
		if (!plan) return;

		// Compute the next calendar date for this day of week
		const date = ScheduleRepository.getNextDateForDayOfWeek(dayOfWeek);
		state.pendingDayOfWeek = dayOfWeek;
		state.phase = "slot";

		const shown = await showSlotPicker(
			(text, opts) => ctx.editText(text, opts),
			t,
			state,
			plan,
			date,
		);
		if (!shown) {
			// No slots on this day — go back to day picker
			state.phase = "day";
			await showDayPicker(
				(text, opts) => ctx.editText(text, opts),
				t,
				state,
				plan,
			);
		}
	});
}
