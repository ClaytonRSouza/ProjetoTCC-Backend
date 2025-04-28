import { z } from "zod";

export const propriedadeDto = z.object({
    nome: z
        .string({
            required_error: "O nome da propriedade é obrigatório",
            invalid_type_error: "O nome deve ser uma string"
        })
        .min(3, "O nome da propriedade deve ter pelo menos 3 caracteres")
});