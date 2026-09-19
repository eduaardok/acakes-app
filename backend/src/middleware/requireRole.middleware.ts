import { Request, Response, NextFunction } from "express";
import { RolUsuario } from "@prisma/client";
// Además del tipo, este import trae la extensión global de Express.Request
// (req.usuario) declarada en auth.middleware.
import type { TokenPayload } from "./auth.middleware";

// Autorización por rol para rutas de Usuario. Va siempre DESPUÉS de
// authenticateToken, que es quien valida la firma del JWT y deja el rol
// normalizado en req.usuario.role.
//
//   router.get("/usuarios", authenticateToken, requireRole(RolUsuario.SYSTEM_ADMIN), listar)
export const requireRole =
    (...roles: RolUsuario[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const role: TokenPayload["role"] | undefined = req.usuario?.role;

        if (!role) {
            return res.status(401).json({ error: "No autorizado" });
        }

        if (!roles.includes(role)) {
            return res.status(403).json({ error: "No autorizado para este recurso" });
        }

        next();
    };
