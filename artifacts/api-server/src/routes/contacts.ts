import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { chatContacts, chatUsers } from "@workspace/db/schema";
import { GetContactsParams, AddContactParams, AddContactBody, RemoveContactParams } from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/users/:userId/contacts", async (req, res) => {
  const { userId } = GetContactsParams.parse(req.params);
  const rows = await db
    .select({
      id: chatContacts.id,
      userId: chatContacts.userId,
      contactId: chatContacts.contactId,
      createdAt: chatContacts.createdAt,
      contact: {
        id: chatUsers.id,
        username: chatUsers.username,
        displayName: chatUsers.displayName,
        avatarColor: chatUsers.avatarColor,
        createdAt: chatUsers.createdAt,
      },
    })
    .from(chatContacts)
    .innerJoin(chatUsers, eq(chatUsers.id, chatContacts.contactId))
    .where(eq(chatContacts.userId, userId));
  res.json(rows);
});

router.post("/users/:userId/contacts", async (req, res) => {
  const { userId } = AddContactParams.parse(req.params);
  const { contactId } = AddContactBody.parse(req.body);

  const existing = await db.select().from(chatContacts)
    .where(and(eq(chatContacts.userId, userId), eq(chatContacts.contactId, contactId)))
    .limit(1);

  if (existing.length > 0) {
    const contact = await db.select({
      id: chatContacts.id,
      userId: chatContacts.userId,
      contactId: chatContacts.contactId,
      createdAt: chatContacts.createdAt,
      contact: {
        id: chatUsers.id,
        username: chatUsers.username,
        displayName: chatUsers.displayName,
        avatarColor: chatUsers.avatarColor,
        createdAt: chatUsers.createdAt,
      },
    }).from(chatContacts)
      .innerJoin(chatUsers, eq(chatUsers.id, chatContacts.contactId))
      .where(eq(chatContacts.id, existing[0].id)).limit(1);
    res.status(201).json(contact[0]);
    return;
  }

  const [row] = await db.insert(chatContacts).values({ userId, contactId }).returning();
  const [contactWithUser] = await db.select({
    id: chatContacts.id,
    userId: chatContacts.userId,
    contactId: chatContacts.contactId,
    createdAt: chatContacts.createdAt,
    contact: {
      id: chatUsers.id,
      username: chatUsers.username,
      displayName: chatUsers.displayName,
      avatarColor: chatUsers.avatarColor,
      createdAt: chatUsers.createdAt,
    },
  }).from(chatContacts)
    .innerJoin(chatUsers, eq(chatUsers.id, chatContacts.contactId))
    .where(eq(chatContacts.id, row.id));
  res.status(201).json(contactWithUser);
});

router.delete("/users/:userId/contacts/:contactId", async (req, res) => {
  const { userId, contactId } = RemoveContactParams.parse(req.params);
  await db.delete(chatContacts).where(and(eq(chatContacts.userId, userId), eq(chatContacts.contactId, contactId)));
  res.status(204).send();
});

export default router;
