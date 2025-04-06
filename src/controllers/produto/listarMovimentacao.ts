import { RequestHandler } from "express";
import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

export const listarMovimentacao: RequestHandler = async (req, res) => {
    try {
        const { tipo, propriedadeId, dataInicio, dataFim, ordenacao } = req.query;

        // Construção dos filtros
        const filtros: Prisma.MovimentacaoWhereInput = {};

        if (tipo && (tipo === "ENTRADA" || tipo === "SAIDA")) {
            filtros.tipo = tipo;
        }

        if (propriedadeId) {
            filtros.estoque = { propriedadeId: Number(propriedadeId) };
        }

        if (dataInicio || dataFim) {
            filtros.data = {};
            if (dataInicio) filtros.data.gte = new Date(dataInicio as string);
            if (dataFim) filtros.data.lte = new Date(dataFim as string);
        }

        // Correção da ordenação
        const orderBy: Prisma.MovimentacaoOrderByWithRelationInput = {
            data: ordenacao === "asc" || ordenacao === "desc" ? ordenacao : "desc",
        };

        const movimentacao = await prisma.movimentacao.findMany({
            where: filtros,
            orderBy, // Agora correto!
            include: {
                estoque: {
                    include: {
                        produto: true,
                        propriedade: true,
                    },
                },
            },
        });

        res.status(200).json(movimentacao);
    } catch (error) {
        console.error("Erro ao listar movimentações: ", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};
