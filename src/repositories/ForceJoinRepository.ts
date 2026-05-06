import { db } from "../db/index.ts";
import { forceJoinChannelsTable, type ForceJoinChannel } from "../db/schema.ts";
import { eq, asc } from "drizzle-orm";

export class ForceJoinRepository {
  /** همه کانال‌های فعال جوین اجباری (مرتب شده) */
  static async getActiveChannels(): Promise<ForceJoinChannel[]> {
    return db
      .select()
      .from(forceJoinChannelsTable)
      .where(eq(forceJoinChannelsTable.isActive, true))
      .orderBy(
        asc(forceJoinChannelsTable.order),
        asc(forceJoinChannelsTable.id),
      );
  }

  /** همه کانال‌ها (فعال و غیرفعال) */
  static async getAll(): Promise<ForceJoinChannel[]> {
    return db
      .select()
      .from(forceJoinChannelsTable)
      .orderBy(
        asc(forceJoinChannelsTable.order),
        asc(forceJoinChannelsTable.id),
      );
  }
}
