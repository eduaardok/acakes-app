import { Request, Response } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { enviarEmail } from '../lib/mailer'

const MIN_PASSWORD_LEN = 4
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora
const MENSAJE_OLVIDE_PASSWORD_GENERICO =
    'Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña.'

function hashResetToken(tokenPlano: string): string {
    return crypto.createHash('sha256').update(tokenPlano).digest('hex')
}

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

// POST /olvide-password — siempre responde el mismo mensaje genérico, exista
// o no el email, para no filtrar qué emails están registrados.
export async function olvidePassword(req: Request, res: Response) {
    const { email } = req.body as { email?: string }

    if (!email) {
        res.status(400).json({ error: 'Email requerido' })
        return
    }

    const usuario = await prisma.usuarioCliente.findUnique({ where: { email } })

    if (usuario) {
        const tokenPlano = crypto.randomBytes(32).toString('hex')

        await prisma.passwordResetToken.create({
            data: {
                usuarioId: usuario.id,
                token: hashResetToken(tokenPlano),
                expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
            },
        })

        const frontendUrl = process.env.FRONTEND_URL || 'https://ainoascakes.netlify.app'
        const resetUrl = `${frontendUrl}/restablecer-password?token=${tokenPlano}`

        try {
            await enviarEmail(
                usuario.email,
                'Restablece tu contraseña — Ainoa\'s Cakes',
                `
                    <p>Hola ${usuario.nombre},</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace es válido por 1 hora:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>Si no fuiste tú, puedes ignorar este email.</p>
                    <p>— Ainoa's Cakes</p>
                `
            )
        } catch (err) {
            console.error('[olvidePassword] error al enviar email:', err)
        }
    }

    res.json({ message: MENSAJE_OLVIDE_PASSWORD_GENERICO })
}

// POST /restablecer-password
export async function restablecerPassword(req: Request, res: Response) {
    const { token, nuevaPassword } = req.body as { token?: string; nuevaPassword?: string }

    if (!token || !nuevaPassword) {
        res.status(400).json({ error: 'Token y nueva contraseña son requeridos' })
        return
    }
    if (nuevaPassword.length < MIN_PASSWORD_LEN) {
        res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres` })
        return
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token: hashResetToken(token) },
    })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        res.status(400).json({ error: 'El enlace es inválido o expiró' })
        return
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10)

    await prisma.$transaction([
        prisma.usuarioCliente.update({
            where: { id: resetToken.usuarioId },
            data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: new Date() },
        }),
    ])

    res.json({ message: 'Contraseña actualizada correctamente' })
}
