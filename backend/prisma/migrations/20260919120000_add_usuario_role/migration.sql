-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'SYSTEM_ADMIN');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "role" "RolUsuario" NOT NULL DEFAULT 'ADMIN';

