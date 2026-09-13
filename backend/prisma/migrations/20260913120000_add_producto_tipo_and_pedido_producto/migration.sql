-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('PASTEL', 'CUPCAKE', 'OTRO');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "productoId" INTEGER;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "tipo" "TipoProducto" NOT NULL DEFAULT 'PASTEL';

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
