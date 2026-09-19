import { PrismaClient, RolUsuario } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Parametrizable por entorno para poder sembrar también un SYSTEM_ADMIN:
//   SEED_ROLE=SYSTEM_ADMIN SEED_EMAIL=sysadmin@pasteleria.com npm run seed
// Sin variables, el comportamiento es el de siempre: el admin de negocio.
const ROL_PEDIDO = process.env.SEED_ROLE;

async function main() {
    const email = process.env.SEED_EMAIL ?? "admin@pasteleria.com";
    const password = process.env.SEED_PASSWORD ?? "admin"; // cámbialo después

    if (ROL_PEDIDO && !(ROL_PEDIDO in RolUsuario)) {
        throw new Error(
            `SEED_ROLE inválido: "${ROL_PEDIDO}". Valores: ${Object.keys(RolUsuario).join(", ")}`
        );
    }
    const role = (ROL_PEDIDO as RolUsuario | undefined) ?? RolUsuario.ADMIN;

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.upsert({
        where: { email },
        // Solo reescribimos el rol si se pidió explícitamente: correr el seed
        // sin SEED_ROLE no debe degradar a ADMIN un SYSTEM_ADMIN existente.
        update: ROL_PEDIDO ? { role } : {},
        create: { email, passwordHash, role },
    });

    console.log("Usuario creado:", usuario.email, "-", usuario.role);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
