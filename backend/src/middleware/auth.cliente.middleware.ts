import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface ClienteTokenPayload {
    usuarioId: number;
    email: string;
    role: "cliente";
}

// Namespace propio (req.usuarioCliente) para no pisar req.usuario del admin
// y no poder confundir un token con otro por accidente en un controller.
declare global {
    namespace Express {
        interface Request {
            usuarioCliente?: ClienteTokenPayload;
        }
    }
}

function verificarClienteToken(token: string): ClienteTokenPayload | null {
    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as ClienteTokenPayload;

        if (payload.role !== "cliente") return null;
        return payload;
    } catch {
        return null;
    }
}

// Requiere JWT de cliente válido. Rechaza tokens de admin (role !== 'cliente').
export const authenticateClienteToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token requerido" });
    }

    const payload = verificarClienteToken(token);
    if (!payload) {
        return res.status(403).json({ error: "No autorizado para este recurso" });
    }

    req.usuarioCliente = payload;
    next();
};

// Para rutas de interacción anónima/autenticada: si viene un JWT de cliente
// válido lo adjunta a req.usuarioCliente, pero nunca rechaza la petición
// por token ausente o inválido (el controller decide con X-Visitante-Id).
export const optionalClienteToken = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (token) {
        const payload = verificarClienteToken(token);
        if (payload) req.usuarioCliente = payload;
    }

    next();
};
