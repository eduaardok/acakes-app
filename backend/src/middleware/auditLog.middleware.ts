import { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"

export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const esMonitoreo = req.headers["x-cron-source"] === "keepalive"
    if (esMonitoreo) return next()

    prisma.auditLog.create({
        data: {
            ruta: req.originalUrl,
            metodo: req.method,
            ip: req.ip,
            userAgent: req.headers["user-agent"] ?? null,
            usuarioId: req.usuario?.usuarioId != null ? Number(req.usuario.usuarioId) : null,
        }
    }).catch(() => {})

    next()
}