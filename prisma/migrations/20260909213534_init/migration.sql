-- CreateTable
CREATE TABLE "rol" (
    "rol_id" SERIAL NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "ciudad" (
    "ciudad_id" SERIAL NOT NULL,
    "ciudad" TEXT NOT NULL,

    CONSTRAINT "ciudad_pkey" PRIMARY KEY ("ciudad_id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "usuario_id" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "auth_provider" TEXT NOT NULL DEFAULT 'credentials',
    "provider_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "otp_verification_codes" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "usuario_id" TEXT,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa_cliente" (
    "empresa_id" TEXT NOT NULL,
    "ciudad_id" INTEGER NOT NULL,
    "nit_cedula" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "direccion_despacho" TEXT NOT NULL,

    CONSTRAINT "empresa_cliente_pkey" PRIMARY KEY ("empresa_id")
);

-- CreateTable
CREATE TABLE "proyecto" (
    "proyecto_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre_proyecto" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "tipo_superficie" TEXT,
    "ambiente" TEXT,
    "acabado" TEXT,
    "color" TEXT,
    "color_hex" TEXT,
    "canal_origen" TEXT,
    "estado_pipeline" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("proyecto_id")
);

-- CreateTable
CREATE TABLE "diagnostico_ia" (
    "diagnostico_id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "patologia_detectada" TEXT,
    "severidad" TEXT,
    "sistema_recomendado" TEXT,
    "mano_recomendada" TEXT,
    "rendimiento_estimado" DOUBLE PRECISION,
    "confianza_ia_pct" DOUBLE PRECISION,
    "requiere_visita_humana" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "diagnostico_ia_pkey" PRIMARY KEY ("diagnostico_id")
);

-- CreateTable
CREATE TABLE "evidencia_foto" (
    "evidencia_id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "url_almacenado" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "tamano_mb" DOUBLE PRECISION,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencia_foto_pkey" PRIMARY KEY ("evidencia_id")
);

-- CreateTable
CREATE TABLE "producto" (
    "producto_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "presentacion" TEXT,
    "rendimiento_m2" DOUBLE PRECISION,
    "acabado" TEXT,
    "precio" DOUBLE PRECISION,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("producto_id")
);

-- CreateTable
CREATE TABLE "inventario_producto" (
    "inventario_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "ciudad_id" INTEGER NOT NULL,
    "nombre_bodega" TEXT,
    "numero_lote" TEXT,
    "cantidad_disponible" INTEGER,
    "fecha_tinturado" TIMESTAMP(3),
    "tiempo_despacho" INTEGER,

    CONSTRAINT "inventario_producto_pkey" PRIMARY KEY ("inventario_id")
);

-- CreateTable
CREATE TABLE "cotizacion" (
    "cotizacion_id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "diagnostico_id" TEXT,
    "galones_exactos" DOUBLE PRECISION,
    "cunetes_5g" INTEGER,
    "galones_1g" INTEGER,
    "subtotal" DOUBLE PRECISION,
    "iva" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "estado" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizacion_pkey" PRIMARY KEY ("cotizacion_id")
);

-- CreateTable
CREATE TABLE "cotizacion_item" (
    "citem_id" TEXT NOT NULL,
    "cotizacion_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION,
    "precio_unitario" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,

    CONSTRAINT "cotizacion_item_pkey" PRIMARY KEY ("citem_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_rol_key" ON "rol"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "otp_verification_codes_email_idx" ON "otp_verification_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostico_ia_proyecto_id_key" ON "diagnostico_ia"("proyecto_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verification_codes" ADD CONSTRAINT "otp_verification_codes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresa_cliente" ADD CONSTRAINT "empresa_cliente_ciudad_id_fkey" FOREIGN KEY ("ciudad_id") REFERENCES "ciudad"("ciudad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa_cliente"("empresa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico_ia" ADD CONSTRAINT "diagnostico_ia_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("proyecto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia_foto" ADD CONSTRAINT "evidencia_foto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("proyecto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_producto" ADD CONSTRAINT "inventario_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_producto" ADD CONSTRAINT "inventario_producto_ciudad_id_fkey" FOREIGN KEY ("ciudad_id") REFERENCES "ciudad"("ciudad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("proyecto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_item" ADD CONSTRAINT "cotizacion_item_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizacion"("cotizacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_item" ADD CONSTRAINT "cotizacion_item_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;
