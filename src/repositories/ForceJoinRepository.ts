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

  /** پیدا کردن یک کانال با ID */
  static async findById(id: number): Promise<ForceJoinChannel | undefined> {
    const [row] = await db
      .select()
      .from(forceJoinChannelsTable)
      .where(eq(forceJoinChannelsTable.id, id))
      .limit(1);
    return row;
  }

  /** افزودن کانال جوین اجباری جدید */
  static async addChannel(data: {
    channelId: string;
    channelUrl: string;
    channelName: string;
  }): Promise<ForceJoinChannel> {
    const [row] = await db
      .insert(forceJoinChannelsTable)
      .values({
        channelId: data.channelId,
        channelUrl: data.channelUrl,
        channelName: data.channelName,
      })
      .returning();
    return row;
  }

  /** حذف یک کانال */
  static async deleteChannel(id: number): Promise<void> {
    await db
      .delete(forceJoinChannelsTable)
      .where(eq(forceJoinChannelsTable.id, id));
  }

  /** فعال/غیرفعال کردن یک کانال */
  static async setActive(
    id: number,
    isActive: boolean,
  ): Promise<ForceJoinChannel> {
    const [row] = await db
      .update(forceJoinChannelsTable)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(forceJoinChannelsTable.id, id))
      .returning();
    return row;
  }
}
