-- AlterTable
ALTER TABLE "diagnostico_ia" ADD COLUMN     "aprobado_calidad" BOOLEAN,
ADD COLUMN     "fecha_veredicto" TIMESTAMP(3),
ADD COLUMN     "humedad_relativa" DOUBLE PRECISION,
ADD COLUMN     "notas_perito" TEXT,
ADD COLUMN     "perito_nombre" TEXT,
ADD COLUMN     "severidad_fisuras" TEXT;

-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "descuento_asesor_pct" DOUBLE PRECISION,
ADD COLUMN     "observaciones_asesor" TEXT;
