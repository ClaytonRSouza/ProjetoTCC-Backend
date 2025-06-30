import { z } from "zod";

export const produtoDto = z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(50, "Nome do produto deve ter no máximo 50 caracteres"),
    quantidade: z.number().int().positive("Quantidade deve ser um número positivo").max(10000, "Quantidade deve ser no máximo 10.000"),
    validade: z.string().trim().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data de validade deve estar no formato DD/MM/AAAA"),
    embalagem: z.enum(["SACARIA", "BAG_1TN", "BAG_750KG", "LITRO", "GALAO_2L", "GALAO_5L", "GALAO_10L", "BALDE_20L", "TAMBOR_200L", "IBC_1000L", "PACOTE_1KG", "PACOTE_5KG", "PACOTE_10KG", "PACOTE_15KG", "PACOTE_500G", "OUTROS"]),
    propriedadeId: z.number().int().positive("PropriedadeId deve ser um número positivo"),
})
