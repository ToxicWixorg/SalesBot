import type { AnyBot, InlineKeyboard } from "gramio";
import { i18n } from "../../../shared/locales/index.ts";
import { UserRepository } from "../../../repositories/UserRepository.ts";
import { InventoryRepository } from "../../../repositories/InventoryRepository.ts";
import { pendingQuantityState } from "../quantityOrderState.ts";
import { inventoryOrderSummaryKeyboard } from "../../../shared/keyboards/products/inventoryOrder.ts";

/**
 * Registers the message handler that listens for a quantity number
 * while the user is in the quantity-selection phase.
 *
 * Called once from setupInventoryOrderScene().
 */
export function setupEnterQuantityHandler(bot: AnyBot) {
  bot.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    const state = pendingQuantityState.get(userId);
    if (!state) return next(); // not in quantity flow

    const text = ctx.text?.trim() ?? "";
    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode ?? "en");

    // ── Validate ─────────────────────────────────────────────────────────────
    const qty = Number(text);

    if (!Number.isInteger(qty) || qty <= 0) {
      await ctx.send(t("quantityInvalid"), { parse_mode: "HTML" });
      return;
    }

    // Re-check live available stock
    const liveStock = await InventoryRepository.countAvailable(state.productId);

    if (qty > liveStock) {
      await ctx.send(
        t("quantityExceedsStock", { stock: liveStock }),
        { parse_mode: "HTML" },
      );
      return;
    }

    if (state.maxPerUser > 0 && qty > state.maxPerUser) {
      await ctx.send(
        t("quantityExceedsLimit", { max: state.maxPerUser }),
        { parse_mode: "HTML" },
      );
      return;
    }

    // ── Show order summary ────────────────────────────────────────────────────
    const total = (state.pricePerUnit * qty).toFixed(2);

    const summary = t("inventoryOrderSummary", {
      productName: state.productName,
      qty,
      unitPrice: state.pricePerUnit.toFixed(2),
      total,
      currency: t("currency"),
    });

    await ctx.send(summary, {
      parse_mode: "HTML",
      reply_markup: inventoryOrderSummaryKeyboard(t, state.planId, qty),
    });
  });
}
