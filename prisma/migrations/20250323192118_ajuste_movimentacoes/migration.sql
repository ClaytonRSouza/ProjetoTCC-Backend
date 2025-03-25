-- AlterTable
ALTER TABLE "Movimentacao" ADD COLUMN     "justificativa" TEXT,
ADD COLUMN     "produtoStatus" TEXT NOT NULL DEFAULT 'ativo';
