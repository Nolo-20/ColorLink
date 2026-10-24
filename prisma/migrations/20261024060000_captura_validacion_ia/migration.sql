-- Captura inteligente: todos los campos del formulario quedan en el proyecto
ALTER TABLE "proyecto" ADD COLUMN "ciudad_id" INTEGER;
ALTER TABLE "proyecto" ADD COLUMN "tipo_proyecto" TEXT;
ALTER TABLE "proyecto" ADD COLUMN "condiciones" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "proyecto" ADD COLUMN "fecha_requerida" DATE;
ALTER TABLE "proyecto" ADD COLUMN "descripcion" TEXT;
ALTER TABLE "proyecto" ADD COLUMN "consentimiento_datos" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "proyecto" ADD COLUMN "consentimiento_fecha" TIMESTAMP(3);
ALTER TABLE "proyecto" ADD COLUMN "validacion_captura" JSONB;

ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_ciudad_id_fkey"
  FOREIGN KEY ("ciudad_id") REFERENCES "ciudad"("ciudad_id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "proyecto_usuario_id_idx" ON "proyecto"("usuario_id");

-- Proyectos existentes: la ciudad era la de la empresa del cliente
UPDATE "proyecto" p SET "ciudad_id" = e."ciudad_id"
FROM "empresa_cliente" e
WHERE e."empresa_id" = p."empresa_id" AND p."ciudad_id" IS NULL;

-- Clasificación con IA: se guarda la respuesta completa
ALTER TABLE "diagnostico_ia" ADD COLUMN "categoria" TEXT;
ALTER TABLE "diagnostico_ia" ADD COLUMN "complejidad" TEXT;
ALTER TABLE "diagnostico_ia" ADD COLUMN "texto_extraido" TEXT;
ALTER TABLE "diagnostico_ia" ADD COLUMN "imagen_coherente" BOOLEAN;
ALTER TABLE "diagnostico_ia" ADD COLUMN "imagen_observacion" TEXT;
ALTER TABLE "diagnostico_ia" ADD COLUMN "modelo_ia" TEXT;
ALTER TABLE "diagnostico_ia" ADD COLUMN "resultado_ia" JSONB;
ALTER TABLE "diagnostico_ia" ADD COLUMN "fecha_clasificacion" TIMESTAMP(3);
