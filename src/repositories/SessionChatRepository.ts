import { db } from "../db/index.ts";
import { eq, asc, and } from "drizzle-orm";
import { sessionChatsTable, sessionChatMessagesTable } from "../db/schema.ts";
import type { SessionChat, SessionChatMessage } from "../db/schema.ts";

export const SessionChatRepository = {
  /** Create a new session chat at T=0 for a scheduled order */
  async create(data: {
    scheduleId: number;
    orderId: number;
    userId: number;
  }): Promise<SessionChat> {
    const [chat] = await db
      .insert(sessionChatsTable)
      .values({
        scheduleId: data.scheduleId,
        orderId: data.orderId,
        userId: data.userId,
        status: "open",
      })
      .returning();
    return chat;
  },

  async findById(id: number): Promise<SessionChat | null> {
    const [chat] = await db
      .select()
      .from(sessionChatsTable)
      .where(eq(sessionChatsTable.id, id));
    return chat ?? null;
  },

  async findByScheduleId(scheduleId: number): Promise<SessionChat | null> {
    const [chat] = await db
      .select()
      .from(sessionChatsTable)
      .where(eq(sessionChatsTable.scheduleId, scheduleId));
    return chat ?? null;
  },

  async findByOrderId(orderId: number): Promise<SessionChat | null> {
    const [chat] = await db
      .select()
      .from(sessionChatsTable)
      .where(eq(sessionChatsTable.orderId, orderId));
    return chat ?? null;
  },

  /** Find the open session chat for a user (if any) */
  async findOpenByUserId(userId: number): Promise<SessionChat | null> {
    const [chat] = await db
      .select()
      .from(sessionChatsTable)
      .where(
        and(
          eq(sessionChatsTable.userId, userId),
          eq(sessionChatsTable.status, "open"),
        ),
      )
      .limit(1);
    return chat ?? null;
  },

  async close(id: number): Promise<void> {
    await db
      .update(sessionChatsTable)
      .set({ status: "closed", closedAt: new Date() })
      .where(eq(sessionChatsTable.id, id));
  },

  /** Add a message from user or admin to a session chat */
  async addMessage(data: {
    sessionChatId: number;
    senderType: "user" | "admin";
    senderId: number;
    text: string;
  }): Promise<SessionChatMessage> {
    const [msg] = await db
      .insert(sessionChatMessagesTable)
      .values(data)
      .returning();
    return msg;
  },

  async getMessages(sessionChatId: number): Promise<SessionChatMessage[]> {
    return db
      .select()
      .from(sessionChatMessagesTable)
      .where(eq(sessionChatMessagesTable.sessionChatId, sessionChatId))
      .orderBy(asc(sessionChatMessagesTable.createdAt));
  },
};
