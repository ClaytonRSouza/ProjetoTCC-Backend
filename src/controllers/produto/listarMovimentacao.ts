import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const listarMovimentacao = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const { tipo, propriedadeId, dataInicio, dataFim, ordenacao } = request.query as {
            tipo?: string;
            propriedadeId?: string;
            dataInicio?: string;
            dataFim?: string;
            ordenacao?: "asc" | "desc";
        };

        if (!request.usuarioId) {
            return reply.code(401).send({ error: "Usuário não autenticado corretamente." });
        }

        // Construção dos filtros
        const filtros: Prisma.MovimentacaoWhereInput = {
            estoque: {
                propriedade: {
                    usuarioId: request.usuarioId,
                    ...(propriedadeId ? { id: Number(propriedadeId) } : {}),
                },
            },
        };

        if (tipo && (tipo === "ENTRADA" || tipo === "SAIDA" || tipo === "DESATIVACAO")) {
            filtros.tipo = tipo;
        }

        if (dataInicio || dataFim) {
            filtros.data = {};
            if (dataInicio) filtros.data.gte = new Date(dataInicio);
            if (dataFim) filtros.data.lte = new Date(dataFim);
        }

        const orderBy: Prisma.MovimentacaoOrderByWithRelationInput = {
            data: ordenacao === "asc" || ordenacao === "desc" ? ordenacao : "desc",
        };

        const movimentacoes = await prisma.movimentacao.findMany({
            where: filtros,
            orderBy,
            include: {
                estoque: {
                    include: {
                        produto: true,
                        propriedade: true,
                    },
                },
            },
        });

        return reply.code(200).send(movimentacoes);
    } catch (error: unknown) {
        console.error("Erro ao listar movimentações:", error);

        if (error instanceof ZodError) {
            return reply.code(400).send({ error: "Dados inválidos", details: error.errors });
        }

        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
