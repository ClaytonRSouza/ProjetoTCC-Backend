import { z } from "zod";

export const saidaProdutoDto = z.object({
    produtoId: z.number().int().positive("ProdutoId deve ser um número positivo"),
    propriedadeId: z.number().int().positive("PropriedadeId deve ser um número positivo"),
    quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
});