import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { EstadoPedido } from '@prisma/client'
import { esTransicionValida } from '../lib/transiciones'

const PAGE_SIZE_DEFAULT = 30
const PAGE_SIZE_MAX = 100

function getTzOffsetMinutes(req: Request): number | null {
    const raw = req.header('X-TZ-Offset-Minutes')
    if (!raw) return null
    const n = Number(raw)
    if (!Number.isFinite(n) || !Number.isInteger(n)) return null
    // Zona horaria válida en minutos: [-14:00, +14:00]
    if (n < -14 * 60 || n > 14 * 60) return null
    return n
}

function parseDateKey(key: unknown): { y: number; m: number; d: number } | null {
    if (typeof key !== 'string') return null
    const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return null
    const y = Number(m[1])
    const mo = Number(m[2])
    const d = Number(m[3])
    if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null
    if (mo < 1 || mo > 12) return null
    if (d < 1 || d > 31) return null
    return { y, m: mo, d }
}

function rangeForLocalDay(key: string, tzOffsetMinutes: number): { gte: Date; lte: Date } | null {
    const parts = parseDateKey(key)
    if (!parts) return null
    const { y, m, d } = parts
    // tzOffsetMinutes sigue la convención JS: minutos a sumar a local para obtener UTC.
    const baseUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0)
    const gteMs = baseUtcMs + tzOffsetMinutes * 60_000
    const lteMs = gteMs + (24 * 60 * 60 * 1000 - 1000) // 23:59:59 local
    return { gte: new Date(gteMs), lte: new Date(lteMs) }
}

// Estados que ya no cuentan como "pendientes" para el calendario de pedidos.
const ESTADOS_CERRADOS: EstadoPedido[] = ['ENTREGADO', 'CANCELADO', 'NO_RETIRADO']

// GET /pedidos?fecha=2024-01-15&estado=CONFIRMADO
// GET /pedidos?desde=2024-01-01&hasta=2024-01-31  (rango por fechaEntrega, inclusive)
// GET /pedidos?...&pendiente=true  (excluye ENTREGADO/CANCELADO/NO_RETIRADO — usado por el calendario)
// GET /pedidos  sin filtros de fecha → todos los pedidos
export async function getPedidos(req: Request, res: Response) {
    const { fecha, estado, desde, hasta, pendiente } = req.query

    if ((desde && !hasta) || (!desde && hasta)) {
        res.status(400).json({ message: 'desde y hasta deben enviarse juntos (YYYY-MM-DD)' })
        return
    }

    let rangoFecha: { gte: Date; lte: Date } | undefined
    const tzOffset = getTzOffsetMinutes(req)

    if (desde && hasta) {
        if (tzOffset !== null) {
            const r1 = rangeForLocalDay(String(desde), tzOffset)
            const r2 = rangeForLocalDay(String(hasta), tzOffset)
            if (!r1 || !r2) {
                res.status(400).json({ message: 'Formato desde/hasta inválido' })
                return
            }
            const gte = r1.gte
            const lte = r2.lte
            if (gte > lte) {
                res.status(400).json({ message: 'desde no puede ser mayor que hasta' })
                return
            }
            rangoFecha = { gte, lte }
        } else {
            const gte = new Date(`${desde}T00:00:00`)
            const lte = new Date(`${hasta}T23:59:59`)
            if (isNaN(gte.getTime()) || isNaN(lte.getTime())) {
                res.status(400).json({ message: 'Formato desde/hasta inválido' })
                return
            }
            if (gte > lte) {
                res.status(400).json({ message: 'desde no puede ser mayor que hasta' })
                return
            }
            rangoFecha = { gte, lte }
        }
    } else if (fecha) {
        if (tzOffset !== null) {
            const r = rangeForLocalDay(String(fecha), tzOffset)
            if (!r) {
                res.status(400).json({ message: 'Formato fecha inválido' })
                return
            }
            rangoFecha = r
        } else {
            rangoFecha = {
                gte: new Date(`${fecha}T00:00:00`),
                lte: new Date(`${fecha}T23:59:59`)
            }
        }
    }

    // Validación final por si el parseo "sin tz" produjo Invalid Date
    if (rangoFecha) {
        if (Number.isNaN(rangoFecha.gte.getTime()) || Number.isNaN(rangoFecha.lte.getTime())) {
            res.status(400).json({ message: 'Formato desde/hasta inválido' })
            return
        }
    }

    const where = {
        ...(estado
            ? { estado: estado as any }
            : pendiente === 'true'
                ? { estado: { notIn: ESTADOS_CERRADOS } }
                : {}),
        ...(rangoFecha ? { fechaEntrega: rangoFecha } : {})
    }

    // Sin filtro de fecha ("todos los pedidos"): la tabla crece sin cota
    // natural, así que se pagina. Con rango/día el resultado ya está acotado
    // por la fecha, así que se mantiene la respuesta como arreglo simple.
    if (!rangoFecha) {
        const page = Math.max(1, Number(req.query.page) || 1)
        const pageSize = Math.min(
            PAGE_SIZE_MAX,
            Math.max(1, Number(req.query.pageSize) || PAGE_SIZE_DEFAULT)
        )

        const [pedidos, total] = await Promise.all([
            prisma.pedido.findMany({
                where,
                include: { cliente: true },
                orderBy: { fechaEntrega: 'asc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.pedido.count({ where }),
        ])

        res.json({
            pedidos,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        })
        return
    }

    const pedidos = await prisma.pedido.findMany({
        where,
        include: { cliente: true },
        orderBy: { fechaEntrega: 'asc' }
    })

    res.json(pedidos)
}

// GET /pedidos/hoy
export async function getPedidosHoy(req: Request, res: Response) {
    const tzOffset = getTzOffsetMinutes(req)

    let inicio: Date
    let fin: Date

    if (tzOffset !== null) {
        // Calcula "hoy" en el calendario local del cliente, luego convierte a rango UTC.
        const localNowMs = Date.now() - tzOffset * 60_000
        const localNow = new Date(localNowMs)
        const y = localNow.getUTCFullYear()
        const m = localNow.getUTCMonth() + 1
        const d = localNow.getUTCDate()
        const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const r = rangeForLocalDay(key, tzOffset)
        // r no debería ser null porque key la construimos nosotros, pero igual protegemos.
        if (!r) {
            res.status(500).json({ message: 'No se pudo calcular el rango de hoy' })
            return
        }
        inicio = r.gte
        fin = r.lte
    } else {
        const hoy = new Date()
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
    }

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

// PATCH /pedidos/:id — corregir descripción, precio, fecha de entrega o notas (sin cambiar estado)
export async function updatePedido(req: Request, res: Response) {
    const { id } = req.params
    const { descripcion, precio, fechaEntrega, notas } = req.body

    const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } })
    if (!pedido) {
        res.status(404).json({ message: 'Pedido no encontrado' })
        return
    }

    const data: {
        descripcion?: string
        precio?: number
        fechaEntrega?: Date
        notas?: string | null
    } = {}

    if (descripcion !== undefined) {
        if (typeof descripcion !== 'string' || !descripcion.trim()) {
            res.status(400).json({ message: 'La descripción no puede estar vacía' })
            return
        }
        data.descripcion = descripcion.trim()
    }
    if (precio !== undefined) {
        const n = Number(precio)
        if (Number.isNaN(n) || n <= 0) {
            res.status(400).json({ message: 'Precio inválido' })
            return
        }
        data.precio = n
    }
    if (fechaEntrega !== undefined) {
        const d = new Date(fechaEntrega)
        if (Number.isNaN(d.getTime())) {
            res.status(400).json({ message: 'Fecha de entrega inválida' })
            return
        }
        data.fechaEntrega = d
    }
    if (notas !== undefined) {
        if (notas === null || notas === '') {
            data.notas = null
        } else if (typeof notas === 'string') {
            data.notas = notas.trim() || null
        } else {
            res.status(400).json({ message: 'Notas inválidas' })
            return
        }
    }

    if (Object.keys(data).length === 0) {
        res.status(400).json({ message: 'No hay datos para actualizar' })
        return
    }

    const actualizado = await prisma.pedido.update({
        where: { id: Number(id) },
        data,
        include: { cliente: true }
    })

    res.json(actualizado)
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
            // El ingreso se atribuye a la fecha programada del pedido, no al
            // momento en que se lo marcó como ENTREGADO (que puede ser mucho
            // después, ej. un pedido de hace 3 meses cerrado hoy).
            fechaEntrega: {
                gte: fechaDesde,
                lte: fechaHasta,
            },
        },
        include: { cliente: true },
        orderBy: { fechaEntrega: "desc" },
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