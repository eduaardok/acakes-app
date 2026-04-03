import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@pasteleria.com";
    const password = "admin"; // cámbialo después

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: { email, passwordHash },
    });

    console.log("Usuario creado:", usuario.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());