-- Hasta cuándo el usuario ya revisó sus notificaciones (la campana cuenta lo posterior)
ALTER TABLE "usuario" ADD COLUMN "notificaciones_vistas_at" TIMESTAMP(3);

-- Conversación entre el cliente y el equipo de ColorLink dentro de cada proyecto
CREATE TABLE "mensaje_proyecto" (
    "mensaje_id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "autor_id" TEXT,
    "autor_nombre" TEXT NOT NULL,
    "autor_rol" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "leido_cliente" BOOLEAN NOT NULL DEFAULT false,
    "leido_equipo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensaje_proyecto_pkey" PRIMARY KEY ("mensaje_id")
);

CREATE INDEX "mensaje_proyecto_proyecto_id_created_at_idx" ON "mensaje_proyecto"("proyecto_id", "created_at");

ALTER TABLE "mensaje_proyecto" ADD CONSTRAINT "mensaje_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("proyecto_id") ON DELETE CASCADE ON UPDATE CASCADE;
