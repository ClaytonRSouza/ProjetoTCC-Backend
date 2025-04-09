import { RequestHandler } from "express";
import { prisma } from "../../config/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProdutoRelatorio {
    nome: string;
    quantidade: number;
    validade: string;
    embalagem: string;
}

export const relatorioEstoqueGeral: RequestHandler = async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            include: {
                estoque: {
                    include: {
                        propriedade: true,
                    },
                },
            },
        });

        const relatorioPorPropriedade: Record<string, ProdutoRelatorio[]> = {};

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

        res.status(200).json({ relatorio: relatorioPorPropriedade });
    } catch (error) {
        console.error("Erro ao gerar relatório geral de estoque:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};
