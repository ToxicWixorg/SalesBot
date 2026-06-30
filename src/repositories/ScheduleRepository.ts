import { and, count, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
	type InsertTimeSlotTemplate,
	ordersTable,
	productsTable,
	schedulesTable,
	type TimeSlotTemplate,
	timeSlotTemplatesTable,
	usersTable,
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

	// ─── Admin: template management ──────────────────────────────────────────────

	/** All templates (active + inactive), sorted by start time. */
	async getAllTemplates(): Promise<TimeSlotTemplate[]> {
		return db
			.select()
			.from(timeSlotTemplatesTable)
			.orderBy(timeSlotTemplatesTable.startTime);
	},

	async findTemplateById(id: number): Promise<TimeSlotTemplate | undefined> {
		const [row] = await db
			.select()
			.from(timeSlotTemplatesTable)
			.where(eq(timeSlotTemplatesTable.id, id))
			.limit(1);
		return row;
	},

	async createTemplate(
		data: InsertTimeSlotTemplate,
	): Promise<TimeSlotTemplate> {
		const [row] = await db
			.insert(timeSlotTemplatesTable)
			.values(data)
			.returning();
		return row;
	},

	async setTemplateActive(
		id: number,
		isActive: boolean,
	): Promise<TimeSlotTemplate> {
		const [row] = await db
			.update(timeSlotTemplatesTable)
			.set({ isActive, updatedAt: new Date() })
			.where(eq(timeSlotTemplatesTable.id, id))
			.returning();
		return row;
	},

	async deleteTemplate(id: number): Promise<void> {
		await db
			.delete(timeSlotTemplatesTable)
			.where(eq(timeSlotTemplatesTable.id, id));
	},

	/** Get available slots for a specific date (considering day-of-week and bookings) */
	async getAvailableSlots(
		date: string, // YYYY-MM-DD
		productId?: number,
	): Promise<AvailableSlot[]> {
		// day 0=Sun … 6=Sat
		const dayOfWeek = new Date(date + "T12:00:00").getDay();

		const nowDate = new Date();
		const isToday = date === nowDate.toISOString().split("T")[0];
		const nowTime = isToday
			? `${String(nowDate.getHours()).padStart(2, "0")}:${String(nowDate.getMinutes()).padStart(2, "0")}`
			: null;

		const templates = await this.getActiveTemplates(productId);
		const todayTemplates = templates.filter((t) => {
			const days = (t.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]) as number[];
			if (!days.includes(dayOfWeek)) return false;
			if (nowTime && t.startTime <= nowTime) return false;
			return true;
		});

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

	/**
	 * Find sessions whose time slot starts at the given time and haven't been
	 * session-start-notified yet. Used by ReminderService to fire T=0 events.
	 */
	async findSessionsStartingNow(
		dateStr: string, // YYYY-MM-DD
		timeStr: string, // "HH:MM"
	) {
		const rows = await db
			.select({
				schedule: schedulesTable,
				user: {
					id: usersTable.id,
					username: usersTable.username,
					firstName: usersTable.firstName,
					languageCode: usersTable.languageCode,
				},
				order: {
					id: ordersTable.id,
					productId: ordersTable.productId,
				},
				product: {
					nameFA: productsTable.nameFA,
					nameEN: productsTable.nameEN,
					nameRU: productsTable.nameRU,
				},
			})
			.from(schedulesTable)
			.leftJoin(usersTable, eq(schedulesTable.userId, usersTable.id))
			.leftJoin(ordersTable, eq(schedulesTable.orderId, ordersTable.id))
			.leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
			.where(
				and(
					eq(schedulesTable.date, dateStr),
					eq(schedulesTable.sessionStartNotified, false),
				),
			);

		// Filter to sessions whose slot starts exactly at timeStr
		return rows.filter((r) => {
			const slotStart = r.schedule.timeSlot.split("-")[0]?.trim();
			return slotStart === timeStr;
		});
	},

	/** Mark a schedule as session-started and set status to in_progress */
	async markSessionStartNotified(id: number) {
		await db
			.update(schedulesTable)
			.set({
				sessionStartNotified: true,
				status: "in_progress",
				updatedAt: new Date(),
			})
			.where(eq(schedulesTable.id, id));
	},

	// ── New helper methods ───────────────────────────────────────────────────────

	/**
	 * Find a single schedule by ID with full user/order/product joins.
	 * Returns null if not found.
	 */
	async findById(id: number) {
		const rows = await db
			.select({
				schedule: schedulesTable,
				user: {
					id: usersTable.id,
					username: usersTable.username,
					firstName: usersTable.firstName,
					languageCode: usersTable.languageCode,
				},
				order: {
					id: ordersTable.id,
					productId: ordersTable.productId,
					status: ordersTable.status,
				},
				product: {
					nameFA: productsTable.nameFA,
					nameEN: productsTable.nameEN,
					nameRU: productsTable.nameRU,
				},
			})
			.from(schedulesTable)
			.leftJoin(usersTable, eq(schedulesTable.userId, usersTable.id))
			.leftJoin(ordersTable, eq(schedulesTable.orderId, ordersTable.id))
			.leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
			.where(eq(schedulesTable.id, id))
			.limit(1);

		return rows[0] ?? null;
	},

	/**
	 * Get all schedules currently in_progress (live sessions).
	 * Used by admin dashboard to show active sessions panel.
	 */
	async findInProgressSessions() {
		return db
			.select({
				schedule: schedulesTable,
				user: {
					id: usersTable.id,
					username: usersTable.username,
					firstName: usersTable.firstName,
					languageCode: usersTable.languageCode,
				},
				order: {
					id: ordersTable.id,
					productId: ordersTable.productId,
				},
				product: {
					nameFA: productsTable.nameFA,
					nameEN: productsTable.nameEN,
					nameRU: productsTable.nameRU,
				},
			})
			.from(schedulesTable)
			.leftJoin(usersTable, eq(schedulesTable.userId, usersTable.id))
			.leftJoin(ordersTable, eq(schedulesTable.orderId, ordersTable.id))
			.leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
			.where(eq(schedulesTable.status, "in_progress"));
	},

	/**
	 * Get sessions scheduled today that start within the next `minutesAhead`
	 * minutes (and haven't been started yet).
	 * Used by admin dashboard "upcoming" section.
	 */
	async findUpcomingToday(minutesAhead = 60) {
		const now = new Date();
		const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		const fromTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
		const future = new Date(now.getTime() + minutesAhead * 60_000);
		const toTime = `${String(future.getHours()).padStart(2, "0")}:${String(future.getMinutes()).padStart(2, "0")}`;

		const rows = await db
			.select({
				schedule: schedulesTable,
				user: {
					id: usersTable.id,
					username: usersTable.username,
					firstName: usersTable.firstName,
				},
				order: {
					id: ordersTable.id,
				},
				product: {
					nameFA: productsTable.nameFA,
					nameEN: productsTable.nameEN,
					nameRU: productsTable.nameRU,
				},
			})
			.from(schedulesTable)
			.leftJoin(usersTable, eq(schedulesTable.userId, usersTable.id))
			.leftJoin(ordersTable, eq(schedulesTable.orderId, ordersTable.id))
			.leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
			.where(
				and(
					eq(schedulesTable.date, date),
					eq(schedulesTable.sessionStartNotified, false),
				),
			);

		// Filter to the time window
		return rows.filter((r) => {
			const slotStart = r.schedule.timeSlot.split("-")[0]?.trim() ?? "";
			return slotStart >= fromTime && slotStart <= toTime;
		});
	},

	/**
	 * Cancel a schedule (status → cancelled).
	 * Does NOT touch the order — caller is responsible for that.
	 */
	async cancelSession(id: number) {
		const [row] = await db
			.update(schedulesTable)
			.set({
				status: "cancelled",
				updatedAt: new Date(),
			})
			.where(eq(schedulesTable.id, id))
			.returning();
		return row;
	},

	/**
	 * Returns the unique days-of-week (0=Sun … 6=Sat) that have at least one
	 * active template. Used to build the day-of-week picker shown to users after
	 * payment for custom_schedule products.
	 */
	async getAvailableDays(productId?: number): Promise<number[]> {
		const templates = await this.getActiveTemplates(productId);
		const days = new Set<number>();
		for (const tpl of templates) {
			const dow = (tpl.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]) as number[];
			for (const d of dow) days.add(d);
		}
		return Array.from(days).sort((a, b) => a - b);
	},

	/**
	 * Returns the next calendar date (YYYY-MM-DD) that falls on the given
	 * day-of-week (0=Sun … 6=Sat). If today is that day, returns today.
	 */
	getNextDateForDayOfWeek(dayOfWeek: number): string {
		const now = new Date();
		const daysAhead = (dayOfWeek - now.getDay() + 7) % 7;
		const target = new Date(now);
		target.setDate(now.getDate() + daysAhead);
		return target.toISOString().split("T")[0]!;
	},
};
