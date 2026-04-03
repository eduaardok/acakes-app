import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

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