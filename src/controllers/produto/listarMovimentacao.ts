import { RequestHandler } from "express";
import { prisma } from "../../config/database";

export const listarMovimentacao: RequestHandler = async (req, res) => {
    try {
        const movimentacao = await prisma.movimentacao.findMany({
            include: {
                estoque: {
                    include: {
                        produto: {
                            select: {
                                nome: true,
                                embalagem: true,
                            }
                        }
                    }
                }
            },
            orderBy: { data: "desc" },
        });

        res.status(200).json(movimentacao.map(mov => ({
            id: mov.id,
            estoqueId: mov.estoqueId,
            tipo: mov.tipo,
            quantidade: mov.quantidade,
            produtoStatus: mov.produtoStatus,
            data: mov.data,
            produto: mov.estoque?.produto || null,
        })));

    } catch (error) {
        console.error("Erro ao listar movimentações: ", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}