import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// GET /pedidos?fecha=2024-01-15&estado=CONFIRMADO
export async function getPedidos(req: Request, res: Response) {
    const { fecha, estado } = req.query

    const pedidos = await prisma.pedido.findMany({
        where: {
            ...(estado ? { estado: estado as any } : {}),
            ...(fecha ? {
                fechaEntrega: {
                    gte: new Date(`${fecha}T00:00:00`),
                    lte: new Date(`${fecha}T23:59:59`)
                }
            } : {})
        },
        include: { cliente: true },
        orderBy: { fechaEntrega: 'asc' }
    })

    res.json(pedidos)
}

// GET /pedidos/hoy
export async function getPedidosHoy(req: Request, res: Response) {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)

    const pedidos = await prisma.pedido.findMany({
        where: {
            fechaEntrega: { gte: inicio, lte: fin }
        },
        include: { cliente: true },
        orderBy: { fechaEntrega: 'asc' }
    })

    res.json(pedidos)
}

// GET /pedidos/:id
export async function getPedidoById(req: Request, res: Response) {
    const { id } = req.params

    const pedido = await prisma.pedido.findUnique({
        where: { id: Number(id) },
        include: { cliente: true }
    })

    if (!pedido) {
        res.status(404).json({ message: 'Pedido no encontrado' })
        return
    }

    res.json(pedido)
}

// POST /pedidos
export async function createPedido(req: Request, res: Response) {
    const { clienteId, descripcion, precio, fechaEntrega, notas, estado } = req.body

    if (!clienteId || !descripcion || !precio || !fechaEntrega) {
        res.status(400).json({ message: 'clienteId, descripcion, precio y fechaEntrega son requeridos' })
        return
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } })
    if (!cliente) {
        res.status(404).json({ message: 'Cliente no encontrado' })
        return
    }

    const pedido = await prisma.pedido.create({
        data: {
            clienteId: Number(clienteId),
            descripcion,
            precio: Number(precio),
            fechaEntrega: new Date(fechaEntrega),
            notas,
            estado: estado ?? 'BORRADOR'
        },
        include: { cliente: true }
    })

    res.status(201).json(pedido)
}