import { RequestHandler } from "express";
import { prisma } from "../../config/database";

export const listarProdutos: RequestHandler = async (req, res) => {
    try {
        const { propriedadeId } = req.query;

        if (!propriedadeId) {
            res.status(400).json({ error: "PropriedadeId não informado" });
            return;
        }

        const produtos = await prisma.estoque.findMany({
            where: { propriedadeId: Number(propriedadeId) },
            include: { produto: true }
        });

        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro ao listar produtos: ", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}