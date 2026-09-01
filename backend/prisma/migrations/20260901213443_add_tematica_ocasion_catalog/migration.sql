/*
  Warnings:

  - You are about to drop the column `ocasion` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `tematica` on the `Producto` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Producto_tematica_ocasion_idx";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "ocasion",
DROP COLUMN "tematica",
ADD COLUMN     "ocasionId" TEXT,
ADD COLUMN     "tematicaId" TEXT;

-- CreateTable
CREATE TABLE "Tematica" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tematica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ocasion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ocasion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tematica_nombre_key" ON "Tematica"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Ocasion_nombre_key" ON "Ocasion"("nombre");

-- CreateIndex
CREATE INDEX "Producto_tematicaId_ocasionId_idx" ON "Producto"("tematicaId", "ocasionId");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_tematicaId_fkey" FOREIGN KEY ("tematicaId") REFERENCES "Tematica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_ocasionId_fkey" FOREIGN KEY ("ocasionId") REFERENCES "Ocasion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
