/*
  Warnings:

  - Added the required column `nombre_producto` to the `orden_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orden_item" DROP CONSTRAINT "orden_item_producto_id_fkey";

-- AlterTable
ALTER TABLE "orden_item" ADD COLUMN     "nombre_producto" TEXT NOT NULL,
ALTER COLUMN "producto_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orden_item" ADD CONSTRAINT "orden_item_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE SET NULL ON UPDATE CASCADE;
