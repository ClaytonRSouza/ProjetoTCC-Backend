import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MovimentacaoRelatorio {
    tipo: string;
    quantidade: number;
    data: string;
    produtoNome: string;
    propriedadeNome: string;
}

export const relatorioMovimentacoes = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const { tipo } = request.query as { tipo?: "ENTRADA" | "SAIDA" };

        const movimentacoes = await prisma.movimentacao.findMany({
            where: {
                ...(tipo ? { tipo } : {}),
                estoque: {
                    propriedade: {
                        usuarioId: request.usuarioId,
                    },
                },
            },
            include: {
                estoque: {
                    include: {
                        produto: true,
                        propriedade: true,
                    },
                },
            },
            orderBy: {
                data: "desc",
            },
        });

        const relatorio: MovimentacaoRelatorio[] = movimentacoes.map((movimentacao) => ({
            tipo: movimentacao.tipo,
            quantidade: movimentacao.quantidade,
            data: format(movimentacao.data, "dd/MM/yyyy", { locale: ptBR }),
            produtoId: movimentacao.estoque?.produto?.id || "Produto não encontrado",
            produtoNome: movimentacao.estoque?.produto?.nome || "Produto não encontrado",
            propriedadeNome: movimentacao.estoque?.propriedade?.nome || "Propriedade não encontrada",
            movimentacaoId: movimentacao.id,
            justificativa: movimentacao.justificativa || "Nenhuma justificativa",
        }));

        return reply.code(200).send({ relatorio });
    } catch (error: unknown) {
        console.error("Erro ao gerar relatório de movimentações:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
