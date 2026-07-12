/**
 * One-shot data migration: convert existing Toman amounts to USD.
 *
 * Product plan prices (product_plans.price, product_plans.regions[].price) are
 * ALREADY stored in USD and are NOT touched. Everything else that used to be
 * persisted in Toman (wallet balances, transactions, orders, rewards, discounts)
 * is divided by the given USD→Toman rate and rounded to 2 decimals.
 *
 * The card-to-card top-up table (wallet_topups, currency = IRR) and in-flight
 * gateway payment rows (zarinpal_wallet_payments / nowpayments_wallet_payments)
 * are intentionally left as-is.
 *
 * Usage:
 *   bun src/scripts/migrate-toman-to-usd.ts --rate=<tomanPerUsd> --dry-run
 *   bun src/scripts/migrate-toman-to-usd.ts --rate=<tomanPerUsd> --confirm
 *
 * Example (1 USD = 90,000 Toman):
 *   bun src/scripts/migrate-toman-to-usd.ts --rate=90000 --dry-run
 *   bun src/scripts/migrate-toman-to-usd.ts --rate=90000 --confirm
 *
 * ⚠️  Run ONCE. Running it twice divides the amounts again. Back up the DB first.
 */

import { sql } from "../db/index.ts";

/**
 * Minimal structural type for a postgres-js tagged-template executor.
 * Both the top-level `sql` client and a transaction handle satisfy it, so the
 * same steps can run in dry-run (on `sql`) or inside a transaction (on `tx`).
 */
type Executor = (
	template: TemplateStringsArray,
	...args: unknown[]
) => Promise<Array<Record<string, unknown>>>;

function getArg(name: string): string | undefined {
	const prefix = `--${name}=`;
	const hit = process.argv.find((a) => a.startsWith(prefix));
	return hit ? hit.slice(prefix.length) : undefined;
}

const hasFlag = (name: string) => process.argv.includes(`--${name}`);

type Step = {
	label: string;
	count: (q: Executor) => Promise<number>;
	apply: (q: Executor, rate: number) => Promise<number>;
};

const steps: Step[] = [
	{
		label: "users.wallet_balance",
		count: async (q) =>
			Number(
				(
					await q`SELECT count(*)::int AS count FROM users WHERE wallet_balance IS NOT NULL AND wallet_balance <> 0`
				)[0].count,
			),
		apply: async (q, rate) =>
			(
				await q`UPDATE users SET wallet_balance = ROUND(wallet_balance / ${rate}, 2), updated_at = now()
                WHERE wallet_balance IS NOT NULL AND wallet_balance <> 0 RETURNING id`
			).length,
	},
	{
		label: "wallet_transactions.amount / balance_before / balance_after",
		count: async (q) =>
			Number(
				(await q`SELECT count(*)::int AS count FROM wallet_transactions`)[0]
					.count,
			),
		apply: async (q, rate) =>
			(
				await q`UPDATE wallet_transactions SET
            amount = ROUND(amount / ${rate}, 2),
            balance_before = ROUND(balance_before / ${rate}, 2),
            balance_after = ROUND(balance_after / ${rate}, 2)
          RETURNING id`
			).length,
	},
	{
		label: "orders.total_price / discount_amount / wallet_used / final_price",
		count: async (q) =>
			Number((await q`SELECT count(*)::int AS count FROM orders`)[0].count),
		apply: async (q, rate) =>
			(
				await q`UPDATE orders SET
            total_price = ROUND(total_price / ${rate}, 2),
            discount_amount = ROUND(discount_amount / ${rate}, 2),
            wallet_used = ROUND(wallet_used / ${rate}, 2),
            final_price = ROUND(final_price / ${rate}, 2),
            updated_at = now()
          RETURNING id`
			).length,
	},
	{
		label: "referral_rewards.reward_value",
		count: async (q) =>
			Number(
				(await q`SELECT count(*)::int AS count FROM referral_rewards`)[0].count,
			),
		apply: async (q, rate) =>
			(
				await q`UPDATE referral_rewards SET reward_value = ROUND(reward_value / ${rate}, 2) RETURNING id`
			).length,
	},
	{
		label: "perks_tasks.reward_value",
		count: async (q) =>
			Number(
				(
					await q`SELECT count(*)::int AS count FROM perks_tasks WHERE reward_value IS NOT NULL`
				)[0].count,
			),
		apply: async (q, rate) =>
			(
				await q`UPDATE perks_tasks SET reward_value = ROUND(reward_value / ${rate}, 2) WHERE reward_value IS NOT NULL RETURNING id`
			).length,
	},
	{
		label: "discount_usage.discount_amount",
		count: async (q) =>
			Number(
				(await q`SELECT count(*)::int AS count FROM discount_usage`)[0].count,
			),
		apply: async (q, rate) =>
			(
				await q`UPDATE discount_usage SET discount_amount = ROUND(discount_amount / ${rate}, 2) RETURNING id`
			).length,
	},
	{
		// percentage discounts keep their % value; only fixed-amount value is money.
		label:
			"discount_codes.value (fixed only) / max_discount / min_order_amount",
		count: async (q) =>
			Number(
				(await q`SELECT count(*)::int AS count FROM discount_codes`)[0].count,
			),
		apply: async (q, rate) =>
			(
				await q`UPDATE discount_codes SET
            value = CASE WHEN type = 'fixed' THEN ROUND(value / ${rate}, 2) ELSE value END,
            max_discount = ROUND(max_discount / ${rate}, 2),
            min_order_amount = ROUND(min_order_amount / ${rate}, 2)
          RETURNING id`
			).length,
	},
];

async function main() {
	const rateRaw = getArg("rate") ?? process.env.USD_TOMAN_RATE;
	const rate = rateRaw ? Number.parseFloat(rateRaw) : NaN;

	if (!Number.isFinite(rate) || rate <= 0) {
		console.error(
			"❌ Missing/invalid rate. Pass --rate=<tomanPerUsd> (e.g. --rate=90000) or set USD_TOMAN_RATE.",
		);
		process.exit(1);
	}

	const dryRun = hasFlag("dry-run") || !hasFlag("confirm");

	console.log(
		`\n💱 Toman → USD migration | rate = 1 USD = ${rate.toLocaleString()} Toman`,
	);
	console.log(
		dryRun
			? "🧪 DRY RUN (no writes). Add --confirm to apply.\n"
			: "🚀 APPLYING CHANGES...\n",
	);

	try {
		if (dryRun) {
			for (const step of steps) {
				const count = await step.count(sql as unknown as Executor);
				console.log(`  • ${step.label} — ${count} row(s) would be affected`);
			}
			console.log("\n🧪 Dry run complete. Re-run with --confirm to apply.");
		} else {
			await sql.begin(async (tx) => {
				for (const step of steps) {
					const count = await step.apply(tx as unknown as Executor, rate);
					console.log(`  ✅ ${step.label} — ${count} row(s) updated`);
				}
			});
			console.log("\n✅ Migration applied successfully.");
		}
	} finally {
		await sql.end();
	}
}

main().catch((err) => {
	console.error("❌ Migration failed:", err);
	process.exit(1);
});
