import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: bigint("id", { mode: "number" }).primaryKey(),

	name: text("name"),
	username: text("username"),
	startParameter: text("start_parameter"),

	languageCode: text("language_code"),

	createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
