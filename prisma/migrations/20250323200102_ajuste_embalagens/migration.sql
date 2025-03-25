/*
  Warnings:

  - You are about to drop the column `categoria` on the `Produto` table. All the data in the column will be lost.
  - Added the required column `embalagem` to the `Produto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Embalagem" AS ENUM ('SACARIA', 'BAG_1TN', 'BAG_750KG', 'LITRO', 'GALAO_2L', 'GALAO_5L', 'GALAO_10L', 'BALDE_20L', 'TAMBOR_200L', 'IBC_1000L', 'OUTROS');

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "categoria",
ADD COLUMN     "embalagem" "Embalagem" NOT NULL;
