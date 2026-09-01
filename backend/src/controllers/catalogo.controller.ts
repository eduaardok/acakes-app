import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { includeCategorias, aplanarCategorias } from '../lib/categoriasProducto'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 50
const RESENAS_PAGE_SIZE = 10

function parseIdsCsv(value: unknown): string[] {
    if (typeof value !== 'string' || !value.trim()) return []
    return value.split(',').map((v) => v.trim()).filter(Boolean)
}

// GET /catalogo?tematicaIds=id1,id2&ocasionIds=id1,id2&page=1&pageSize=20&ordenarPor=vistas
// AND múltiple: si se piden 2 tematicaIds, el producto debe tener AMBAS asignadas.
export async function getCatalogo(req: Request, res: Response) {
    const tematicaIds = parseIdsCsv(req.query.tematicaIds)
    const ocasionIds = parseIdsCsv(req.query.ocasionIds)
    const { ordenarPor } = req.query

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(req.query.pageSize) || PAGE_SIZE_DEFAULT)
    )

    const and: Prisma.ProductoWhereInput[] = [
        ...tematicaIds.map((id): Prisma.ProductoWhereInput => ({ tematicas: { some: { tematicaId: id } } })),
        ...ocasionIds.map((id): Prisma.ProductoWhereInput => ({ ocasiones: { some: { ocasionId: id } } })),
    ]
    const where: Prisma.ProductoWhereInput = and.length > 0 ? { AND: and } : {}

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
                createdAt: true,
                imagenes: {
                    orderBy: { orden: 'asc' },
                    take: 1,
                    select: { id: true, url: true, orden: true },
                },
                ...includeCategorias,
            },
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.producto.count({ where }),
    ])

    res.json({
        productos: productos.map(aplanarCategorias),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    })
}

// GET /producto/:id
export async function getProductoDetalle(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    // update con increment atómico: evita el race condition de un
    // findUnique + update en dos pasos bajo llamadas concurrentes.
    try {
        const [producto, resenasTotal] = await Promise.all([
            prisma.producto.update({
                where: { id },
                data: { vistas: { increment: 1 } },
                select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
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
                        },
                    },
                    ...includeCategorias,
                },
            }),
            prisma.resena.count({ where: { productoId: id } }),
        ])

        res.json({ ...aplanarCategorias(producto), resenasTotal })
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
            },
        }),
        prisma.resena.count({ where: { productoId } }),
    ])

    res.json({
        resenas,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    })
}
