import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { includeCategorias, aplanarCategorias } from '../lib/categoriasProducto'

// POST /producto/:id/resena — requiere JWT de cliente. Sin verificación de compra.
export async function crearResena(req: Request, res: Response) {
    const usuarioId = req.usuarioCliente!.usuarioId
    const productoId = Number(req.params.id)
    const { calificacion, comentario } = req.body as { calificacion?: number; comentario?: string }

    if (!Number.isInteger(productoId)) {
        res.status(400).json({ error: 'id de producto inválido' })
        return
    }

    if (!Number.isInteger(calificacion) || calificacion! < 1 || calificacion! > 5) {
        res.status(400).json({ error: 'calificacion debe ser un entero entre 1 y 5' })
        return
    }

    const producto = await prisma.producto.findUnique({ where: { id: productoId }, select: { id: true } })
    if (!producto) {
        res.status(404).json({ error: 'Producto no encontrado' })
        return
    }

    const resena = await prisma.resena.create({
        data: {
            productoId,
            usuarioId,
            calificacion: calificacion!,
            comentario: comentario ?? null,
        },
    })

    res.status(201).json(resena)
}

// GET /mis-favoritos — requiere JWT de cliente. Los favoritos anónimos (actorId
// "visitante:<uuid>") no son recuperables aquí porque no hay cuenta a la que asociarlos.
export async function misFavoritos(req: Request, res: Response) {
    const usuarioId = req.usuarioCliente!.usuarioId
    const actorId = `user:${usuarioId}`

    const favoritos = await prisma.favorito.findMany({
        where: { actorId },
        orderBy: { createdAt: 'desc' },
        include: {
            producto: {
                select: {
                    id: true,
                    nombre: true,
                    imagenes: { orderBy: { orden: 'asc' }, take: 1, select: { url: true } },
                    ...includeCategorias,
                },
            },
        },
    })

    res.json(favoritos.map((f) => ({ ...f, producto: aplanarCategorias(f.producto) })))
}

// POST /fechas-especiales
export async function crearFechaEspecial(req: Request, res: Response) {
    const usuarioId = req.usuarioCliente!.usuarioId
    const { descripcion, fecha } = req.body as { descripcion?: string; fecha?: string }

    if (!descripcion || !fecha) {
        res.status(400).json({ error: 'descripcion y fecha son requeridos' })
        return
    }

    const fechaParsed = new Date(fecha)
    if (Number.isNaN(fechaParsed.getTime())) {
        res.status(400).json({ error: 'fecha inválida' })
        return
    }

    const fechaEspecial = await prisma.fechaEspecial.create({
        data: { usuarioId, descripcion, fecha: fechaParsed },
    })

    res.status(201).json(fechaEspecial)
}

// GET /fechas-especiales — scoped al usuario del JWT
export async function getFechasEspeciales(req: Request, res: Response) {
    const usuarioId = req.usuarioCliente!.usuarioId

    const fechas = await prisma.fechaEspecial.findMany({
        where: { usuarioId },
        orderBy: { fecha: 'asc' },
    })

    res.json(fechas)
}

// DELETE /fechas-especiales/:id — un usuario no puede borrar fechas de otro
export async function deleteFechaEspecial(req: Request, res: Response) {
    const usuarioId = req.usuarioCliente!.usuarioId
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'id inválido' })
        return
    }

    const { count } = await prisma.fechaEspecial.deleteMany({
        where: { id, usuarioId },
    })

    if (count === 0) {
        res.status(404).json({ error: 'Fecha especial no encontrada' })
        return
    }

    res.status(204).send()
}
