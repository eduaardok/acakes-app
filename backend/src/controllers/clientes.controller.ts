import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { TipoObservacion } from '@prisma/client'

// GET /clientes?buscar=nombre_o_telefono
export async function getClientes(req: Request, res: Response) {
    const { q } = req.query

    const clientes = await prisma.cliente.findMany({
        where: q ? {
            OR: [
                { nombre: { contains: String(q), mode: 'insensitive' } },
                { telefono: { contains: String(q) } }
            ]
        } : undefined,
        orderBy: { creadoEn: 'desc' }
    })

    res.json(clientes)
}

// GET /clientes/:id
export async function getClienteById(req: Request, res: Response) {
    const { id } = req.params

    const cliente = await prisma.cliente.findUnique({
        where: { id: Number(id) },
        include: {
            pedidos: { orderBy: { creadoEn: 'desc' } },
            observaciones: { orderBy: { fecha: 'desc' } }
        }
    })

    if (!cliente) {
        res.status(404).json({ message: 'Cliente no encontrado' })
        return
    }

    res.json(cliente)
}

// POST /clientes
export async function createCliente(req: Request, res: Response) {
    const { nombre, telefono, email } = req.body

    if (!nombre || !telefono) {
        res.status(400).json({ message: 'nombre y telefono son requeridos' })
        return
    }

    const existe = await prisma.cliente.findUnique({ where: { telefono } })
    if (existe) {
        res.status(409).json({ message: 'Ya existe un cliente con ese teléfono' })
        return
    }

    const cliente = await prisma.cliente.create({
        data: { nombre, telefono, email }
    })

    res.status(201).json(cliente)
}

// PATCH /clientes/:id  — actualización parcial (nombre, teléfono, email)
export async function updateCliente(req: Request, res: Response) {
    const { id } = req.params
    const { nombre, telefono, email } = req.body

    const existe = await prisma.cliente.findUnique({ where: { id: Number(id) } })
    if (!existe) {
        res.status(404).json({ message: 'Cliente no encontrado' })
        return
    }

    const data: { nombre?: string; telefono?: string; email?: string | null } = {}

    if (nombre !== undefined) {
        if (typeof nombre !== 'string' || !nombre.trim()) {
            res.status(400).json({ message: 'El nombre no puede estar vacío' })
            return
        }
        data.nombre = nombre.trim()
    }
    if (telefono !== undefined) {
        if (typeof telefono !== 'string' || !telefono.trim()) {
            res.status(400).json({ message: 'El teléfono no puede estar vacío' })
            return
        }
        const t = telefono.trim()
        if (t !== existe.telefono) {
            const duplicado = await prisma.cliente.findUnique({ where: { telefono: t } })
            if (duplicado) {
                res.status(409).json({ message: 'Ya existe un cliente con ese teléfono' })
                return
            }
        }
        data.telefono = t
    }
    if (email !== undefined) {
        if (email === null || email === '') {
            data.email = null
        } else if (typeof email === 'string') {
            data.email = email.trim() || null
        } else {
            res.status(400).json({ message: 'Email inválido' })
            return
        }
    }

    if (Object.keys(data).length === 0) {
        res.status(400).json({ message: 'No hay datos para actualizar' })
        return
    }

    await prisma.cliente.update({
        where: { id: Number(id) },
        data
    })

    const cliente = await prisma.cliente.findUnique({
        where: { id: Number(id) },
        include: {
            pedidos: { orderBy: { creadoEn: 'desc' } },
            observaciones: { orderBy: { fecha: 'desc' } }
        }
    })

    res.json(cliente)
}

// POST /clientes/:id/observaciones
export async function createObservacion(req: Request, res: Response) {
    const { id } = req.params
    const { tipo, descripcion } = req.body

    if (!tipo || !descripcion) {
        res.status(400).json({ message: 'tipo y descripcion son requeridos' })
        return
    }

    const tiposValidos = Object.values(TipoObservacion)
    if (!tiposValidos.includes(tipo)) {
        res.status(400).json({
            message: `tipo inválido. Valores permitidos: ${tiposValidos.join(', ')}`
        })
        return
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } })
    if (!cliente) {
        res.status(404).json({ message: 'Cliente no encontrado' })
        return
    }

    const observacion = await prisma.observacion.create({
        data: {
            clienteId: Number(id),
            tipo: tipo as TipoObservacion,
            descripcion,
            autoGenerada: false
        }
    })

    res.status(201).json(observacion)
}