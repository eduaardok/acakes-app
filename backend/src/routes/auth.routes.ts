import { Router } from "express";
import { login, getMe, updateMe } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.patch("/me", authenticateToken, updateMe);

export default router;