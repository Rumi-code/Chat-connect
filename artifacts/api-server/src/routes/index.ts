import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import contactsRouter from "./contacts";
import conversationsRouter from "./conversations";
import storageRouter from "./storage";
import openaiChatRouter from "./openai-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(contactsRouter);
router.use(conversationsRouter);
router.use(storageRouter);
router.use(openaiChatRouter);

export default router;
