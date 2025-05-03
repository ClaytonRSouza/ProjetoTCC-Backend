import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../config/database";
import { saidaProdutoDto } from "../../dtos/saidaProdutoDto";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";

export const saidaProduto = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const dados = saidaProdutoDto.parse(request.body);

        // Verificando se o estoque existe
        const estoque = await prisma.estoque.findFirst({
            where: {
                produtoId: dados.produtoId,
                propriedadeId: dados.propriedadeId,
                propriedade: {
                    usuarioId: request.usuarioId,
                }
            },
        });

        if (!estoque) {
            return reply.code(404).send({ error: "Estoque não encontrado no estoque da propriedade" });
        }

        if (estoque.quantidade < dados.quantidade) {
            return reply.code(400).send({ error: "Quantidade insuficiente no estoque" });
        }

        // Atualizando a quantidade do estoque
        const atualizandoEstoque = await prisma.estoque.update({
            where: { id: estoque.id },
            data: { quantidade: estoque.quantidade - dados.quantidade },
        });

        // Movimentação de saída
        await prisma.movimentacao.create({
            data: {
                estoqueId: estoque.id,
                tipo: "SAIDA",
                quantidade: dados.quantidade,
                produtoStatus: atualizandoEstoque.quantidade > 0 ? "ATIVO" : "ESGOTADO",
            },
        });

        return reply.code(200).send({
            message: "Saída de produto realizada com sucesso",
            estoqueAtualizado: atualizandoEstoque,
        });
    } catch (error) {
        console.error("Erro ao registrar saída de produto: ", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};