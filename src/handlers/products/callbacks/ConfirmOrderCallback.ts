import { InlineKeyboard } from "gramio";
import {
	ProductPlanRepository,
	ProductRepository,
} from "../../../repositories/ProductRepository.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { showPaymentScreen } from "../../../scenes/manualOrders/index.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";
import { i18n } from "../../../shared/locales/index.ts";
import { appliedDiscountState } from "../discountOrderState.ts";
import {
	type PendingOrderInfo,
	pendingOrderInfoState,
	type RequiredInputField,
} from "../pendingOrderInfoState.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";

const LEGACY_STEPS: Record<string, RequiredInputField> = {
	email: {
		key: "email",
		textFA: "لطفا ایمیل خود را وارد کنید.",
		textEN: "Please enter your email.",
		textRU: "Пожалуйста, введите ваш email.",
		inputType: "email",
		required: true,
		sensitive: false,
	},
	password: {
		key: "password",
		textFA: "لطفا رمز عبور را وارد کنید.",
		textEN: "Please enter your password.",
		textRU: "Пожалуйста, введите пароль.",
		inputType: "password",
		required: true,
		sensitive: true,
	},
	loginUsername: {
		key: "loginUsername",
		textFA: "لطفا نام کاربری را وارد کنید.",
		textEN: "Please enter your username.",
		textRU: "Пожалуйста, введите имя пользователя.",
		inputType: "text",
		required: true,
		sensitive: false,
	},
	loginPassword: {
		key: "loginPassword",
		textFA: "لطفا رمز عبور ورود را وارد کنید.",
		textEN: "Please enter your login password.",
		textRU: "Пожалуйста, введите пароль для входа.",
		inputType: "password",
		required: true,
		sensitive: true,
	},
	region: {
		key: "region",
		textFA: "لطفا منطقه را وارد کنید.",
		textEN: "Please enter the region.",
		textRU: "Пожалуйста, введите регион.",
		inputType: "text",
		required: true,
		sensitive: false,
	},
};

function normalizeRequiredInputs(value: unknown): RequiredInputField[] {
	if (!Array.isArray(value)) return [];

	const rows = value
		.map((item) => {
			if (!item || typeof item !== "object") return null;
			const row = item as Record<string, unknown>;
			const key = String(row.key ?? "")
				.trim()
				.toLowerCase()
				.replace(/\s+/g, "_");
			const textFA = typeof row.textFA === "string" ? row.textFA.trim() : "";
			const textEN = typeof row.textEN === "string" ? row.textEN.trim() : "";
			const textRU = typeof row.textRU === "string" ? row.textRU.trim() : "";
			if (!key || (!textFA && !textEN && !textRU)) return null;

			const inputTypeRaw = String(row.inputType ?? "text")
				.trim()
				.toLowerCase();
			const inputType = ["text", "email", "password", "number", "url"].includes(
				inputTypeRaw,
			)
				? (inputTypeRaw as RequiredInputField["inputType"])
				: "text";

			return {
				key,
				textFA,
				textEN,
				textRU,
				inputType,
				required: row.required === undefined ? true : Boolean(row.required),
				sensitive: Boolean(row.sensitive),
			} satisfies RequiredInputField;
		})
		.filter((x) => Boolean(x)) as RequiredInputField[];

	const seen = new Set<string>();
	return rows.filter((r) => {
		if (seen.has(r.key)) return false;
		seen.add(r.key);
		return true;
	});
}

/**
 * Handler for `confirm_order_{planId}` callback.
 *
 * Flow for custom_schedule products (زمان‌بندی):
 *   payment → info collection → review → day picker → slot picker → done
 *
 * Flow for all other delivery types:
 *   info collection → review → payment → done
 *   (or: payment directly if no info steps required)
 */
export async function ConfirmOrderCallback(context: any): Promise<void> {
	const planId = parseInt(context.queryData[1]);
	const userId = context.from?.id;
	if (!userId) return;

	const user = await UserRepository.findById(userId);
	if (!user) return;

	const t = i18n.buildT(user.languageCode ?? "fa");

	const plan = await ProductPlanRepository.findById(planId);
	if (!plan) {
		await context.answerCallbackQuery({
			text: t("planNotFound"),
			show_alert: true,
		});
		return;
	}

	const product = await ProductRepository.findById(plan.productId);
	if (!product) {
		await context.answerCallbackQuery({
			text: t("productNotFound"),
			show_alert: true,
		});
		return;
	}

	// ── Resolve pre-selected region ────────────────────────────────────────────
	const preRegion = preSelectedRegionState.get(userId);
	const regionForThisPlan =
		preRegion?.planId === planId ? preRegion : undefined;
	const regionPrice = regionForThisPlan?.price;

	// ── Resolve price (region override > plan base) ────────────────────────────
	// Both `regionPrice` (from preSelectedRegionState) and the plan base price
	// are stored in USD — keep everything in USD.
	const basePrice = regionPrice ?? parseFloat(plan.price as string);
	const discount = appliedDiscountState.get(userId);
	const hasDiscount = discount && discount.planId === planId;
	const finalPrice = hasDiscount ? discount.finalPrice : basePrice;

	// ── Pre-check wallet (show hint, not hard-block — card/crypto still possible) ─
	const walletBalance = parseFloat(user.walletBalance ?? "0");
	if (walletBalance < finalPrice) {
		// We don't block here — card / zarinpal / crypto paths are still available.
		// The payment screen itself will hide the wallet button if balance is low.
	}

	// ── Build required info steps ──────────────────────────────────────────────
	// Region via keyboard is already captured in preSelectedRegionState;
	// only add "region" text-input step when no region UI is available.
	const planHasRegions = (plan.regions?.length ?? 0) > 0;
	const productHasRegions = (product.regions?.length ?? 0) > 0;
	const regionCoveredByKeyboard = planHasRegions || productHasRegions;

	const steps: RequiredInputField[] = [];
	const dynamicRequiredInputs = normalizeRequiredInputs(
		(plan as any).requiredInputs,
	);

	const pushStep = (step: RequiredInputField) => {
		if (!steps.some((x) => x.key === step.key)) steps.push(step);
	};

	if (
		product.requiresRegion &&
		!regionCoveredByKeyboard &&
		!regionForThisPlan
	) {
		pushStep(LEGACY_STEPS.region);
	}

	if (dynamicRequiredInputs.length > 0) {
		for (const row of dynamicRequiredInputs) pushStep(row);
	} else {
		if (product.requiresEmail || plan.requiresEmail) {
			pushStep(LEGACY_STEPS.email);
			pushStep(LEGACY_STEPS.password);
		}
		if (product.requiresLogin || plan.requiresLogin) {
			pushStep(LEGACY_STEPS.loginUsername);
			pushStep(LEGACY_STEPS.loginPassword);
		}
	}

	// ── Pre-collected region (from keyboard selection) ──────────────────────────
	const preCollected: Record<string, string> = {};
	if (regionForThisPlan) {
		preCollected.region = `${regionForThisPlan.flag} ${regionForThisPlan.name}`;
	}

	// Cache each step's display text (based on user language) so later screens
	// and prompts can reuse it without recomputing.
	const lang = user.languageCode?.toLowerCase() || "fa";
	for (const s of steps) {
		s.displayText =
			lang === "en"
				? s.textEN || s.textFA || s.textRU || s.key
				: lang === "ru"
					? s.textRU || s.textFA || s.textEN || s.key
					: s.textFA || s.textEN || s.textRU || s.key;
	}

	// ── custom_schedule: payment comes FIRST (before info collection) ──────────
	if (plan.deliveryType === "custom_schedule") {
		const state: PendingOrderInfo = {
			planId,
			deliveryType: plan.deliveryType,
			phase: "payment",
			steps,
			currentStep: 0,
			collected: preCollected,
			discount: hasDiscount ? discount : undefined,
			regionPrice,
		};
		pendingOrderInfoState.set(userId, state);
		await showPaymentScreen(
			(text, opts) => context.editText(text, opts),
			userId,
			state,
		);
		return;
	}

	// ── Manual / other non-scheduled products: ask quantity BEFORE payment ─────
	// The user picks how many units they want; the price scales with quantity.
	// The scene's message handler reads the number, then continues to info
	// collection (or straight to payment when no info is required).
	const state: PendingOrderInfo = {
		planId,
		deliveryType: plan.deliveryType,
		phase: "quantity",
		steps,
		currentStep: 0,
		collected: preCollected,
		discount: hasDiscount ? discount : undefined,
		regionPrice,
	};
	pendingOrderInfoState.set(userId, state);

	await context.editText(t("enterOrderQuantityPrompt"), {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().text(
			t("btnCancelManualOrder"),
			"cancel_manual_order",
			{ icon_custom_emoji_id: emojiIds.reject },
		),
	});
}
