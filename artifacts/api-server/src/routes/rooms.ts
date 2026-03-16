import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { roomsTable, insertRoomSchema } from "@workspace/db/schema";
import { CreateRoomBody } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/rooms", async (_req, res) => {
  const rooms = await db
    .select()
    .from(roomsTable)
    .orderBy(desc(roomsTable.createdAt));
  res.json(rooms);
});

router.post("/rooms", async (req, res) => {
  const body = CreateRoomBody.parse(req.body);
  const [room] = await db
    .insert(roomsTable)
    .values({
      name: body.name,
      description: body.description ?? null,
    })
    .returning();
  res.status(201).json(room);
});

export default router;
