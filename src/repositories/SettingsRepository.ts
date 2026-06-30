import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	type BackupSettings,
	type BotSettings,
	backupSettingsTable,
	botSettingsTable,
	type InsertBackupSettings,
	type InsertBotSettings,
} from "../db/schema.ts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ Bot Settings (single-row id=1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class BotSettingsRepository {
	static async get(): Promise<BotSettings | undefined> {
		const [row] = await db
			.select()
			.from(botSettingsTable)
			.where(eq(botSettingsTable.id, 1))
			.limit(1);
		return row;
	}

	static async getOrCreate(): Promise<BotSettings> {
		const existing = await BotSettingsRepository.get();
		if (existing) return existing;

		const [created] = await db
			.insert(botSettingsTable)
			.values({ id: 1 })
			.onConflictDoNothing()
			.returning();

		return created ?? (await BotSettingsRepository.get())!;
	}

	static async update(patch: Partial<InsertBotSettings>): Promise<BotSettings> {
		await BotSettingsRepository.getOrCreate();
		const [row] = await db
			.update(botSettingsTable)
			.set({ ...patch, updatedAt: new Date() })
			.where(eq(botSettingsTable.id, 1))
			.returning();
		return row;
	}

	/** فعال/خاموش کردن ربات (حالت تعمیرات) و برگرداندن مقدار جدید */
	static async toggleMaintenance(): Promise<boolean> {
		const settings = await BotSettingsRepository.getOrCreate();
		const next = !settings.maintenanceMode;
		await BotSettingsRepository.update({ maintenanceMode: next });
		return next;
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 Backup Settings (single-row id=1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class BackupSettingsRepository {
	static async get(): Promise<BackupSettings | undefined> {
		const [row] = await db
			.select()
			.from(backupSettingsTable)
			.where(eq(backupSettingsTable.id, 1))
			.limit(1);
		return row;
	}

	static async getOrCreate(): Promise<BackupSettings> {
		const existing = await BackupSettingsRepository.get();
		if (existing) return existing;

		const [created] = await db
			.insert(backupSettingsTable)
			.values({ id: 1 })
			.onConflictDoNothing()
			.returning();

		return created ?? (await BackupSettingsRepository.get())!;
	}

	static async update(
		patch: Partial<InsertBackupSettings>,
	): Promise<BackupSettings> {
		await BackupSettingsRepository.getOrCreate();
		const [row] = await db
			.update(backupSettingsTable)
			.set({ ...patch, updatedAt: new Date() })
			.where(eq(backupSettingsTable.id, 1))
			.returning();
		return row;
	}
}
