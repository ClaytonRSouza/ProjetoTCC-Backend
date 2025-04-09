import { RequestHandler } from "express";
import { prisma } from "../../config/database";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProdutoRelatorio {
    nome: string;
    quantidade: number;
    embalagem: string;
    validade: string;
}

export const relatorioVencimento: RequestHandler = async (req, res) => {
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

        res.status(200).json({ relatorio: relatorioFormatado });
    } catch (error) {
        console.error("Erro ao buscar produtos com vencimento próximo:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};
