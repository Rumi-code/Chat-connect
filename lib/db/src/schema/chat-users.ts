import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4",
];

export const chatUsers = pgTable("chat_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarColor: text("avatar_color").notNull().default(AVATAR_COLORS[0]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatUserSchema = createInsertSchema(chatUsers).omit({ id: true, createdAt: true });
export type InsertChatUser = z.infer<typeof insertChatUserSchema>;
export type ChatUser = typeof chatUsers.$inferSelect;
