import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type TipoCategoria = 'tematica' | 'ocasion'

// Tematica y Ocasion tienen la misma forma (id, nombre único, productos[], creadoEn),
// así que un solo controller parametrizado por tipo evita duplicar el CRUD dos veces.
interface CategoriaDelegate {
    findMany(args: unknown): Promise<unknown[]>
    findUnique(args: unknown): Promise<{ id: string; _count: { productos: number } } | null>
    create(args: unknown): Promise<unknown>
    update(args: unknown): Promise<unknown>
    delete(args: unknown): Promise<unknown>
    upsert(args: unknown): Promise<unknown>
}

function delegateFor(tipo: TipoCategoria): CategoriaDelegate {
    return (tipo === 'tematica' ? prisma.tematica : prisma.ocasion) as unknown as CategoriaDelegate
}

const nombreLabel = (tipo: TipoCategoria) => (tipo === 'tematica' ? 'temática' : 'ocasión')

// GET /categorias/tematicas | /categorias/ocasiones
export function listarCategorias(tipo: TipoCategoria) {
    return async (_req: Request, res: Response) => {
        const categorias = await delegateFor(tipo).findMany({ orderBy: { nombre: 'asc' } })
        res.json(categorias)
    }
}

// POST /categorias/tematicas | /categorias/ocasiones — { nombre }
export function crearCategoria(tipo: TipoCategoria) {
    return async (req: Request, res: Response) => {
        const { nombre } = req.body as { nombre?: string }
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            res.status(400).json({ message: 'nombre es requerido' })
            return
        }

        try {
            const categoria = await delegateFor(tipo).create({ data: { nombre: nombre.trim() } })
            res.status(201).json(categoria)
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                res.status(409).json({ message: `Ya existe una ${nombreLabel(tipo)} con ese nombre` })
                return
            }
            throw err
        }
    }
}

// PATCH /categorias/tematicas/:id | /categorias/ocasiones/:id — { nombre }
export function actualizarCategoria(tipo: TipoCategoria) {
    return async (req: Request, res: Response) => {
        const { id } = req.params
        const { nombre } = req.body as { nombre?: string }
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            res.status(400).json({ message: 'nombre es requerido' })
            return
        }

        try {
            const categoria = await delegateFor(tipo).update({
                where: { id },
                data: { nombre: nombre.trim() },
            })
            res.json(categoria)
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    res.status(409).json({ message: `Ya existe una ${nombreLabel(tipo)} con ese nombre` })
                    return
                }
                if (err.code === 'P2025') {
                    res.status(404).json({ message: 'Categoría no encontrada' })
                    return
                }
            }
            throw err
        }
    }
}

// DELETE /categorias/tematicas/:id | /categorias/ocasiones/:id
// Bloquea el borrado si hay productos asociados — evitar dejar productos huérfanos
// visualmente (aunque la FK sea ON DELETE SET NULL, la decisión de desasignar es del admin).
export function eliminarCategoria(tipo: TipoCategoria) {
    return async (req: Request, res: Response) => {
        const { id } = req.params

        const categoria = await delegateFor(tipo).findUnique({
            where: { id },
            include: { _count: { select: { productos: true } } },
        })

        if (!categoria) {
            res.status(404).json({ message: 'Categoría no encontrada' })
            return
        }

        if (categoria._count.productos > 0) {
            res.status(409).json({
                message: `No se puede eliminar: ${categoria._count.productos} producto(s) usan esta ${nombreLabel(tipo)}`,
            })
            return
        }

        await delegateFor(tipo).delete({ where: { id } })
        res.status(204).send()
    }
}

// POST /categorias/tematicas/resolver | /categorias/ocasiones/resolver — { nombre }
// Usado por el combobox "buscar o crear" del formulario de producto: si el nombre
// ya existe devuelve esa fila, si no la crea. Separado del endpoint de producto para
// no mezclar la creación de categorías con la lógica de subida/rollback de imágenes.
export function resolverCategoria(tipo: TipoCategoria) {
    return async (req: Request, res: Response) => {
        const { nombre } = req.body as { nombre?: string }
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            res.status(400).json({ message: 'nombre es requerido' })
            return
        }

        const nombreTrim = nombre.trim()
        const categoria = await delegateFor(tipo).upsert({
            where: { nombre: nombreTrim },
            update: {},
            create: { nombre: nombreTrim },
        })
        res.status(200).json(categoria)
    }
}
