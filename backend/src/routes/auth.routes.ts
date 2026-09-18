import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, getMe, updateMe } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Máximo 5 intentos por IP cada 15 minutos — mitiga fuerza bruta sobre
// credenciales de admin. Depende de app.set('trust proxy', 1) en index.ts
// para contar por IP real del cliente detrás del proxy de Render.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Demasiados intentos, intenta de nuevo en unos minutos" },
});

router.post("/login", loginLimiter, login);
router.get("/me", authenticateToken, getMe);
router.patch("/me", authenticateToken, updateMe);

export default router;