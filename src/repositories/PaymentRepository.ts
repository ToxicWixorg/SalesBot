import { db } from "../db/index.ts";
import {
  paymentSettingsTable,
  paymentCardNumbersTable,
  type PaymentSettings,
  type PaymentCardNumber,
} from "../db/schema.ts";
import { eq } from "drizzle-orm";

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

  /** دریافت همه شماره کارت‌های فعال (مرتب‌شده) */
  static async getActiveCards(): Promise<PaymentCardNumber[]> {
    return db
      .select()
      .from(paymentCardNumbersTable)
      .where(eq(paymentCardNumbersTable.isActive, true))
      .orderBy(paymentCardNumbersTable.order);
  }
}
