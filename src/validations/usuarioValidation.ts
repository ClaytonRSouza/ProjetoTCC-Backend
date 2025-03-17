import { usuarioDto } from "../dtos/usuarioDto";

// Chama o DTO para validar os dados do usuario
export const validarUsuario = (dados: unknown) => {
    return usuarioDto.parse(dados);
}