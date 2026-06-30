import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	type InsertPaymentSettings,
	type PaymentCardNumber,
	type PaymentSettings,
	paymentCardNumbersTable,
	paymentSettingsTable,
} from "../db/schema.ts";

export class PaymentRepository {
	/** دریافت تنظیمات درگاه‌های پرداخت (ردیف id=1) */
	static async getSettings(): Promise<PaymentSettings | undefined> {
		const [row] = await db
			.select()
			.from(paymentSettingsTable)
			.where(eq(paymentSettingsTable.id, 1))
			.limit(1);
		return row;
	}

	/** دریافت تنظیمات و در صورت نبود، ساخت ردیف پیش‌فرض (id=1) */
	static async getOrCreateSettings(): Promise<PaymentSettings> {
		const existing = await PaymentRepository.getSettings();
		if (existing) return existing;

		const [created] = await db
			.insert(paymentSettingsTable)
			.values({ id: 1 })
			.onConflictDoNothing()
			.returning();

		return created ?? (await PaymentRepository.getSettings())!;
	}

	/** به‌روزرسانی تنظیمات درگاه‌ها (ردیف id=1) */
	static async updateSettings(
		patch: Partial<InsertPaymentSettings>,
	): Promise<PaymentSettings> {
		await PaymentRepository.getOrCreateSettings();
		const [row] = await db
			.update(paymentSettingsTable)
			.set({ ...patch, updatedAt: new Date() })
			.where(eq(paymentSettingsTable.id, 1))
			.returning();
		return row;
	}

	/** دریافت همه شماره کارت‌های فعال (مرتب‌شده) */
	static async getActiveCards(): Promise<PaymentCardNumber[]> {
		return db
			.select()
			.from(paymentCardNumbersTable)
			.where(eq(paymentCardNumbersTable.isActive, true))
			.orderBy(paymentCardNumbersTable.order);
	}

	/** دریافت همه شماره کارت‌ها (شامل غیرفعال) */
	static async getAllCards(): Promise<PaymentCardNumber[]> {
		return db
			.select()
			.from(paymentCardNumbersTable)
			.orderBy(paymentCardNumbersTable.order);
	}

	/** پیدا کردن یک کارت با ID */
	static async findCardById(
		id: number,
	): Promise<PaymentCardNumber | undefined> {
		const [row] = await db
			.select()
			.from(paymentCardNumbersTable)
			.where(eq(paymentCardNumbersTable.id, id))
			.limit(1);
		return row;
	}

	/** افزودن شماره کارت جدید */
	static async addCard(data: {
		cardNumber: string;
		holderName: string;
		bankName?: string | null;
	}): Promise<PaymentCardNumber> {
		const [row] = await db
			.insert(paymentCardNumbersTable)
			.values({
				cardNumber: data.cardNumber,
				holderName: data.holderName,
				bankName: data.bankName ?? null,
			})
			.returning();
		return row;
	}

	/** حذف کامل یک شماره کارت */
	static async deleteCard(id: number): Promise<void> {
		await db
			.delete(paymentCardNumbersTable)
			.where(eq(paymentCardNumbersTable.id, id));
	}

	/** فعال/غیرفعال کردن یک شماره کارت */
	static async setCardActive(
		id: number,
		isActive: boolean,
	): Promise<PaymentCardNumber> {
		const [row] = await db
			.update(paymentCardNumbersTable)
			.set({ isActive, updatedAt: new Date() })
			.where(eq(paymentCardNumbersTable.id, id))
			.returning();
		return row;
	}
}
