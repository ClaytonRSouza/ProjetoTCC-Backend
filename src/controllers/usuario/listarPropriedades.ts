import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";

export const listarPropriedades = async (
    request: AuthenticatedRequest,
    reply: FastifyReply
) => {
    try {
        // Verifica se o usuário esta autenticado
        if (!request.usuarioId) {
            return reply.code(401).send({ error: "Usuário não autenticado corretamente." });
        }

        // Busca as propriedades do usuário
        const propriedades = await prisma.propriedade.findMany({
            where: {
                usuarioId: request.usuarioId,
            },
            select: {
                id: true,
                nome: true,
            },
        });

        return reply.code(200).send({ propriedades });
    } catch (error) {
        console.error("Erro ao listar propriedades do usuário:", error);
        return reply.code(500).send({ error: "Erro interno do servidor." });
    }
};
