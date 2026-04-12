import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { EstadoPedido } from '@prisma/client'
import { esTransicionValida } from '../lib/transiciones'

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
// PATCH /pedidos/:id/estado
export async function updateEstadoPedido(req: Request, res: Response) {
    const { id } = req.params
    const { estado } = req.body

    if (!estado) {
        res.status(400).json({ message: 'estado es requerido' })
        return
    }

    const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } })
    if (!pedido) {
        res.status(404).json({ message: 'Pedido no encontrado' })
        return
    }

    if (!esTransicionValida(pedido.estado, estado as EstadoPedido)) {
        res.status(400).json({
            message: `Transición inválida: no se puede pasar de ${pedido.estado} a ${estado}`
        })
        return
    }

    const pedidoActualizado = await prisma.pedido.update({
        where: { id: Number(id) },
        data: { estado: estado as EstadoPedido },
        include: { cliente: true }
    })

    // Regla de negocio: NO_RETIRADO → crear observación automática
    if (estado === 'NO_RETIRADO') {
        await prisma.observacion.create({
            data: {
                clienteId: pedido.clienteId,
                tipo: 'NO_RETIRO',
                descripcion: `Pedido #${pedido.id} no fue retirado. Entrega programada: ${pedido.fechaEntrega.toLocaleDateString('es-PE')}`,
                autoGenerada: true
            }
        })
    }

    res.json(pedidoActualizado)
}

// POST /clientes/:id/observaciones  — este va en clientes, pero lo dejamos aquí por ahora
export const getIngresos = async (req: Request, res: Response) => {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
        return res.status(400).json({ error: "Parámetros 'desde' y 'hasta' requeridos (YYYY-MM-DD)" });
    }

    const fechaDesde = new Date(`${desde}T00:00:00`);
    const fechaHasta = new Date(`${hasta}T23:59:59`);

    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
        return res.status(400).json({ error: "Formato de fecha inválido" });
    }

    const pedidos = await prisma.pedido.findMany({
        where: {
            estado: "ENTREGADO",
            actualizadoEn: {
                gte: fechaDesde,
                lte: fechaHasta,
            },
        },
        include: { cliente: true },
        orderBy: { actualizadoEn: "desc" },
    });

    const total = pedidos.reduce((sum, p) => sum + p.precio.toNumber(), 0);

    return res.json({
        desde: fechaDesde.toISOString().split("T")[0],
        hasta: fechaHasta.toISOString().split("T")[0],
        cantidad: pedidos.length,
        total,
        pedidos,
    });
};