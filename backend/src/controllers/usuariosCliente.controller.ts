import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// GET /usuarios-cliente/buscar?email=... — solo cuentas públicas sin vincular
// (clienteId = null), para que admin encuentre a cuál asociar un Cliente.
export async function buscarUsuariosCliente(req: Request, res: Response) {
    const { email } = req.query

    if (!email || typeof email !== 'string' || !email.trim()) {
        res.status(400).json({ message: 'email es requerido' })
        return
    }

    const usuarios = await prisma.usuarioCliente.findMany({
        where: {
            clienteId: null,
            email: { contains: email.trim(), mode: 'insensitive' }
        },
        select: { id: true, email: true, nombre: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    res.json(usuarios)
}
