import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";

export const listarProdutos = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const { propriedadeId } = request.query as { propriedadeId?: string };

        if (!propriedadeId) {
            return reply.code(400).send({ error: "PropriedadeId não informado" });
        }

        const produtos = await prisma.estoque.findMany({
            where: { propriedadeId: Number(propriedadeId) },
            include: { produto: true }
        });

        return reply.code(200).send(produtos);
    } catch (error: unknown) {
        console.error("Erro ao listar produtos:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
