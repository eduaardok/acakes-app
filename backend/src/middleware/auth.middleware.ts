import { Request, Response, NextFunction } from 'express'

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Implementación completa en Día 6
    // Por ahora deja pasar todo para poder probar los endpoints
    next()
}