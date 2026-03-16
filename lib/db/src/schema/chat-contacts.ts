import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chatUsers } from "./chat-users";

export const chatContacts = pgTable("chat_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => chatUsers.id),
  contactId: integer("contact_id").notNull().references(() => chatUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatContactSchema = createInsertSchema(chatContacts).omit({ id: true, createdAt: true });
export type InsertChatContact = z.infer<typeof insertChatContactSchema>;
export type ChatContact = typeof chatContacts.$inferSelect;
