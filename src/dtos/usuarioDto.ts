import { z } from 'zod';


//Definição do schema da propriedade
export const propriedadeSchema = z.object({
    nome: z
        .string({
            required_error: "O nome da propriedade é obrigatório",
            invalid_type_error: "O nome deve ser uma string"
        })
        .min(3, "O nome da propriedade deve ter pelo menos 3 caracteres")
});


//Definição do schema do usuário
export const usuarioDto = z.object({
    nome: z.string().min(3, "O nome deve conter pelo menos 3 caracteres").max(255, "O nome deve conter no máximo 255 caracteres"),
    email: z.string().email("O email deve ser válido"),
    senha: z.string().min(6, "A senha deve conter pelo menos 6 caracteres"),
    propriedade: z.array(propriedadeSchema).min(1, "É necessário informar pelo menos uma propriedade"),
})