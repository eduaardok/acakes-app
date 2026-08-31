import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { buildActorId } from '../lib/actor'

// Resuelve actorId a partir del JWT de cliente opcional (req.usuarioCliente,
// adjuntado por optionalClienteToken si vino y era válido) o del header
// X-Visitante-Id. Responde 400 y devuelve null si no hay ninguno de los dos.
function resolveActorId(req: Request, res: Response): string | null {
    const usuarioId = req.usuarioCliente?.usuarioId
    const visitanteId = req.header('X-Visitante-Id') || undefined

    try {
        return buildActorId(usuarioId, visitanteId)
    } catch {
        res.status(400).json({ error: 'Se requiere sesión de cliente o header X-Visitante-Id' })
        return null
    }
}

// POST /producto/:id/like
export async function likeProducto(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    await prisma.likeProducto.upsert({
        where: { productoId_actorId: { productoId, actorId } },
        create: { productoId, actorId },
        update: {},
    })

    res.status(204).send()
}

// DELETE /producto/:id/like
export async function unlikeProducto(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    await prisma.likeProducto.deleteMany({ where: { productoId, actorId } })
    res.status(204).send()
}

// POST /resena/:id/like
export async function likeResena(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const resenaId = Number(req.params.id)
    if (!Number.isInteger(resenaId)) {
        res.status(400).json({ error: 'id de reseña inválido' })
        return
    }

    await prisma.likeResena.upsert({
        where: { resenaId_actorId: { resenaId, actorId } },
        create: { resenaId, actorId },
        update: {},
    })

    res.status(204).send()
}

// DELETE /resena/:id/like
export async function unlikeResena(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const resenaId = Number(req.params.id)
    if (!Number.isInteger(resenaId)) {
        res.status(400).json({ error: 'id de reseña inválido' })
        return
    }

    await prisma.likeResena.deleteMany({ where: { resenaId, actorId } })
    res.status(204).send()
}

// POST /producto/:id/favorito
export async function favoritoProducto(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    await prisma.favorito.upsert({
        where: { productoId_actorId: { productoId, actorId } },
        create: { productoId, actorId },
        update: {},
    })

    res.status(204).send()
}

// DELETE /producto/:id/favorito
export async function unfavoritoProducto(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    await prisma.favorito.deleteMany({ where: { productoId, actorId } })
    res.status(204).send()
}
