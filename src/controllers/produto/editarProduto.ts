import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/database";
import { editarProdutoDto } from "../../dtos/editarProdutoDto";
import { parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { ZodError } from "zod";

export interface EditarProdutoParams {
    produtoId: string;
    propriedadeId: string;
}

export interface EditarProdutoBody {
    nome: string;
    embalagem: string;
    validade?: string;
}

export const editarProduto = async (
    request: AuthenticatedRequest<{
        Params: EditarProdutoParams;
        Body: EditarProdutoBody;
    }>,
    reply: FastifyReply
) => {
    try {
        const produtoId = Number(request.params.produtoId);
        const propriedadeId = Number(request.params.propriedadeId);
        const dados = editarProdutoDto.parse(request.body);

        if (isNaN(produtoId)) {
            return reply.code(400).send({ error: "ID do produto inválido." });
        }

        const produtoExistente = await prisma.produto.findUnique({
            where: { id: produtoId }
        });

        if (!produtoExistente) {
            return reply.code(404).send({ error: "Produto não encontrado" });
        }

        const estoqueDoProduto = await prisma.estoque.findFirst({
            where: {
                produtoId,
                propriedadeId,
                propriedade: {
                    usuarioId: request.usuarioId
                }
            },
            include: { propriedade: true },
        });

        if (!estoqueDoProduto || estoqueDoProduto.propriedade.usuarioId !== request.usuarioId) {
            return reply.code(403).send({ error: "Acesso negado. Você não tem permissão para editar este produto." });
        }

        const produtoAtualizado = await prisma.produto.update({
            where: { id: produtoId },
            data: {
                nome: dados.nome,
                embalagem: dados.embalagem,
                validade: dados.validade
                    ? parse(dados.validade, "dd/MM/yyyy", new Date(), { locale: ptBR })
                    : produtoExistente.validade,
            }
        });

        return reply.code(200).send({
            message: "Produto atualizado com sucesso",
            produto: produtoAtualizado
        });
    } catch (error: unknown) {
        console.error("Erro ao editar produto:", error);

        if (error instanceof ZodError) {
            return reply.code(400).send({ error: "Dados inválidos na requisição", details: error.errors });
        }

        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
