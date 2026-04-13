import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const MIN_PASSWORD_LEN = 4;

export const getMe = async (req: Request, res: Response) => {
    const usuarioId = Number(req.usuario?.usuarioId);
    if (!usuarioId) {
        return res.status(401).json({ error: "No autorizado" });
    }

    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true, email: true, creadoEn: true },
    });

    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(usuario);
};

export const updateMe = async (req: Request, res: Response) => {
    const usuarioId = Number(req.usuario?.usuarioId);
    if (!usuarioId) {
        return res.status(401).json({ error: "No autorizado" });
    }

    const { nombreUsuario, passwordNueva, passwordActual } = req.body as {
        nombreUsuario?: string;
        passwordNueva?: string;
        passwordActual?: string;
    };

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const nuevoNombre =
        typeof nombreUsuario === "string" ? nombreUsuario.trim() : usuario.email;
    const quiereCambiarNombre = nuevoNombre !== usuario.email;
    const pwdNueva =
        typeof passwordNueva === "string" ? passwordNueva : "";
    const quiereCambiarPassword = pwdNueva.length > 0;

    if (!quiereCambiarNombre && !quiereCambiarPassword) {
        return res.status(400).json({ error: "No hay cambios para guardar" });
    }

    if (!passwordActual || typeof passwordActual !== "string") {
        return res.status(400).json({
            error: "Debes ingresar tu contraseña actual para guardar cambios",
        });
    }

    const passwordOk = await bcrypt.compare(passwordActual, usuario.passwordHash);
    if (!passwordOk) {
        return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    if (quiereCambiarPassword && pwdNueva.length < MIN_PASSWORD_LEN) {
        return res.status(400).json({
            error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres`,
        });
    }

    if (quiereCambiarNombre) {
        if (!nuevoNombre) {
            return res.status(400).json({ error: "El nombre de usuario no puede estar vacío" });
        }
        const enUso = await prisma.usuario.findFirst({
            where: { email: nuevoNombre, NOT: { id: usuarioId } },
        });
        if (enUso) {
            return res.status(400).json({ error: "Ese nombre de usuario ya está en uso" });
        }
    }

    const data: { email?: string; passwordHash?: string } = {};
    if (quiereCambiarNombre) data.email = nuevoNombre;
    if (quiereCambiarPassword) {
        data.passwordHash = await bcrypt.hash(pwdNueva, 10);
    }

    const actualizado = await prisma.usuario.update({
        where: { id: usuarioId },
        data,
        select: { id: true, email: true, creadoEn: true },
    });

    const token = jwt.sign(
        { usuarioId: actualizado.id, email: actualizado.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );

    return res.json({ token, usuario: actualizado });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
        { usuarioId: usuario.id, email: usuario.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }  // hardcodeado, sin la variable de entorno
    );

    return res.json({ token });
};