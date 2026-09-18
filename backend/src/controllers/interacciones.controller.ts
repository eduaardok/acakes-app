import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { buildActorId } from '../lib/actor'
import { PAGE_SIZE_MAX, parseIdsCsv } from './catalogo.controller'

// Tope de ids en GET /resenas/likes — ver el comentario de PAGE_SIZE_MAX en
// catalogo.controller.ts: nunca hace falta pedir más ids que el tamaño máximo
// de página de reseñas, así que se reutiliza el mismo número en vez de
// definir un límite nuevo y arbitrario.
const RESENAS_LIKES_IDS_MAX = PAGE_SIZE_MAX

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

// GET /producto/:id/likes — total de LikeProducto + si el actor actual ya
// dio like. Sin cache: aunque "total" es agregado (podría cachearse), va
// junto con "meGusta" (por-actor) en la misma respuesta chica, así que se
// deja todo el endpoint fuera de cache en vez de partirlo en dos llamadas
// para un payload de dos campos.
export async function getLikesProducto(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    const [total, propio] = await Promise.all([
        prisma.likeProducto.count({ where: { productoId } }),
        prisma.likeProducto.findUnique({
            where: { productoId_actorId: { productoId, actorId } },
        }),
    ])

    res.json({ total, meGusta: propio !== null })
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

// GET /resenas/likes?ids=1,2,3 — de ese set de ids, cuáles likeó el actor
// actual. Batch (en vez de un GET /resena/:id/like por reseña) porque una
// sola carga de producto puede mostrar hasta RESENAS_PAGE_SIZE/pageSize
// reseñas a la vez — evita N round-trips extra en una app que ya paga
// latencia Render↔Supabase (ver publicCache.ts). Sin cache: es por-actor.
export async function getLikesResenas(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const idsCsv = parseIdsCsv(req.query.ids)
    if (idsCsv.length === 0) {
        res.json({ likeadas: [] })
        return
    }
    if (idsCsv.length > RESENAS_LIKES_IDS_MAX) {
        res.status(400).json({ error: `Máximo ${RESENAS_LIKES_IDS_MAX} ids por request` })
        return
    }

    const resenaIds = idsCsv.map(Number)
    if (resenaIds.some((id) => !Number.isInteger(id))) {
        res.status(400).json({ error: 'ids inválidos' })
        return
    }

    const likes = await prisma.likeResena.findMany({
        where: { resenaId: { in: resenaIds }, actorId },
        select: { resenaId: true },
    })

    res.json({ likeadas: likes.map((l) => l.resenaId) })
}

// GET /producto/:id/favorito — estado del favorito para el actor actual.
// Sin cache: a diferencia de getProductoDetalle (cacheado 90s y compartido
// por todos los visitantes), esto es por actor y tiene que reflejar el
// estado real de quien pregunta, no el de un visitante anterior.
export async function getFavoritoProducto(req: Request, res: Response) {
    const actorId = resolveActorId(req, res)
    if (actorId === null) return

    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    const favorito = await prisma.favorito.findUnique({
        where: { productoId_actorId: { productoId, actorId } },
    })

    res.json({ esFavorito: favorito !== null })
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
