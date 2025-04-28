import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProdutoRelatorio {
    nome: string;
    quantidade: number;
    embalagem: string;
    validade: string;
}

export const relatorioVencimento = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const dataAtual = new Date();
        const dataLimite = addMonths(dataAtual, 6);

        const produtos = await prisma.produto.findMany({
            where: {
                validade: {
                    lte: dataLimite,
                    gte: dataAtual,
                },
            },
            include: {
                estoque: {
                    include: {
                        propriedade: true,
                    },
                },
            },
        });

        const relatorioFormatado: Record<string, ProdutoRelatorio[]> = {};

        produtos.forEach((produto) => {
            produto.estoque.forEach((estoque) => {
                const nomePropriedade = estoque.propriedade?.nome || "N/A";

                if (!relatorioFormatado[nomePropriedade]) {
                    relatorioFormatado[nomePropriedade] = [];
                }

                relatorioFormatado[nomePropriedade].push({
                    nome: produto.nome,
                    quantidade: estoque.quantidade,
                    embalagem: produto.embalagem,
                    validade: format(produto.validade, "dd/MM/yyyy", { locale: ptBR }),
                });
            });
        });

        reply.status(200).send({ relatorio: relatorioFormatado });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
            reply.status(500).send({ error: error.message });
        } else {
            console.error(error);
            reply.status(500).send({ error: "Erro interno do servidor" });
        }
    }

};
