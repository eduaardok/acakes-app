import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { subirImagen, eliminarImagen } from '../lib/supabaseStorage'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 50
const MAX_IMAGENES_POR_PRODUCTO = 8

// GET /productos?page=&pageSize=&tematicaId=&ocasionId=
export async function getProductos(req: Request, res: Response) {
    const { tematicaId, ocasionId } = req.query

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(req.query.pageSize) || PAGE_SIZE_DEFAULT)
    )

    const where = {
        ...(tematicaId ? { tematicaId: String(tematicaId) } : {}),
        ...(ocasionId ? { ocasionId: String(ocasionId) } : {}),
    }

    const [productos, total] = await Promise.all([
        prisma.producto.findMany({
            where,
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                tematica: { select: { id: true, nombre: true } },
                ocasion: { select: { id: true, nombre: true } },
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

// GET /productos/:id
export async function getProductoById(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const producto = await prisma.producto.findUnique({
        where: { id },
        include: {
            imagenes: { orderBy: { orden: 'asc' } },
            tematica: { select: { id: true, nombre: true } },
            ocasion: { select: { id: true, nombre: true } },
        },
    })

    if (!producto) {
        res.status(404).json({ message: 'Producto no encontrado' })
        return
    }

    res.json(producto)
}

// POST /productos — multipart/form-data, campo "imagenes" con hasta 8 archivos
export async function createProducto(req: Request, res: Response) {
    const { nombre, descripcion, tematicaId, ocasionId } = req.body
    const archivos = (req.files as Express.Multer.File[] | undefined) ?? []

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
        res.status(400).json({ message: 'nombre es requerido' })
        return
    }
    if (archivos.length > MAX_IMAGENES_POR_PRODUCTO) {
        res.status(400).json({ message: `Máximo ${MAX_IMAGENES_POR_PRODUCTO} imágenes por producto` })
        return
    }

    // Se suben todas las imágenes primero; si alguna falla, se limpian las ya
    // subidas y no se crea el producto (para no dejarlo a medias).
    const urlsSubidas: string[] = []
    try {
        for (const archivo of archivos) {
            const url = await subirImagen(archivo.buffer, archivo.originalname, 'productos')
            urlsSubidas.push(url)
        }

        const producto = await prisma.producto.create({
            data: {
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                tematicaId: tematicaId?.trim() || null,
                ocasionId: ocasionId?.trim() || null,
                imagenes: {
                    create: urlsSubidas.map((url, index) => ({ url, orden: index })),
                },
            },
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                tematica: { select: { id: true, nombre: true } },
                ocasion: { select: { id: true, nombre: true } },
            },
        })

        res.status(201).json(producto)
    } catch (err) {
        await Promise.allSettled(urlsSubidas.map((url) => eliminarImagen(url)))

        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
            res.status(400).json({ message: 'Temática u ocasión inválida' })
            return
        }
        res.status(500).json({
            message: err instanceof Error ? err.message : 'Error al crear el producto',
        })
    }
}

// PATCH /productos/:id — solo datos, no imágenes
export async function updateProducto(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const { nombre, descripcion, tematicaId, ocasionId } = req.body

    const existente = await prisma.producto.findUnique({ where: { id } })
    if (!existente) {
        res.status(404).json({ message: 'Producto no encontrado' })
        return
    }

    const data: {
        nombre?: string
        descripcion?: string | null
        tematicaId?: string | null
        ocasionId?: string | null
    } = {}

    if (nombre !== undefined) {
        if (typeof nombre !== 'string' || !nombre.trim()) {
            res.status(400).json({ message: 'nombre no puede estar vacío' })
            return
        }
        data.nombre = nombre.trim()
    }
    if (descripcion !== undefined) data.descripcion = descripcion === null ? null : String(descripcion).trim() || null
    if (tematicaId !== undefined) data.tematicaId = tematicaId === null ? null : String(tematicaId).trim() || null
    if (ocasionId !== undefined) data.ocasionId = ocasionId === null ? null : String(ocasionId).trim() || null

    if (Object.keys(data).length === 0) {
        res.status(400).json({ message: 'No hay datos para actualizar' })
        return
    }

    try {
        const producto = await prisma.producto.update({
            where: { id },
            data,
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                tematica: { select: { id: true, nombre: true } },
                ocasion: { select: { id: true, nombre: true } },
            },
        })

        res.json(producto)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
            res.status(400).json({ message: 'Temática u ocasión inválida' })
            return
        }
        throw err
    }
}

// POST /productos/:id/imagenes — multipart, agrega hasta 8 imágenes nuevas
export async function addImagenesProducto(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const archivos = (req.files as Express.Multer.File[] | undefined) ?? []
    if (archivos.length === 0) {
        res.status(400).json({ message: 'No se enviaron imágenes' })
        return
    }
    if (archivos.length > MAX_IMAGENES_POR_PRODUCTO) {
        res.status(400).json({ message: `Máximo ${MAX_IMAGENES_POR_PRODUCTO} imágenes por vez` })
        return
    }

    const producto = await prisma.producto.findUnique({
        where: { id },
        include: { imagenes: true },
    })
    if (!producto) {
        res.status(404).json({ message: 'Producto no encontrado' })
        return
    }

    const ordenBase = producto.imagenes.reduce((max, img) => Math.max(max, img.orden), -1) + 1

    const urlsSubidas: string[] = []
    try {
        for (const archivo of archivos) {
            const url = await subirImagen(archivo.buffer, archivo.originalname, 'productos')
            urlsSubidas.push(url)
        }

        await prisma.productoImagen.createMany({
            data: urlsSubidas.map((url, index) => ({
                productoId: id,
                url,
                orden: ordenBase + index,
            })),
        })

        const actualizado = await prisma.producto.findUnique({
            where: { id },
            include: { imagenes: { orderBy: { orden: 'asc' } } },
        })
        res.status(201).json(actualizado)
    } catch (err) {
        await Promise.allSettled(urlsSubidas.map((url) => eliminarImagen(url)))
        res.status(500).json({
            message: err instanceof Error ? err.message : 'Error al subir las imágenes',
        })
    }
}

// DELETE /productos/:id/imagenes/:imagenId
export async function deleteImagenProducto(req: Request, res: Response) {
    const id = Number(req.params.id)
    const imagenId = Number(req.params.imagenId)
    if (!Number.isInteger(id) || !Number.isInteger(imagenId)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const imagen = await prisma.productoImagen.findUnique({ where: { id: imagenId } })
    if (!imagen || imagen.productoId !== id) {
        res.status(404).json({ message: 'Imagen no encontrada' })
        return
    }

    try {
        await eliminarImagen(imagen.url)
    } catch (err) {
        res.status(500).json({
            message: err instanceof Error ? err.message : 'Error al eliminar la imagen del almacenamiento',
        })
        return
    }

    await prisma.productoImagen.delete({ where: { id: imagenId } })
    res.status(204).send()
}

// DELETE /productos/:id
export async function deleteProducto(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const producto = await prisma.producto.findUnique({
        where: { id },
        include: { imagenes: true },
    })
    if (!producto) {
        res.status(404).json({ message: 'Producto no encontrado' })
        return
    }

    try {
        await Promise.all(producto.imagenes.map((img) => eliminarImagen(img.url)))
    } catch (err) {
        res.status(500).json({
            message: err instanceof Error ? err.message : 'Error al eliminar imágenes del almacenamiento',
        })
        return
    }

    await prisma.producto.delete({ where: { id } })
    res.status(204).send()
}
