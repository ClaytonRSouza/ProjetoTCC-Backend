import { RequestHandler } from "express";
import { prisma } from "../../config/database";

export const desativarProduto: RequestHandler = async (req, res) => {
    try {
        const movimentacaoId = Number(req.params.id);

        // Verifica se a movimentação existe
        const movimentacaoExistente = await prisma.movimentacao.findUnique({
            where: { id: movimentacaoId }
        });

        if (!movimentacaoExistente) {
            res.status(404).json({ error: "Movimentação não encontrada" });
            return;
        }

        // Atualiza o status da movimentação para DESATIVADO
        const movimentacaoAtualizada = await prisma.movimentacao.update({
            where: { id: movimentacaoId },
            data: { produtoStatus: "DESATIVADO" }
        });

        res.status(200).json({
            message: "Produto desativado com sucesso",
            movimentacao: movimentacaoAtualizada
        });
        return;

    } catch (error) {
        console.error("Erro ao desativar produto:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};
