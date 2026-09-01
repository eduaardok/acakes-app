-- CreateTable
CREATE TABLE "ProductoTematica" (
    "productoId" INTEGER NOT NULL,
    "tematicaId" TEXT NOT NULL,

    CONSTRAINT "ProductoTematica_pkey" PRIMARY KEY ("productoId","tematicaId")
);

-- CreateTable
CREATE TABLE "ProductoOcasion" (
    "productoId" INTEGER NOT NULL,
    "ocasionId" TEXT NOT NULL,

    CONSTRAINT "ProductoOcasion_pkey" PRIMARY KEY ("productoId","ocasionId")
);

-- CreateIndex
CREATE INDEX "ProductoTematica_tematicaId_idx" ON "ProductoTematica"("tematicaId");

-- CreateIndex
CREATE INDEX "ProductoOcasion_ocasionId_idx" ON "ProductoOcasion"("ocasionId");

-- AddForeignKey
ALTER TABLE "ProductoTematica" ADD CONSTRAINT "ProductoTematica_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoTematica" ADD CONSTRAINT "ProductoTematica_tematicaId_fkey" FOREIGN KEY ("tematicaId") REFERENCES "Tematica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoOcasion" ADD CONSTRAINT "ProductoOcasion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoOcasion" ADD CONSTRAINT "ProductoOcasion_ocasionId_fkey" FOREIGN KEY ("ocasionId") REFERENCES "Ocasion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: copia tematicaId/ocasionId no-nulos de Producto (relacion 1-a-1
-- vieja) a las tablas puente ANTES de dropear esas columnas. Al momento de
-- escribir esta migracion solo el producto id=7 ("Pastel Bananero") tiene
-- ambos campos poblados.
INSERT INTO "ProductoTematica" ("productoId", "tematicaId")
SELECT "id", "tematicaId" FROM "Producto" WHERE "tematicaId" IS NOT NULL;

INSERT INTO "ProductoOcasion" ("productoId", "ocasionId")
SELECT "id", "ocasionId" FROM "Producto" WHERE "ocasionId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_ocasionId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_tematicaId_fkey";

-- DropIndex
DROP INDEX "Producto_tematicaId_ocasionId_idx";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "ocasionId",
DROP COLUMN "tematicaId";
