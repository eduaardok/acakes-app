import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RolUsuario } from "@prisma/client";

export interface TokenPayload {
    usuarioId: number | string;
    email: string;
    role: RolUsuario;
}

// Extendemos Request para poder acceder a req.usuario en los controllers
declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload;
        }
    }
}

const ROLES_USUARIO = Object.values(RolUsuario) as string[];

// Los tokens emitidos antes de que Usuario tuviera role llevan el literal
// "admin" hardcodeado y expiran a los 7 días. Los tratamos como ADMIN para
// no desloguear a todos los admins al desplegar; este mapeo se puede quitar
// una semana después del deploy.
const ROL_LEGACY = "admin";

const normalizarRol = (role: unknown): RolUsuario | null => {
    if (role === ROL_LEGACY) return RolUsuario.ADMIN;
    if (typeof role === "string" && ROLES_USUARIO.includes(role)) {
        return role as RolUsuario;
    }
    return null;
};

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1]; // Esperamos: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Token requerido" });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as Omit<TokenPayload, "role"> & { role?: unknown };

        // No basta con firma válida: un JWT de cliente firmado con el mismo
        // secreto no debe poder acceder a rutas de admin. Solo los roles de
        // Usuario (ADMIN, SYSTEM_ADMIN) pasan.
        const role = normalizarRol(payload.role);
        if (!role) {
            return res.status(403).json({ error: "No autorizado para este recurso" });
        }

        req.usuario = { usuarioId: payload.usuarioId, email: payload.email, role };
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};
