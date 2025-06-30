import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProdutoRelatorio {
    nome: string;
    quantidade: number;
    validade: string;
    embalagem: string;
}

export const relatorioEstoqueGeral = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const { propriedadeId } = request.query as { propriedadeId?: string };

        //consulta os produtos com estoque e agrupa por propriedade
        const produtos = await prisma.produto.findMany({
            include: {
                estoque: {
                    where: {
                        quantidade: {
                            gt: 0,
                        },
                        ...(propriedadeId ? { propriedadeId: Number(propriedadeId) } : {}),
                        propriedade: {
                            usuarioId: request.usuarioId,
                        },
                    },
                    include: {
                        propriedade: true,
                    },
                },
            },
        });

        const relatorioPorPropriedade: Record<string, ProdutoRelatorio[]> = {};
        //cria um objeto com os produtos agrupados por propriedade
        produtos.forEach((produto) => {
            produto.estoque.forEach((estoque) => {
                if (!estoque.propriedade) return;

                const nomePropriedade = estoque.propriedade.nome;

                const produtoFormatado: ProdutoRelatorio = {
                    nome: produto.nome,
                    quantidade: estoque.quantidade,
                    validade: format(produto.validade, "dd/MM/yyyy", { locale: ptBR }),
                    embalagem: produto.embalagem,
                };

                if (!relatorioPorPropriedade[nomePropriedade]) {
                    relatorioPorPropriedade[nomePropriedade] = [];
                }

                relatorioPorPropriedade[nomePropriedade].push(produtoFormatado);
            });
        });

        return reply.code(200).send({ relatorio: relatorioPorPropriedade });
    } catch (error: unknown) {
        console.error("Erro ao gerar relatório geral de estoque:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
