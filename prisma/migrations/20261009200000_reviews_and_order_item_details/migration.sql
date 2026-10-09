-- Presentación y color de cada producto comprado (antes se perdían al crear la orden)
ALTER TABLE "orden_item" ADD COLUMN "presentacion" TEXT;
ALTER TABLE "orden_item" ADD COLUMN "color" TEXT;

-- Opiniones de producto: solo de compras entregadas, una por producto comprado
CREATE TABLE "resena_producto" (
    "resena_id" TEXT NOT NULL,
    "producto_key" TEXT NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "orden_item_id" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "foto_data_uri" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resena_producto_pkey" PRIMARY KEY ("resena_id")
);

CREATE UNIQUE INDEX "resena_producto_orden_item_id_key" ON "resena_producto"("orden_item_id");
CREATE INDEX "resena_producto_producto_key_created_at_idx" ON "resena_producto"("producto_key", "created_at");

ALTER TABLE "resena_producto" ADD CONSTRAINT "resena_producto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resena_producto" ADD CONSTRAINT "resena_producto_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "orden"("orden_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resena_producto" ADD CONSTRAINT "resena_producto_orden_item_id_fkey" FOREIGN KEY ("orden_item_id") REFERENCES "orden_item"("orden_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Evaluación del vendedor (servicio de ColorLink) por pedido entregado
CREATE TABLE "evaluacion_vendedor" (
    "evaluacion_id" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluacion_vendedor_pkey" PRIMARY KEY ("evaluacion_id")
);

CREATE UNIQUE INDEX "evaluacion_vendedor_orden_id_key" ON "evaluacion_vendedor"("orden_id");

ALTER TABLE "evaluacion_vendedor" ADD CONSTRAINT "evaluacion_vendedor_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "orden"("orden_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluacion_vendedor" ADD CONSTRAINT "evaluacion_vendedor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
