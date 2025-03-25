import { RequestHandler } from "express";
import { prisma } from "../../config/database";
import { saidaProdutoDto } from "../../dtos/saidaProdutoDto";

export const saidaProduto: RequestHandler = async (req, res) => {
    try {
        const dados = saidaProdutoDto.parse(req.body);

        //verificando se o estoque existe
        const estoque = await prisma.estoque.findFirst({
            where: {
                produtoId: dados.produtoId,
                propriedadeId: dados.propriedadeId,
            },
        });

        if (!estoque) {
            res.status(404).json({ error: "Estoque não encontrado no estoque da propriedade" });
            return;
        }

        if (estoque.quantidade < dados.quantidade) {
            res.status(400).json({ error: "Quantidade insuficiente no estoque" });
            return;
        }

        //Atualizando a quantidade do estoque
        const atualizandoEstoque = await prisma.estoque.update({
            where: { id: estoque.id },
            data: { quantidade: estoque.quantidade - dados.quantidade }
        });

        //movimentacao de saida
        await prisma.movimentacao.create({
            data: {
                estoqueId: estoque.id,
                tipo: "SAIDA",
                quantidade: dados.quantidade,
                produtoStatus: atualizandoEstoque.quantidade > 0 ? "ATIVO" : "ESGOTADO",
            },
        });

        res.status(200).json({ message: "Saída de produto realizada com sucesso", estoqueAtualizado: atualizandoEstoque });
    } catch (error) {
        console.error("Erro ao registrar saída de produto: ", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};