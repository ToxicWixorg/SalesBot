import { db } from "../db/index.ts";
import {
  walletTransactionsTable,
  WalletTransaction,
  InsertWalletTransaction,
  ticketsTable,
  Ticket,
  InsertTicket,
  ticketMessagesTable,
  TicketMessage,
  InsertTicketMessage,
  usersTable,
} from "../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";

export class WalletRepository {
  /**
   * تراکنش جدید ایجاد کن با ذخیره balance قبل و بعد
   */
  static async createTransaction(
    transaction: InsertWalletTransaction,
  ): Promise<WalletTransaction> {
    // دریافت موجودی قبل از تراکنش
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, transaction.userId))
      .limit(1);

    const balanceBefore = parseFloat(user?.walletBalance || "0");
    const amount = parseFloat(transaction.amount as string);

    // محاسبه موجودی بعد
    let balanceAfter = balanceBefore;
    if (transaction.type === "credit") {
      balanceAfter = balanceBefore + amount;
    } else if (transaction.type === "debit") {
      balanceAfter = balanceBefore - amount;
    }

    const [result] = await db
      .insert(walletTransactionsTable)
      .values({
        ...transaction,
        balanceBefore: balanceBefore.toFixed(2) as any,
        balanceAfter: balanceAfter.toFixed(2) as any,
      })
      .returning();

    return result;
  }

  /**
   * تمام تراکنش‌های کاربر
   */
  static async findByUserId(userId: number): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.userId, BigInt(userId) as any))
      .orderBy(desc(walletTransactionsTable.createdAt));
  }

  /**
   * دریافت آخرین تراکنش‌های کاربر (محدود)
   */
  static async getRecentTransactions(
    userId: number,
    limit: number = 10,
  ): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.userId, BigInt(userId) as any))
      .orderBy(desc(walletTransactionsTable.createdAt))
      .limit(limit);
  }

  /**
   * دریافت تراکنش بر اساس ID
   */
  static async findById(id: number): Promise<WalletTransaction | undefined> {
    const [result] = await db
      .select()
      .from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * دریافت تراکنش‌های مربوط به یک سفارش
   */
  static async findByOrderId(orderId: number): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.orderId, orderId))
      .orderBy(desc(walletTransactionsTable.createdAt));
  }

  /**
   * موجودی را بوسیله ایجاد تراکنش شارژ کن
   */
  static async addCredit(
    userId: number,
    amount: string,
    source: string,
    description?: string,
  ): Promise<WalletTransaction> {
    return this.createTransaction({
      userId: BigInt(userId) as any,
      amount: amount as any,
      type: "credit",
      source,
      description,
    });
  }

  /**
   * موجودی را کاهش بده (Debit)
   */
  static async debitBalance(
    userId: number,
    amount: string,
    source: string,
    orderId?: number,
    description?: string,
  ): Promise<WalletTransaction> {
    return this.createTransaction({
      userId: BigInt(userId) as any,
      orderId,
      amount: amount as any,
      type: "debit",
      source,
      description,
    });
  }

  /**
   * محاسبه مجموع تراکنش‌های credit
   */
  static async getTotalCredit(userId: number): Promise<number> {
    const transactions = await this.findByUserId(userId);
    const totalCredit = transactions
      .filter((tx) => tx.type === "credit")
      .reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

    return totalCredit;
  }

  /**
   * محاسبه مجموع تراکنش‌های debit
   */
  static async getTotalDebit(userId: number): Promise<number> {
    const transactions = await this.findByUserId(userId);
    const totalDebit = transactions
      .filter((tx) => tx.type === "debit")
      .reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

    return totalDebit;
  }
}
}

export class TicketRepository {
  /**
   * تیکت را با ID پیدا کن
   */
  static async findById(id: number): Promise<Ticket | undefined> {
    const [result] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, id))
      .limit(1);

    return result;
  }

  /**
   * تمام تیکت‌های یک کاربر
   */
  static async findByUserId(userId: number): Promise<Ticket[]> {
    return db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.userId, BigInt(userId) as any))
      .orderBy(desc(ticketsTable.createdAt));
  }

  /**
   * تیکت‌های باز
   */
  static async findOpen(): Promise<Ticket[]> {
    return db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.status, "open"))
      .orderBy(desc(ticketsTable.createdAt));
  }

  /**
   * تیکت جدید ایجاد کن
   */
  static async create(ticket: InsertTicket): Promise<Ticket> {
    const [result] = await db.insert(ticketsTable).values(ticket).returning();

    return result;
  }

  /**
   * وضعیت تیکت را تغییر بده
   */
  static async updateStatus(id: number, status: string): Promise<Ticket> {
    const [result] = await db
      .update(ticketsTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, id))
      .returning();

    return result;
  }

  /**
   * تیکت را بسته
   */
  static async close(id: number): Promise<Ticket> {
    return this.updateStatus(id, "closed");
  }

  /**
   * تیکت را به پشتیبانی تخصیص بده
   */
  static async assignTo(id: number, supportId: number): Promise<Ticket> {
    const [result] = await db
      .update(ticketsTable)
      .set({
        assignedTo: BigInt(supportId) as any,
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, id))
      .returning();

    return result;
  }
}

export class TicketMessageRepository {
  /**
   * پیام‌های تیکت
   */
  static async findByTicketId(ticketId: number): Promise<TicketMessage[]> {
    return db
      .select()
      .from(ticketMessagesTable)
      .where(eq(ticketMessagesTable.ticketId, ticketId))
      .orderBy(ticketMessagesTable.createdAt);
  }

  /**
   * پیام جدید ایجاد کن
   */
  static async create(message: InsertTicketMessage): Promise<TicketMessage> {
    const [result] = await db
      .insert(ticketMessagesTable)
      .values(message)
      .returning();

    return result;
  }
}
