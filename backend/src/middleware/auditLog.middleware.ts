import { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"

// Prefijos de ruta que SÍ se registran en AuditLog.
// Ajusta esta lista para controlar qué se loguea sin tocar el resto del middleware.
const RUTAS_AUDITADAS = ["/auth", "/pedidos", "/productos", "/clientes", "/categorias", "/usuarios-cliente"]

export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const esMonitoreo = req.headers["x-cron-source"] === "keepalive"
    if (esMonitoreo) return next()

    const debeAuditar = RUTAS_AUDITADAS.some(prefijo => req.path.startsWith(prefijo))
    if (!debeAuditar) return next()

    prisma.auditLog.create({
        data: {
            ruta: req.path,
            metodo: req.method,
            ip: req.ip,
            userAgent: req.headers["user-agent"] ?? null,
            usuarioId: req.usuario?.usuarioId ?? null,
        }
    }).catch(() => {})

    next()
}