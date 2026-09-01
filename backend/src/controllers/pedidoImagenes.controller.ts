import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { subirImagen, eliminarImagen } from '../lib/supabaseStorage'

// POST /pedidos/:id/imagenes — multipart, campo "imagen" (una foto por request) + descripcion? opcional
export async function addImagenReferenciaPedido(req: Request, res: Response) {
    const pedidoId = Number(req.params.id)
    if (!Number.isInteger(pedidoId)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const archivo = req.file
    if (!archivo) {
        res.status(400).json({ message: 'No se envió ninguna imagen' })
        return
    }

    const { descripcion } = req.body

    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
    if (!pedido) {
        res.status(404).json({ message: 'Pedido no encontrado' })
        return
    }

    try {
        const url = await subirImagen(archivo.buffer, archivo.originalname, 'pedidos')
        const imagen = await prisma.pedidoImagen.create({
            data: {
                pedidoId,
                url,
                descripcion: descripcion?.trim() || null,
            },
        })
        res.status(201).json(imagen)
    } catch (err) {
        res.status(500).json({
            message: err instanceof Error ? err.message : 'Error al subir la imagen',
        })
    }
}

// GET /pedidos/:id/imagenes
export async function getImagenesPedido(req: Request, res: Response) {
    const pedidoId = Number(req.params.id)
    if (!Number.isInteger(pedidoId)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const imagenes = await prisma.pedidoImagen.findMany({
        where: { pedidoId },
        orderBy: { createdAt: 'asc' },
    })

    res.json(imagenes)
}

// DELETE /pedidos/:id/imagenes/:imagenId
export async function deleteImagenReferenciaPedido(req: Request, res: Response) {
    const pedidoId = Number(req.params.id)
    const imagenId = Number(req.params.imagenId)
    if (!Number.isInteger(pedidoId) || !Number.isInteger(imagenId)) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const imagen = await prisma.pedidoImagen.findUnique({ where: { id: imagenId } })
    if (!imagen || imagen.pedidoId !== pedidoId) {
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

    await prisma.pedidoImagen.delete({ where: { id: imagenId } })
    res.status(204).send()
}
