import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chatConversations } from "./chat-conversations";
import { chatUsers } from "./chat-users";

export const chatMembers = pgTable("chat_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  userId: integer("user_id").notNull().references(() => chatUsers.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertChatMemberSchema = createInsertSchema(chatMembers).omit({ id: true, joinedAt: true });
export type InsertChatMember = z.infer<typeof insertChatMemberSchema>;
export type ChatMember = typeof chatMembers.$inferSelect;
