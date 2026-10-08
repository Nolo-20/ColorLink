-- CreateTable
CREATE TABLE "orden" (
    "orden_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'creado',
    "metodo_entrega" TEXT NOT NULL,
    "direccion_entrega" TEXT,
    "qr_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_pkey" PRIMARY KEY ("orden_id")
);

-- CreateTable
CREATE TABLE "orden_item" (
    "orden_item_id" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "orden_item_pkey" PRIMARY KEY ("orden_item_id")
);

-- CreateTable
CREATE TABLE "estado_orden_historial" (
    "id" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "comentario" TEXT,
    "usuario_id" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_orden_historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orden_qr_token_key" ON "orden"("qr_token");

-- AddForeignKey
ALTER TABLE "orden" ADD CONSTRAINT "orden_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_item" ADD CONSTRAINT "orden_item_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "orden"("orden_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_item" ADD CONSTRAINT "orden_item_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estado_orden_historial" ADD CONSTRAINT "estado_orden_historial_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "orden"("orden_id") ON DELETE RESTRICT ON UPDATE CASCADE;
