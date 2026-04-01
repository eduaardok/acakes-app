import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// GET /clientes?buscar=nombre_o_telefono
export async function getClientes(req: Request, res: Response) {
    const { buscar } = req.query

    const clientes = await prisma.cliente.findMany({
        where: buscar ? {
            OR: [
                { nombre: { contains: String(buscar), mode: 'insensitive' } },
                { telefono: { contains: String(buscar) } }
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

// PATCH /clientes/:id
export async function updateCliente(req: Request, res: Response) {
    const { id } = req.params
    const { nombre, telefono, email } = req.body

    const existe = await prisma.cliente.findUnique({ where: { id: Number(id) } })
    if (!existe) {
        res.status(404).json({ message: 'Cliente no encontrado' })
        return
    }

    const cliente = await prisma.cliente.update({
        where: { id: Number(id) },
        data: { nombre, telefono, email }
    })

    res.json(cliente)
}