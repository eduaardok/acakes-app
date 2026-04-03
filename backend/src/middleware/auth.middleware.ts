import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    usuarioId: string;
    email: string;
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

        req.usuario = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};