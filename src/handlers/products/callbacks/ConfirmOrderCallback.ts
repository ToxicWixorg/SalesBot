import { InlineKeyboard } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { emojiIds } from "../../../shared/locales/emojies.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import {
  ProductRepository,
  ProductPlanRepository,
} from "../../../repositories/ProductRepository.ts";
import { getBotInstance } from "../../../botInstance.ts";
import {
  pendingOrderInfoState,
  type RequiredInputField,
  type PendingOrderInfo,
} from "../pendingOrderInfoState.ts";
import { appliedDiscountState } from "../discountOrderState.ts";
import { preSelectedRegionState } from "../preSelectedRegionState.ts";
import {
  createManualOrderDirect,
  showPaymentScreen,
} from "../../../scenes/manualOrders/index.ts";

const LEGACY_STEPS: Record<string, RequiredInputField> = {
  email: {
    key: "email",
    label: "ایمیل",
    inputType: "email",
    required: true,
    sensitive: false,
  },
  password: {
    key: "password",
    label: "رمز",
    inputType: "password",
    required: true,
    sensitive: true,
  },
  loginUsername: {
    key: "loginUsername",
    label: "نام کاربری",
    inputType: "text",
    required: true,
    sensitive: false,
  },
  loginPassword: {
    key: "loginPassword",
    label: "رمز عبور",
    inputType: "password",
    required: true,
    sensitive: true,
  },
  region: {
    key: "region",
    label: "منطقه",
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
      const label = String(row.label ?? "").trim();
      if (!key || !label) return null;

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
        label,
        inputType,
        required: row.required === undefined ? true : Boolean(row.required),
        sensitive: Boolean(row.sensitive),
        placeholder:
          row.placeholder === undefined
            ? undefined
            : String(row.placeholder ?? "").trim(),
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

function buildPromptText(t: any, step: RequiredInputField): string {
  const legacyPromptKeyMap: Record<string, string> = {
    email: "manualOrderEmailPrompt",
    password: "manualOrderPasswordPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };

  const legacyPromptKey = legacyPromptKeyMap[step.key];
  if (legacyPromptKey) return t(legacyPromptKey as any);

  const placeholder = step.placeholder?.trim();
  return placeholder
    ? `📝 <b>${step.label}</b>\n<blockquote>${placeholder}</blockquote>`
    : `📝 <b>${step.label}</b> را وارد کنید:`;
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

  // ── No info steps → go straight to payment ────────────────────────────────
  // For custom_schedule: payment always comes FIRST (before info collection),
  // so we go to payment regardless of whether there are info steps.
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

  if (steps.length === 0) {
    await createManualOrderDirect(
      getBotInstance(),
      userId,
      planId,
      plan.deliveryType,
      (text, opts) => context.editText(text, opts),
      preCollected,
    );
    return;
  }

  // ── Store state and send first info-collection prompt ──────────────────────
  const state: PendingOrderInfo = {
    planId,
    deliveryType: plan.deliveryType,
    phase: "info",
    steps,
    currentStep: 0,
    collected: preCollected,
    discount: hasDiscount ? discount : undefined,
    regionPrice,
  };

  pendingOrderInfoState.set(userId, state);

  const firstStep = steps[0]!;
  const stepIndicator = t("manualOrderStep", {
    current: 1,
    total: steps.length,
  });
  const promptText = `${stepIndicator}\n\n${buildPromptText(t, firstStep)}`;

  await context.editText(promptText, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(
      t("btnCancelManualOrder"),
      "cancel_manual_order",
      { icon_custom_emoji_id: emojiIds.reject },
    ),
  });
}
