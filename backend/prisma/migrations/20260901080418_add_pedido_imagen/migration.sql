-- CreateTable
CREATE TABLE "PedidoImagen" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoImagen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PedidoImagen" ADD CONSTRAINT "PedidoImagen_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
