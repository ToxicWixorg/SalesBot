import { eq, and, count } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  timeSlotTemplatesTable,
  schedulesTable,
  type TimeSlotTemplate,
} from "../db/schema.ts";

export interface AvailableSlot {
  template: TimeSlotTemplate;
  date: string;
  timeSlot: string; // "09:00-10:00"
  booked: number;
  capacity: number;
  isFull: boolean;
}

export const ScheduleRepository = {
  /** Get all active templates (optionally filtered by productId) */
  async getActiveTemplates(productId?: number): Promise<TimeSlotTemplate[]> {
    const templates = await db
      .select()
      .from(timeSlotTemplatesTable)
      .where(eq(timeSlotTemplatesTable.isActive, true));

    if (!productId) return templates;

    // Filter by productIds: null means all products, otherwise check list
    return templates.filter((t) => {
      if (!t.productIds) return true; // null = all
      const ids = t.productIds as number[];
      return ids.includes(productId);
    });
  },

  /** Get available slots for a specific date (considering day-of-week and bookings) */
  async getAvailableSlots(
    date: string, // YYYY-MM-DD
    productId?: number,
  ): Promise<AvailableSlot[]> {
    // day 0=Sun … 6=Sat
    const dayOfWeek = new Date(date + "T12:00:00").getDay();

    const templates = await this.getActiveTemplates(productId);
    const todayTemplates = templates.filter((t) => {
      const days = (t.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]) as number[];
      return days.includes(dayOfWeek);
    });

    // Count bookings per template for this date
    const bookingCounts = await db
      .select({
        templateId: schedulesTable.templateId,
        count: count(),
      })
      .from(schedulesTable)
      .where(eq(schedulesTable.date, date))
      .groupBy(schedulesTable.templateId);

    const countMap = new Map(
      bookingCounts
        .filter((r) => r.templateId != null)
        .map((r) => [r.templateId!, Number(r.count)]),
    );

    return todayTemplates.map((t) => {
      const booked = countMap.get(t.id) ?? 0;
      return {
        template: t,
        date,
        timeSlot: `${t.startTime}-${t.endTime}`,
        booked,
        capacity: t.capacity,
        isFull: booked >= t.capacity,
      };
    });
  },

  /** Create a booking (schedule row) for an order */
  async createBooking(
    templateId: number,
    date: string,
    timeSlot: string,
    orderId: number,
    userId: number,
  ) {
    const [row] = await db
      .insert(schedulesTable)
      .values({
        templateId,
        orderId,
        userId: userId as any,
        date,
        timeSlot,
        capacity: 1,
        currentBookings: 1,
        status: "available",
        reminderSent: false,
      })
      .returning();
    return row;
  },

  /** Find a booking by orderId */
  async findByOrderId(orderId: number) {
    return db.query.schedulesTable.findFirst({
      where: eq(schedulesTable.orderId, orderId),
    });
  },

  /** Get all schedules for a date (for reminder check) */
  async getSchedulesForDate(date: string) {
    return db
      .select()
      .from(schedulesTable)
      .where(
        and(
          eq(schedulesTable.date, date),
          eq(schedulesTable.reminderSent, false),
        ),
      );
  },

  /** Mark reminder as sent */
  async markReminderSent(id: number) {
    await db
      .update(schedulesTable)
      .set({ reminderSent: true, updatedAt: new Date() })
      .where(eq(schedulesTable.id, id));
  },

  /** Mark schedule as completed (admin action) */
  async markCompleted(id: number) {
    const [row] = await db
      .update(schedulesTable)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schedulesTable.id, id))
      .returning();
    return row;
  },
};
