/*
  Warnings:

  - You are about to drop the column `dataMovimentacao` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `produtoId` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `propriedadeId` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Produto` table. All the data in the column will be lost.
  - Added the required column `estoqueId` to the `Movimentacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Movimentacao" DROP CONSTRAINT "Movimentacao_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_propriedadeId_fkey";

-- AlterTable
ALTER TABLE "Movimentacao" DROP COLUMN "dataMovimentacao",
DROP COLUMN "produtoId",
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estoqueId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "propriedadeId",
DROP COLUMN "quantidade";

-- CreateTable
CREATE TABLE "Estoque" (
    "id" SERIAL NOT NULL,
    "propriedadeId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "Propriedade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
