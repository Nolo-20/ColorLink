-- Nuevo rol operativo para logística y entregas
INSERT INTO "rol" ("rol") VALUES ('despachos') ON CONFLICT ("rol") DO NOTHING;

-- Permite desactivar empleados sin borrar su historial
ALTER TABLE "usuario" ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;

-- Motivo por el que el asesor pide al cliente cambiar la imagen del proyecto
ALTER TABLE "proyecto" ADD COLUMN "observacion_imagen" TEXT;

-- Trazabilidad de proyectos
CREATE TABLE "estado_proyecto_historial" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "estado_anterior" TEXT,
    "estado_nuevo" TEXT NOT NULL,
    "comentario" TEXT,
    "usuario_id" TEXT,
    "usuario_nombre" TEXT,
    "rol_nombre" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_proyecto_historial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "estado_proyecto_historial_proyecto_id_idx" ON "estado_proyecto_historial"("proyecto_id");

ALTER TABLE "estado_proyecto_historial" ADD CONSTRAINT "estado_proyecto_historial_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("proyecto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Despacho de proyectos a obra
CREATE TABLE "despacho_proyecto" (
    "despacho_id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "numero_guia" TEXT NOT NULL,
    "transportador" TEXT,
    "placa_vehiculo" TEXT,
    "conductor_nombre" TEXT,
    "conductor_telefono" TEXT,
    "bodega_origen" TEXT,
    "direccion_entrega" TEXT,
    "ciudad_entrega" TEXT,
    "tiempo_estimado_horas" INTEGER,
    "hora_salida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recibido_por" TEXT,
    "documento_recibe" TEXT,
    "fecha_entrega" TIMESTAMP(3),
    "despachado_por_id" TEXT,

    CONSTRAINT "despacho_proyecto_pkey" PRIMARY KEY ("despacho_id")
);

CREATE UNIQUE INDEX "despacho_proyecto_proyecto_id_key" ON "despacho_proyecto"("proyecto_id");

ALTER TABLE "despacho_proyecto" ADD CONSTRAINT "despacho_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("proyecto_id") ON DELETE CASCADE ON UPDATE CASCADE;
