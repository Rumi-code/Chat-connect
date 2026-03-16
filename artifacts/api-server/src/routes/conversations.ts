import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { chatConversations, chatMembers, chatMessages, chatUsers } from "@workspace/db/schema";
import {
  ListConversationsQueryParams,
  CreateConversationBody,
  ListMessagesParams,
  ListMessagesQueryParams,
  SendChatMessageParams,
  SendChatMessageBody,
} from "@workspace/api-zod";
import { eq, desc, and, inArray } from "drizzle-orm";

const router: IRouter = Router();

router.get("/conversations", async (req, res) => {
  const { userId } = ListConversationsQueryParams.parse(req.query);

  const memberRows = await db.select({ conversationId: chatMembers.conversationId })
    .from(chatMembers)
    .where(eq(chatMembers.userId, userId));

  const convIds = memberRows.map(r => r.conversationId);
  if (convIds.length === 0) {
    res.json([]);
    return;
  }

  const conversations = await db.select().from(chatConversations)
    .where(inArray(chatConversations.id, convIds))
    .orderBy(desc(chatConversations.createdAt));

  const result = await Promise.all(conversations.map(async (conv) => {
    const members = await db
      .select({
        id: chatUsers.id,
        username: chatUsers.username,
        displayName: chatUsers.displayName,
        avatarColor: chatUsers.avatarColor,
        createdAt: chatUsers.createdAt,
      })
      .from(chatMembers)
      .innerJoin(chatUsers, eq(chatUsers.id, chatMembers.userId))
      .where(eq(chatMembers.conversationId, conv.id));

    const lastMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conv.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(1);

    let lastMessage = null;
    if (lastMessages.length > 0) {
      const msg = lastMessages[0];
      const [sender] = await db.select().from(chatUsers).where(eq(chatUsers.id, msg.senderId)).limit(1);
      lastMessage = { ...msg, sender };
    }

    return { ...conv, members, lastMessage };
  }));

  res.json(result);
});

router.post("/conversations", async (req, res) => {
  const body = CreateConversationBody.parse(req.body);
  
  if (body.type === "dm" && body.memberIds.length === 2) {
    const [a, b] = body.memberIds;
    const aMemberships = await db.select({ conversationId: chatMembers.conversationId })
      .from(chatMembers).where(eq(chatMembers.userId, a));
    const bMemberships = await db.select({ conversationId: chatMembers.conversationId })
      .from(chatMembers).where(eq(chatMembers.userId, b));
    const aIds = new Set(aMemberships.map(m => m.conversationId));
    const shared = bMemberships.filter(m => aIds.has(m.conversationId));

    for (const m of shared) {
      const conv = await db.select().from(chatConversations)
        .where(and(eq(chatConversations.id, m.conversationId), eq(chatConversations.type, "dm")))
        .limit(1);
      if (conv.length > 0) {
        const members = await db.select({
          id: chatUsers.id, username: chatUsers.username, displayName: chatUsers.displayName,
          avatarColor: chatUsers.avatarColor, createdAt: chatUsers.createdAt,
        }).from(chatMembers).innerJoin(chatUsers, eq(chatUsers.id, chatMembers.userId))
          .where(eq(chatMembers.conversationId, conv[0].id));
        res.status(201).json({ ...conv[0], members, lastMessage: null });
        return;
      }
    }
  }

  const [conv] = await db.insert(chatConversations).values({
    type: body.type,
    name: body.name ?? null,
  }).returning();

  await db.insert(chatMembers).values(
    body.memberIds.map(uid => ({ conversationId: conv.id, userId: uid }))
  );

  const members = await db.select({
    id: chatUsers.id, username: chatUsers.username, displayName: chatUsers.displayName,
    avatarColor: chatUsers.avatarColor, createdAt: chatUsers.createdAt,
  }).from(chatMembers).innerJoin(chatUsers, eq(chatUsers.id, chatMembers.userId))
    .where(eq(chatMembers.conversationId, conv.id));

  res.status(201).json({ ...conv, members, lastMessage: null });
});

router.get("/conversations/:conversationId/messages", async (req, res) => {
  const { conversationId } = ListMessagesParams.parse(req.params);
  const { before } = ListMessagesQueryParams.parse(req.query);

  const msgs = await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(50);

  const withSenders = await Promise.all(msgs.reverse().map(async (msg) => {
    const [sender] = await db.select({
      id: chatUsers.id, username: chatUsers.username, displayName: chatUsers.displayName,
      avatarColor: chatUsers.avatarColor, createdAt: chatUsers.createdAt,
    }).from(chatUsers).where(eq(chatUsers.id, msg.senderId)).limit(1);
    return { ...msg, sender };
  }));

  res.json(withSenders);
});

router.post("/conversations/:conversationId/messages", async (req, res) => {
  const { conversationId } = SendChatMessageParams.parse(req.params);
  const body = SendChatMessageBody.parse(req.body);

  const [msg] = await db.insert(chatMessages).values({
    conversationId,
    senderId: body.senderId,
    content: body.content,
    type: body.type,
    fileUrl: body.fileUrl ?? null,
    fileName: body.fileName ?? null,
    fileType: body.fileType ?? null,
  }).returning();

  const [sender] = await db.select({
    id: chatUsers.id, username: chatUsers.username, displayName: chatUsers.displayName,
    avatarColor: chatUsers.avatarColor, createdAt: chatUsers.createdAt,
  }).from(chatUsers).where(eq(chatUsers.id, msg.senderId)).limit(1);

  const fullMsg = { ...msg, sender };

  (req.app as any).broadcast?.({ type: "new-message", conversationId, message: fullMsg });

  res.status(201).json(fullMsg);
});

export default router;
