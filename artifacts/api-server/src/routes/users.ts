import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { chatUsers } from "@workspace/db/schema";
import { CreateOrGetUserBody, SearchUsersQueryParams } from "@workspace/api-zod";
import { eq, ilike } from "drizzle-orm";

const router: IRouter = Router();

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4",
];

router.post("/users", async (req, res) => {
  const body = CreateOrGetUserBody.parse(req.body);
  const existing = await db.select().from(chatUsers).where(eq(chatUsers.username, body.username)).limit(1);
  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const [user] = await db.insert(chatUsers).values({
    username: body.username,
    displayName: body.displayName,
    avatarColor: color,
  }).returning();
  res.json(user);
});

router.get("/users/search", async (req, res) => {
  const { q } = SearchUsersQueryParams.parse(req.query);
  const users = await db.select().from(chatUsers).where(ilike(chatUsers.username, `%${q}%`)).limit(20);
  res.json(users);
});

export default router;
