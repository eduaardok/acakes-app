import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    usuarioId: number | string;
    email: string;
    role: "admin";
}

// Extendemos Request para poder acceder a req.usuario en los controllers
declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload;
        }
    }
}

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
        ) as TokenPayload;

        // No basta con firma válida: un JWT de cliente firmado con el mismo
        // secreto no debe poder acceder a rutas de admin.
        if (payload.role !== "admin") {
            return res.status(403).json({ error: "No autorizado para este recurso" });
        }

        req.usuario = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};