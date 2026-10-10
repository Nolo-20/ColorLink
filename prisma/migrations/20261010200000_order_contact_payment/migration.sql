-- Datos de entrega y pago del pedido en columnas propias (antes iban dentro del texto de la dirección)
ALTER TABLE "orden" ADD COLUMN "destinatario" TEXT;
ALTER TABLE "orden" ADD COLUMN "telefono_contacto" TEXT;
ALTER TABLE "orden" ADD COLUMN "ciudad_entrega" TEXT;
ALTER TABLE "orden" ADD COLUMN "notas_entrega" TEXT;
ALTER TABLE "orden" ADD COLUMN "metodo_pago" TEXT;
ALTER TABLE "orden" ADD COLUMN "costo_envio" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "orden" ADD COLUMN "factura_razon_social" TEXT;
ALTER TABLE "orden" ADD COLUMN "factura_nit" TEXT;
