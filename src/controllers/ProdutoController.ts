import { Request, Response } from "express";
import { prisma } from "../config/database";

export class ProdutoController {
    static async listarProdutos(req: Request, res: Response) {
        try {
            const produtos = await prisma.produto.findMany({
                include: {
                    propriedade: true,
                },
            });
            res.json(produtos);
        } catch (error) {
            res.status(500).json({ error: "Erro ao encontrar produtos" });
        }
    }
}