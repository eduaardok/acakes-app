import { Request, Response } from 'express'
import { Prisma, TipoProducto } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { includeCategorias, aplanarCategorias } from '../lib/categoriasProducto'
import { catalogoCache, productoDetalleCache, productoCacheKey, logCache } from '../lib/publicCache'

const PAGE_SIZE_DEFAULT = 20
// Exportado: interacciones.controller.ts lo reutiliza como tope de ids en
// GET /resenas/likes — ese batch nunca necesita más ids que el tamaño máximo
// de página de reseñas, que ya usa esta misma constante (ver getResenasProducto).
export const PAGE_SIZE_MAX = 50
const RESENAS_PAGE_SIZE = 10
const TIPOS_PRODUCTO_VALIDOS = Object.values(TipoProducto)

export function parseIdsCsv(value: unknown): string[] {
    if (typeof value !== 'string' || !value.trim()) return []
    return value.split(',').map((v) => v.trim()).filter(Boolean)
}

// A diferencia de tematicaIds/ocasionIds (relación muchos-a-muchos, filtro
// AND-múltiple con `some`), tipo es un solo valor por producto — un query
// inválido/desconocido se ignora (sin filtro) en vez de dar 400, mismo
// criterio permisivo que ya usa parseIdsCsv para query params del catálogo.
function parseTipoQuery(value: unknown): TipoProducto | undefined {
    if (typeof value === 'string' && (TIPOS_PRODUCTO_VALIDOS as string[]).includes(value)) {
        return value as TipoProducto
    }
    return undefined
}

// Una key por combinación de filtros/página/orden — el catálogo acepta
// filtros, así que no se puede cachear un único resultado global (eso le
// serviría el listado sin filtrar a quien sí filtró). Los ids se ordenan
// para que el mismo conjunto de filtros en distinto orden pegue a la misma
// entrada de cache.
function catalogoCacheKey(
    tematicaIds: string[],
    ocasionIds: string[],
    tipo: TipoProducto | undefined,
    page: number,
    pageSize: number,
    ordenarPor: unknown
): string {
    const t = [...tematicaIds].sort().join(',')
    const o = [...ocasionIds].sort().join(',')
    const orden = typeof ordenarPor === 'string' ? ordenarPor : ''
    return `catalogo:t=${t}|o=${o}|tipo=${tipo ?? ''}|page=${page}|size=${pageSize}|orden=${orden}`
}

// GET /catalogo?tematicaIds=id1,id2&ocasionIds=id1,id2&tipo=PASTEL&page=1&pageSize=20&ordenarPor=vistas
// AND múltiple: si se piden 2 tematicaIds, el producto debe tener AMBAS asignadas.
// tipo no es AND-múltiple (un producto tiene un solo tipo): filtro simple `where: { tipo }`.
export async function getCatalogo(req: Request, res: Response) {
    const tematicaIds = parseIdsCsv(req.query.tematicaIds)
    const ocasionIds = parseIdsCsv(req.query.ocasionIds)
    const tipo = parseTipoQuery(req.query.tipo)
    const { ordenarPor } = req.query

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(req.query.pageSize) || PAGE_SIZE_DEFAULT)
    )

    const cacheKey = catalogoCacheKey(tematicaIds, ocasionIds, tipo, page, pageSize, ordenarPor)
    const cacheado = catalogoCache.get(cacheKey)
    if (cacheado) {
        logCache('HIT', cacheKey)
        res.json(cacheado)
        return
    }
    logCache('MISS', cacheKey)

    const and: Prisma.ProductoWhereInput[] = [
        ...tematicaIds.map((id): Prisma.ProductoWhereInput => ({ tematicas: { some: { tematicaId: id } } })),
        ...ocasionIds.map((id): Prisma.ProductoWhereInput => ({ ocasiones: { some: { ocasionId: id } } })),
    ]
    const where: Prisma.ProductoWhereInput = {
        ...(and.length > 0 ? { AND: and } : {}),
        ...(tipo ? { tipo } : {}),
    }

    // ordenarPor=vistas — usado por la landing pública para "destacados"
    const orderBy: Prisma.ProductoOrderByWithRelationInput =
        ordenarPor === 'vistas' ? { vistas: 'desc' } : { createdAt: 'desc' }

    const [productos, total] = await Promise.all([
        prisma.producto.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                tipo: true,
                createdAt: true,
                imagenes: {
                    orderBy: { orden: 'asc' },
                    take: 1,
                    select: { id: true, url: true, orden: true },
                },
                // El listado solo trae la primera foto (arriba); _count da el total
                // real para que el frontend pueda mostrar "+N fotos" sin traerlas todas.
                _count: { select: { imagenes: true } },
                ...includeCategorias,
            },
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.producto.count({ where }),
    ])

    const payload = {
        productos: productos.map(aplanarCategorias),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    }
    catalogoCache.set(cacheKey, payload)
    res.json(payload)
}

// GET /producto/:id
// El incremento de vistas es un write y nunca pasa por cache: se dispara en
// cada request, HIT o MISS. Solo el read (datos del producto + reseñas) se
// sirve desde cache por 90s — por eso el conteo de vistas que ve el cliente
// puede quedar hasta 90s atrás del real, es el trade-off aceptado del cache.
export async function getProductoDetalle(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    try {
        // select mínimo: a diferencia del read, este write no necesita devolver
        // el producto completo (eso lo resuelve el cache o el findUnique de abajo).
        const incrementoVistas = prisma.producto.update({
            where: { id },
            data: { vistas: { increment: 1 } },
            select: { id: true },
        })

        const cacheKey = productoCacheKey(id)
        const cacheado = productoDetalleCache.get(cacheKey)
        if (cacheado) {
            await incrementoVistas
            logCache('HIT', cacheKey)
            res.json(cacheado)
            return
        }
        logCache('MISS', cacheKey)

        const [, producto, resenasTotal] = await Promise.all([
            incrementoVistas,
            prisma.producto.findUnique({
                where: { id },
                select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    tipo: true,
                    vistas: true,
                    createdAt: true,
                    imagenes: {
                        orderBy: { orden: 'asc' },
                        select: { id: true, url: true, orden: true },
                    },
                    resenas: {
                        orderBy: { createdAt: 'desc' },
                        take: RESENAS_PAGE_SIZE,
                        select: {
                            id: true,
                            calificacion: true,
                            comentario: true,
                            createdAt: true,
                            usuario: { select: { id: true, nombre: true } },
                            // Agregado, no por-actor: a diferencia de "meGusta" (que
                            // depende de quién pregunta), esto es seguro de cachear
                            // 90s junto con el resto del payload — mismo trade-off ya
                            // aceptado para `vistas` más abajo.
                            _count: { select: { likes: true } },
                        },
                    },
                    ...includeCategorias,
                },
            }),
            prisma.resena.count({ where: { productoId: id } }),
        ])

        if (!producto) {
            res.status(404).json({ message: 'Producto no encontrado' })
            return
        }

        const payload = {
            ...aplanarCategorias(producto),
            resenas: producto.resenas.map(({ _count, ...resena }) => ({
                ...resena,
                likesCount: _count.likes,
            })),
            resenasTotal,
        }
        productoDetalleCache.set(cacheKey, payload)
        res.json(payload)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            res.status(404).json({ message: 'Producto no encontrado' })
            return
        }
        throw err
    }
}

// GET /producto/:id/resenas?page=1&pageSize=10 — para "cargar más" reseñas
// más allá de las RESENAS_PAGE_SIZE incluidas en el detalle del producto.
export async function getResenasProducto(req: Request, res: Response) {
    const productoId = Number(req.params.id)
    if (!Number.isInteger(productoId)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(req.query.pageSize) || RESENAS_PAGE_SIZE)
    )

    const [resenas, total] = await Promise.all([
        prisma.resena.findMany({
            where: { productoId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                calificacion: true,
                comentario: true,
                createdAt: true,
                usuario: { select: { id: true, nombre: true } },
                _count: { select: { likes: true } },
            },
        }),
        prisma.resena.count({ where: { productoId } }),
    ])

    res.json({
        resenas: resenas.map(({ _count, ...resena }) => ({ ...resena, likesCount: _count.likes })),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    })
}
