/**
 * BackupService — تهیه بکاپ از دیتابیس (pg_dump) و ارسال آن به کانال تلگرام.
 *
 *  - runBackup(bot): یک‌بار بکاپ می‌گیرد و فایل را به کانال تنظیم‌شده می‌فرستد.
 *  - startBackupScheduler(bot): هر ۶۰ ثانیه چک می‌کند؛ اگر بکاپ خودکار فعال باشد و
 *    ساعتِ تنظیم‌شده فرا رسیده باشد و امروز بکاپ گرفته نشده باشد، بکاپ می‌گیرد.
 *
 * فرمت زمان‌بندی در دیتابیس به‌صورت cron ذخیره می‌شود: "0 H * * *" (روزانه ساعت H).
 */

import type { AnyBot } from "gramio";
import { config } from "../config.ts";
import { BackupSettingsRepository } from "../repositories/SettingsRepository.ts";

export interface BackupResult {
	ok: boolean;
	error?: string;
	sizeBytes?: number;
	fileName?: string;
}

/** ساعت روز را از رشته cron ("m h * * *") استخراج می‌کند. */
export function parseBackupHour(cron: string | null | undefined): number {
	const parts = (cron ?? "").trim().split(/\s+/);
	const hour = Number.parseInt(parts[1] ?? "", 10);
	if (Number.isNaN(hour) || hour < 0 || hour > 23) return 3; // پیش‌فرض ۳ بامداد
	return hour;
}

/** ساعت را به رشته cron روزانه تبدیل می‌کند. */
export function buildDailyCron(hour: number): string {
	const h = Math.max(0, Math.min(23, Math.floor(hour)));
	return `0 ${h} * * *`;
}

function todayStr(now: Date): string {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** chat_id کانال را نرمال می‌کند: عددی → number، در غیر این صورت رشته (@username). */
function normalizeChannelId(channelId: string): string | number {
	const trimmed = channelId.trim();
	const asNumber = Number(trimmed);
	return !trimmed.startsWith("@") && Number.isFinite(asNumber) && trimmed !== ""
		? asNumber
		: trimmed;
}

/** حداکثر حجم فایلی که یک بات می‌تواند به تلگرام آپلود کند (۵۰ مگابایت). */
const TELEGRAM_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/** خروجی pg_dump را به‌صورت Buffer برمی‌گرداند. */
async function dumpDatabase(): Promise<Buffer> {
	if (!Bun.which("pg_dump")) {
		throw new Error(
			"دستور pg_dump یافت نشد. بسته‌ی postgresql-client را روی سرور نصب کنید.",
		);
	}

	const proc = Bun.spawn(
		["pg_dump", config.DATABASE_URL, "--no-owner", "--no-privileges"],
		{ stdout: "pipe", stderr: "pipe" },
	);

	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(proc.stdout).arrayBuffer(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);

	if (exitCode !== 0) {
		throw new Error(
			`pg_dump exited with code ${exitCode}: ${stderr.slice(0, 500)}`,
		);
	}

	return Buffer.from(stdout);
}

/** یک‌بار بکاپ می‌گیرد و به کانال می‌فرستد. */
export async function runBackup(bot: AnyBot): Promise<BackupResult> {
	const settings = await BackupSettingsRepository.getOrCreate();

	if (!settings.telegramChannelId) {
		return { ok: false, error: "کانال بکاپ تنظیم نشده است" };
	}

	const now = new Date();
	const stamp = `${todayStr(now)}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
	const fileName = `backup_${stamp}.sql`;

	try {
		const dump = await dumpDatabase();

		if (dump.byteLength === 0) {
			throw new Error("خروجی pg_dump خالی بود (بکاپ نامعتبر).");
		}
		if (dump.byteLength > TELEGRAM_MAX_UPLOAD_BYTES) {
			throw new Error(
				`حجم بکاپ ${(dump.byteLength / 1048576).toFixed(1)} مگابایت است و از حد ۵۰ مگابایتی تلگرام بیشتر است.`,
			);
		}

		const chatId = normalizeChannelId(settings.telegramChannelId);

		await (bot.api as any).sendDocument({
			chat_id: chatId,
			document: new File([dump], fileName, { type: "application/sql" }),
			caption:
				`💾 <b>بکاپ دیتابیس</b>\n\n` +
				`📅 ${now.toLocaleString("en-GB")}\n` +
				`📦 ${(dump.byteLength / 1024).toFixed(1)} KB`,
			parse_mode: "HTML",
		});

		await BackupSettingsRepository.update({
			lastBackupAt: now,
			lastBackupStatus: "success",
			lastBackupSize: dump.byteLength,
		});

		return { ok: true, sizeBytes: dump.byteLength, fileName };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("[BackupService] runBackup error:", message);

		await BackupSettingsRepository.update({
			lastBackupAt: now,
			lastBackupStatus: "failed",
		}).catch(() => {});

		return { ok: false, error: message };
	}
}

/** زمان‌بند بکاپ خودکار — هر ۶۰ ثانیه چک می‌کند. */
export function startBackupScheduler(bot: AnyBot) {
	setInterval(async () => {
		try {
			const settings = await BackupSettingsRepository.get();
			if (!settings || !settings.isEnabled || !settings.telegramChannelId) {
				return;
			}

			const now = new Date();
			const targetHour = parseBackupHour(settings.cronSchedule);
			// «در ساعت هدف یا بعد از آن» — تا اگر ربات دقیقاً سرِ ساعت خاموش بود،
			// همان روز پس از بالا آمدن، بکاپ عقب‌افتاده گرفته شود (یک‌بار در روز).
			if (now.getHours() < targetHour) return;

			// اگر امروز قبلاً بکاپ گرفته شده، دوباره نگیر
			if (
				settings.lastBackupAt &&
				todayStr(new Date(settings.lastBackupAt)) === todayStr(now)
			) {
				return;
			}

			console.log("[BackupService] Running scheduled backup...");
			const result = await runBackup(bot);
			console.log(
				`[BackupService] Scheduled backup ${result.ok ? "succeeded" : "failed"}` +
					(result.error ? `: ${result.error}` : ""),
			);
		} catch (err) {
			console.error("[BackupService] Scheduler error:", err);
		}
	}, 60_000);
}
