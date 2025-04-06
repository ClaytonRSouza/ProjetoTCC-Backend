-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Embalagem" ADD VALUE 'PACOTE_1KG';
ALTER TYPE "Embalagem" ADD VALUE 'PACOTE_5KG';
ALTER TYPE "Embalagem" ADD VALUE 'PACOTE_10KG';
ALTER TYPE "Embalagem" ADD VALUE 'PACOTE_15KG';
ALTER TYPE "Embalagem" ADD VALUE 'PACOTE_500G';
