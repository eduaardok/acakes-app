import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const MIN_PASSWORD_LEN = 4

// POST /registro-cliente
export async function registroCliente(req: Request, res: Response) {
    const { email, password, nombre } = req.body as {
        email?: string
        password?: string
        nombre?: string
    }

    if (!email || !password || !nombre) {
        res.status(400).json({ error: 'email, password y nombre son requeridos' })
        return
    }

    if (password.length < MIN_PASSWORD_LEN) {
        res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres` })
        return
    }

    const existente = await prisma.usuarioCliente.findUnique({ where: { email } })
    if (existente) {
        res.status(409).json({ error: 'Ya existe una cuenta con ese email' })
        return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const usuario = await prisma.usuarioCliente.create({
        data: { email, passwordHash, nombre },
        select: { id: true, email: true, nombre: true, createdAt: true },
    })

    const token = jwt.sign(
        { usuarioId: usuario.id, email: usuario.email, role: 'cliente' },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    res.status(201).json({ token, usuario })
}

// POST /login-cliente
export async function loginCliente(req: Request, res: Response) {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
        res.status(400).json({ error: 'Email y contraseña requeridos' })
        return
    }

    const usuario = await prisma.usuarioCliente.findUnique({ where: { email } })
    if (!usuario) {
        res.status(401).json({ error: 'Credenciales incorrectas' })
        return
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash)
    if (!passwordValida) {
        res.status(401).json({ error: 'Credenciales incorrectas' })
        return
    }

    const token = jwt.sign(
        { usuarioId: usuario.id, email: usuario.email, role: 'cliente' },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    res.json({ token })
}
