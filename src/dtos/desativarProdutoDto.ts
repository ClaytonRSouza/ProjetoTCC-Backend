import { z } from "zod";

export const desativarProdutoDto = z.object({
    justificativa: z.string().min(15, "A justificativa é obrigatória e deve ter pelo menos 15 caracteres"),
});