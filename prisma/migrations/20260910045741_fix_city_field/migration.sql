-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "city" TEXT DEFAULT 'Medellin',
ALTER COLUMN "address" DROP DEFAULT;
