-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "asesor_asignado_id" TEXT,
ADD COLUMN     "perito_asignado_id" TEXT;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_asesor_asignado_id_fkey" FOREIGN KEY ("asesor_asignado_id") REFERENCES "usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_perito_asignado_id_fkey" FOREIGN KEY ("perito_asignado_id") REFERENCES "usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;
