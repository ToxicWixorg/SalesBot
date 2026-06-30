import { eq, desc, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  ticketsTable,
  ticketMessagesTable,
  type Ticket,
  type InsertTicket,
  type TicketMessage,
  type InsertTicketMessage,
} from "../db/schema";

export class TicketRepository {
  /**
   * Generate unique ticket number based on type
   * T-1001 = Support Ticket
   * O-5001 = Order Ticket
   * R-8001 = Report Ticket
   */
  static async generateTicketNumber(type: string): Promise<string> {
    const prefixMap: Record<string, { prefix: string; startFrom: number }> = {
      support: { prefix: "T", startFrom: 1000 },
      order: { prefix: "O", startFrom: 5000 },
      report: { prefix: "R", startFrom: 8000 },
    };

    const config = prefixMap[type] || prefixMap.support;

    // Get the last ticket number for this type
    const lastTicket = await db
      .select({ ticketNumber: ticketsTable.ticketNumber })
      .from(ticketsTable)
      .where(eq(ticketsTable.type, type))
      .orderBy(desc(ticketsTable.id))
      .limit(1);

    if (lastTicket.length === 0) {
      return `${config.prefix}-${config.startFrom + 1}`;
    }

    // Extract number from last ticket (e.g., "T-1001" -> 1001)
    const lastNumber = parseInt(
      lastTicket[0].ticketNumber.split("-")[1] || "0",
    );
    return `${config.prefix}-${lastNumber + 1}`;
  }

  /**
   * Create a new ticket
   */
  static async createTicket(data: {
    userId: number;
    type: "support" | "order" | "report";
    title: string;
    description?: string;
    orderId?: number;
    priority?: string;
    forumGroupId?: number;
    topicId?: number;
    threadMessageId?: number;
  }): Promise<Ticket> {
    const ticketNumber = await this.generateTicketNumber(data.type);

    const [ticket] = await db
      .insert(ticketsTable)
      .values({
        userId: data.userId,
        orderId: data.orderId,
        type: data.type,
        ticketNumber,
        title: data.title,
        description: data.description,
        priority: data.priority || "normal",
        status: "open",
        forumGroupId: data.forumGroupId,
        topicId: data.topicId,
        threadMessageId: data.threadMessageId,
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return ticket;
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(ticketId: number): Promise<Ticket | null> {
    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, ticketId))
      .limit(1);

    return ticket || null;
  }

  /**
   * Get ticket by ticket number
   */
  static async getTicketByNumber(
    ticketNumber: string,
  ): Promise<Ticket | null> {
    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.ticketNumber, ticketNumber))
      .limit(1);

    return ticket || null;
  }

  /**
   * Get ticket by thread message ID (for forum integration)
   */
  static async getTicketByThreadMessageId(
    threadMessageId: number,
  ): Promise<Ticket | null> {
    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.threadMessageId, threadMessageId))
      .limit(1);

    return ticket || null;
  }

  /**
   * Get all tickets for a user
   */
  static async getUserTickets(userId: number): Promise<Ticket[]> {
    return db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.userId, userId))
      .orderBy(desc(ticketsTable.createdAt));
  }

  /**
   * Get open tickets for a user
   */
  static async getUserOpenTickets(userId: number): Promise<Ticket[]> {
    return db
      .select()
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.userId, userId),
          or(
            eq(ticketsTable.status, "open"),
            eq(ticketsTable.status, "waiting_user"),
            eq(ticketsTable.status, "waiting_support"),
            eq(ticketsTable.status, "in_progress"),
          ),
        ),
      )
      .orderBy(desc(ticketsTable.createdAt));
  }

  /**
   * Get tickets by order ID
   */
  static async getTicketsByOrderId(orderId: number): Promise<Ticket[]> {
    return db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.orderId, orderId))
      .orderBy(desc(ticketsTable.createdAt));
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(
    ticketId: number,
    status: string,
  ): Promise<Ticket> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "closed" || status === "resolved") {
      updateData.closedAt = new Date();
    }

    const [ticket] = await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, ticketId))
      .returning();

    return ticket;
  }

  /**
   * Update ticket priority
   */
  static async updateTicketPriority(
    ticketId: number,
    priority: string,
  ): Promise<Ticket> {
    const [ticket] = await db
      .update(ticketsTable)
      .set({
        priority,
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticketId))
      .returning();

    return ticket;
  }

  /**
   * Assign ticket to support agent
   */
  static async assignTicket(
    ticketId: number,
    agentId: number,
  ): Promise<Ticket> {
    const [ticket] = await db
      .update(ticketsTable)
      .set({
        assignedTo: agentId,
        assignedAt: new Date(),
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticketId))
      .returning();

    return ticket;
  }

  /**
   * Update ticket forum info (when thread is created)
   */
  static async updateTicketForumInfo(
    ticketId: number,
    data: {
      forumGroupId: number;
      topicId: number;
      threadMessageId: number;
    },
  ): Promise<Ticket> {
    const [ticket] = await db
      .update(ticketsTable)
      .set({
        forumGroupId: data.forumGroupId,
        topicId: data.topicId,
        threadMessageId: data.threadMessageId,
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticketId))
      .returning();

    return ticket;
  }

  /**
   * Add message to ticket
   */
  static async addMessage(data: {
    ticketId: number;
    userId: number;
    message: string;
    messageId?: number;
    attachments?: any;
    isFromUser?: boolean;
    isSystemMessage?: boolean;
  }): Promise<TicketMessage> {
    const [message] = await db
      .insert(ticketMessagesTable)
      .values({
        ticketId: data.ticketId,
        userId: data.userId,
        message: data.message,
        messageId: data.messageId,
        attachments: data.attachments,
        isFromUser: data.isFromUser !== undefined ? data.isFromUser : true,
        isSystemMessage: data.isSystemMessage || false,
        createdAt: new Date(),
      })
      .returning();

    // Update ticket stats
    await db
      .update(ticketsTable)
      .set({
        messageCount: sql`${ticketsTable.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, data.ticketId));

    // Update first response time if this is first support message
    if (!data.isFromUser && !data.isSystemMessage) {
      const [ticket] = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.id, data.ticketId))
        .limit(1);

      if (ticket && !ticket.firstResponseAt) {
        await db
          .update(ticketsTable)
          .set({
            firstResponseAt: new Date(),
          })
          .where(eq(ticketsTable.id, data.ticketId));
      }
    }

    return message;
  }

  /**
   * Get all messages for a ticket
   */
  static async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return db
      .select()
      .from(ticketMessagesTable)
      .where(eq(ticketMessagesTable.ticketId, ticketId))
      .orderBy(ticketMessagesTable.createdAt);
  }

  /**
   * Get ticket with messages
   */
  static async getTicketWithMessages(ticketId: number): Promise<{
    ticket: Ticket | null;
    messages: TicketMessage[];
  }> {
    const ticket = await this.getTicketById(ticketId);
    const messages = ticket ? await this.getTicketMessages(ticketId) : [];

    return { ticket, messages };
  }

  /**
   * Search tickets (for admin)
   */
  static async searchTickets(filters: {
    status?: string;
    type?: string;
    userId?: number;
    assignedTo?: number;
    limit?: number;
  }): Promise<Ticket[]> {
    let query = db.select().from(ticketsTable);

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(ticketsTable.status, filters.status));
    }
    if (filters.type) {
      conditions.push(eq(ticketsTable.type, filters.type));
    }
    if (filters.userId) {
      conditions.push(eq(ticketsTable.userId, filters.userId));
    }
    if (filters.assignedTo) {
      conditions.push(eq(ticketsTable.assignedTo, filters.assignedTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query
      .orderBy(desc(ticketsTable.createdAt))
      .limit(filters.limit || 50);
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStats() {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        open: sql<number>`count(*) filter (where status = 'open')`,
        inProgress: sql<number>`count(*) filter (where status = 'in_progress')`,
        resolved: sql<number>`count(*) filter (where status = 'resolved')`,
        closed: sql<number>`count(*) filter (where status = 'closed')`,
        avgResponseTime: sql<number>`avg(extract(epoch from (first_response_at - created_at)))`,
      })
      .from(ticketsTable);

    return stats;
  }
}
