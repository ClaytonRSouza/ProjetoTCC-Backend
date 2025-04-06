import { RequestHandler } from "express";
import { prisma } from "../../config/database";
import { editarProdutoDto } from "../../dtos/editarProdutoDto";
import { parse } from "date-fns";
import { ptBR } from "date-fns/locale";


export const editarProduto: RequestHandler = async (req, res) => {
    try {
        const produtoId = Number(req.params.id);
        const dados = editarProdutoDto.parse(req.body);

        //verificar se o produto existe
        const produtoExistente = await prisma.produto.findUnique({ where: { id: produtoId } });
        if (!produtoExistente) {
            res.status(404).json({ error: "Produto não encontrado" });
            return;
        }

        //atualizar o produto
        const produtoAtualizado = await prisma.produto.update({
            where: { id: produtoId },
            data: {
                nome: dados.nome,
                embalagem: dados.embalagem,
                validade: dados.validade
                    ? parse(dados.validade, "dd/MM/yyyy", new Date(), { locale: ptBR })
                    : produtoExistente?.validade,
            }
        });

        res.status(200).json({ message: "Produto atualizado com sucesso", produto: produtoAtualizado });
    } catch (error) {
        console.error("Erro ao editar produto: ", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};