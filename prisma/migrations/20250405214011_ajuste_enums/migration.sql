/*
  Warnings:

  - Changed the type of `tipo` on the `Movimentacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Adiciona o novo enum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- Corrige os dados antigos para valores válidos (ajuste conforme sua realidade)
UPDATE "Movimentacao"
SET "tipo" = 'ENTRADA'
WHERE "tipo" IS NULL OR "tipo" NOT IN ('ENTRADA', 'SAIDA', 'AJUSTE');

-- Altera o tipo da coluna
ALTER TABLE "Movimentacao"
ALTER COLUMN "tipo" TYPE "TipoMovimentacao" USING "tipo"::"TipoMovimentacao";
