import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";

export const buscarPerfil = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: request.usuarioId },
        });

        if (!usuario) {
            return reply.status(404).send({ error: "Usuário não encontrado." });
        }

        return reply.send({ usuario: { nome: usuario.nome, email: usuario.email } });
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return reply.status(500).send({ error: "Erro interno do servidor." });
    }
};
