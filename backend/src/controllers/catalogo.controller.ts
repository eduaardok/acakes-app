import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 50
const RESENAS_PAGE_SIZE = 10

// GET /catalogo?tematica=infantil&ocasion=quinceañera&page=1&pageSize=20
export async function getCatalogo(req: Request, res: Response) {
    const { tematica, ocasion } = req.query

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(req.query.pageSize) || PAGE_SIZE_DEFAULT)
    )

    const where = {
        ...(tematica ? { tematica: String(tematica) } : {}),
        ...(ocasion ? { ocasion: String(ocasion) } : {}),
    }

    const [productos, total] = await Promise.all([
        prisma.producto.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                tematica: true,
                ocasion: true,
                createdAt: true,
                imagenes: {
                    orderBy: { orden: 'asc' },
                    take: 1,
                    select: { id: true, url: true, orden: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.producto.count({ where }),
    ])

    res.json({
        productos,
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
                    tematica: true,
                    ocasion: true,
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
                },
            }),
            prisma.resena.count({ where: { productoId: id } }),
        ])

        res.json({ ...producto, resenasTotal })
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
