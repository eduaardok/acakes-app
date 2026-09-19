import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { Prisma, RolUsuario } from '@prisma/client'
import { prisma } from '../lib/prisma'

const MIN_PASSWORD_LEN = 4
const BCRYPT_ROUNDS = 10

// Nunca exponer passwordHash: estos selects son la única forma de leer
// Usuario / UsuarioCliente desde estos endpoints.
const USUARIO_PUBLICO = { id: true, email: true, role: true, creadoEn: true }
const CLIENTE_CUENTA_PUBLICO = {
    id: true, email: true, nombre: true, createdAt: true, clienteId: true,
}

// Error de regla de negocio con su status. Existe para poder abortar desde
// dentro de una transacción: lanzarlo la revierte y el catch de turno lo
// traduce a una respuesta clara en vez de un 500 crudo.
class ReglaNegocio extends Error {
    constructor(readonly status: number, message: string) {
        super(message)
    }
}

// raw llega como string | string[] por los tipos de Express 5.
const parseId = (raw: unknown): number | null => {
    if (typeof raw !== 'string' || !raw.trim()) return null
    const id = Number(raw)
    return Number.isInteger(id) && id > 0 ? id : null
}

const parseRole = (raw: unknown): RolUsuario | null =>
    typeof raw === 'string' && raw in RolUsuario ? (raw as RolUsuario) : null

const ROLES_VALIDOS = Object.keys(RolUsuario).join(', ')

// Las validaciones de "último SYSTEM_ADMIN" son un check-then-act: sin
// aislamiento serializable, dos requests concurrentes podrían ver cada una
// "quedan 2" y dejar el sistema en 0. Serializable hace que la segunda
// falle con P2034 en vez de romper la invariante.
const enTransaccion = <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) =>
    prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

// Aborta si la operación dejaría al sistema sin ningún SYSTEM_ADMIN. Solo
// hace falta contar cuando el afectado es él mismo un SYSTEM_ADMIN.
const asegurarQuedaAlgunSystemAdmin = async (
    tx: Prisma.TransactionClient,
    objetivo: { role: RolUsuario },
    accion: string
) => {
    if (objetivo.role !== RolUsuario.SYSTEM_ADMIN) return

    const systemAdmins = await tx.usuario.count({
        where: { role: RolUsuario.SYSTEM_ADMIN },
    })

    if (systemAdmins <= 1) {
        throw new ReglaNegocio(
            400,
            `No se puede ${accion}: es el único SYSTEM_ADMIN del sistema. ` +
            'Asigná ese rol a otro usuario antes de hacerlo.'
        )
    }
}

const manejarError = (err: unknown, res: Response): void => {
    if (err instanceof ReglaNegocio) {
        res.status(err.status).json({ message: err.message })
        return
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Hoy ninguna FK apunta a Usuario (AuditLog.usuarioId es un Int
        // suelto a propósito, para que el rastro sobreviva al borrado del
        // actor), pero si alguna se agrega, esto evita un 500 crudo.
        if (err.code === 'P2003') {
            res.status(409).json({
                message: 'No se puede eliminar: tiene registros asociados que dependen de él',
            })
            return
        }
        if (err.code === 'P2025') {
            res.status(404).json({ message: 'No encontrado' })
            return
        }
        // Conflicto de serialización: dos operaciones sobre roles a la vez.
        if (err.code === 'P2034') {
            res.status(409).json({
                message: 'Otra operación modificó los roles al mismo tiempo. Intentá de nuevo.',
            })
            return
        }
    }
    throw err
}

// ─── Usuario (admin / system admin) ──────────────────

// GET /admin/usuarios
export async function listarUsuarios(_req: Request, res: Response) {
    const usuarios = await prisma.usuario.findMany({
        select: USUARIO_PUBLICO,
        orderBy: { creadoEn: 'desc' },
    })

    res.json(usuarios)
}

// POST /admin/usuarios — { email, password, role? }
export async function crearUsuario(req: Request, res: Response) {
    const { email, password, role } = req.body as {
        email?: string
        password?: string
        role?: string
    }

    const emailLimpio = typeof email === 'string' ? email.trim() : ''
    if (!emailLimpio) {
        res.status(400).json({ message: 'email es requerido' })
        return
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LEN) {
        res.status(400).json({
            message: `La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres`,
        })
        return
    }

    // role opcional: sin él se crea un admin de negocio, igual que el
    // @default(ADMIN) del schema.
    const rol = role === undefined ? RolUsuario.ADMIN : parseRole(role)
    if (!rol) {
        res.status(400).json({ message: `role inválido. Valores: ${ROLES_VALIDOS}` })
        return
    }

    try {
        const usuario = await prisma.usuario.create({
            data: {
                email: emailLimpio,
                passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
                role: rol,
            },
            select: USUARIO_PUBLICO,
        })
        res.status(201).json(usuario)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            res.status(409).json({ message: 'Ya existe un usuario con ese email' })
            return
        }
        manejarError(err, res)
    }
}

// PATCH /admin/usuarios/:id/role — { role }
export async function cambiarRoleUsuario(req: Request, res: Response) {
    const id = parseId(req.params.id)
    if (!id) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const rol = parseRole((req.body as { role?: unknown }).role)
    if (!rol) {
        res.status(400).json({ message: `role inválido. Valores: ${ROLES_VALIDOS}` })
        return
    }

    const actorId = Number(req.usuario?.usuarioId)

    // Regla de negocio, no solo de middleware: un SYSTEM_ADMIN que se quita
    // su propio rol se deja afuera de estos endpoints al instante.
    if (id === actorId && rol !== RolUsuario.SYSTEM_ADMIN) {
        res.status(400).json({
            message: 'No podés quitarte a vos mismo el rol SYSTEM_ADMIN. Pedíselo a otro SYSTEM_ADMIN.',
        })
        return
    }

    try {
        const usuario = await enTransaccion(async (tx) => {
            const objetivo = await tx.usuario.findUnique({
                where: { id },
                select: { id: true, role: true },
            })
            if (!objetivo) {
                throw new ReglaNegocio(404, 'Usuario no encontrado')
            }

            if (objetivo.role !== rol) {
                await asegurarQuedaAlgunSystemAdmin(tx, objetivo, 'cambiarle el rol a este usuario')
            }

            return tx.usuario.update({
                where: { id },
                data: { role: rol },
                select: USUARIO_PUBLICO,
            })
        })

        res.json(usuario)
    } catch (err) {
        manejarError(err, res)
    }
}

// DELETE /admin/usuarios/:id
export async function eliminarUsuario(req: Request, res: Response) {
    const id = parseId(req.params.id)
    if (!id) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    const actorId = Number(req.usuario?.usuarioId)

    if (id === actorId) {
        res.status(400).json({
            message: 'No podés eliminar tu propia cuenta. Pedíselo a otro SYSTEM_ADMIN.',
        })
        return
    }

    try {
        await enTransaccion(async (tx) => {
            const objetivo = await tx.usuario.findUnique({
                where: { id },
                select: { id: true, role: true },
            })
            if (!objetivo) {
                throw new ReglaNegocio(404, 'Usuario no encontrado')
            }

            await asegurarQuedaAlgunSystemAdmin(tx, objetivo, 'eliminar este usuario')

            await tx.usuario.delete({ where: { id } })
        })

        res.status(204).send()
    } catch (err) {
        manejarError(err, res)
    }
}

// ─── UsuarioCliente (cuentas del catálogo público) ───

// GET /admin/clientes-cuenta
export async function listarCuentasCliente(_req: Request, res: Response) {
    const cuentas = await prisma.usuarioCliente.findMany({
        select: CLIENTE_CUENTA_PUBLICO,
        orderBy: { createdAt: 'desc' },
    })

    res.json(cuentas)
}

// DELETE /admin/clientes-cuenta/:id
export async function eliminarCuentaCliente(req: Request, res: Response) {
    const id = parseId(req.params.id)
    if (!id) {
        res.status(400).json({ message: 'id inválido' })
        return
    }

    try {
        // Reseñas, favoritos, fechas especiales y tokens de reset caen por el
        // onDelete Cascade del schema; el Cliente vinculado no se borra, solo
        // queda desvinculado.
        await prisma.usuarioCliente.delete({ where: { id } })
        res.status(204).send()
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            res.status(404).json({ message: 'Cuenta de cliente no encontrada' })
            return
        }
        manejarError(err, res)
    }
}
