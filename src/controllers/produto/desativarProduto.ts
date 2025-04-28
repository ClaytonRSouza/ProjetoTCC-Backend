import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/database";
import { desativarProdutoDto } from "../../dtos/desativarProdutoDto";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { TipoMovimentacao } from "@prisma/client";

export interface DesativarProdutoMovimentacaoParams {
    id: string;
}

export interface DesativarProdutoMovimentacaoBody {
    justificativa: string;
}

export const desativarProdutoMovimentacao = async (
    request: AuthenticatedRequest<{
        Params: DesativarProdutoMovimentacaoParams;
        Body: DesativarProdutoMovimentacaoBody;
    }>,
    reply: FastifyReply
) => {
    try {
        const movimentacaoId = Number(request.params.id);
        const { justificativa } = desativarProdutoDto.parse(request.body);

        if (isNaN(movimentacaoId)) {
            return reply.code(400).send({ error: "ID da movimentação inválido." });
        }

        if (!request.usuarioId) {
            return reply.code(401).send({ error: "Usuário não autenticado corretamente." });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const movimentacao = await tx.movimentacao.findUnique({
                where: { id: movimentacaoId },
                include: {
                    estoque: {
                        include: {
                            propriedade: true
                        }
                    }
                }
            });

            if (!movimentacao) {
                throw new Error("MOVIMENTACAO_NAO_ENCONTRADA");
            }

            if (movimentacao.tipo !== TipoMovimentacao.ENTRADA) {
                throw new Error("TIPO_INVALIDO");
            }

            if (!movimentacao.estoque || !movimentacao.estoque.propriedade) {
                throw new Error("INTEGRIDADE_DADOS");
            }

            if (movimentacao.estoque.propriedade.usuarioId !== request.usuarioId) {
                throw new Error("PERMISSAO_NEGADA");
            }

            const estoqueAtualizado = await tx.estoque.update({
                where: { id: movimentacao.estoque.id },
                data: { quantidade: 0 }
            });

            const movDesativacao = await tx.movimentacao.create({
                data: {
                    estoqueId: estoqueAtualizado.id,
                    tipo: TipoMovimentacao.DESATIVACAO,
                    quantidade: movimentacao.quantidade,
                    produtoStatus: "DESATIVADO",
                    justificativa: justificativa,
                }
            });

            await tx.movimentacao.update({
                where: { id: movimentacaoId },
                data: { produtoStatus: "DESATIVADO" }
            });

            return { estoqueAtualizado, movDesativacao };
        });

        return reply.code(200).send({
            message: "Produto desativado com sucesso (Estoque zerado e movimentação registrada)",
            estoqueAtualizado: resultado.estoqueAtualizado,
            movimentacaoDesativacao: resultado.movDesativacao,
        });

    } catch (error: any) {
        console.error("Erro ao desativar produto:", error);

        if (error.message === "MOVIMENTACAO_NAO_ENCONTRADA") {
            return reply.code(404).send({ error: "Movimentação não encontrada" });
        }
        if (error.message === "TIPO_INVALIDO") {
            return reply.code(400).send({ error: "Apenas movimentações de ENTRADA podem ser desativadas desta forma" });
        }
        if (error.message === "INTEGRIDADE_DADOS") {
            return reply.code(500).send({ error: "Erro de integridade nos dados relacionados." });
        }
        if (error.message === "PERMISSAO_NEGADA") {
            return reply.code(403).send({ error: "Permissão negada. Você não tem acesso a este recurso." });
        }
        if (error.name === 'ZodError') {
            return reply.code(400).send({ error: "Dados inválidos na requisição", details: error.errors });
        }

        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
