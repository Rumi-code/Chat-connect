import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";
import { SendMessageBody, GetMessagesParams, GetMessagesQueryParams } from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = GetMessagesParams.parse({ roomId: req.params.roomId });
  const { limit } = GetMessagesQueryParams.parse(req.query);

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.roomId, roomId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit ?? 100);

  res.json(messages.reverse());
});

router.post("/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = GetMessagesParams.parse({ roomId: req.params.roomId });
  const body = SendMessageBody.parse(req.body);

  const [message] = await db
    .insert(messagesTable)
    .values({
      roomId,
      username: body.username,
      content: body.content,
    })
    .returning();

  res.status(201).json(message);
});

export default router;
