import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/database";
import { desativarProdutoDto } from "../../dtos/desativarProdutoDto";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { TipoMovimentacao } from "@prisma/client";
import { ZodError } from "zod";

export interface DesativarProdutoMovimentacaoParams {
    movimentacaoId: string;
    propriedadeId: string;
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
        const movimentacaoId = Number(request.params.movimentacaoId);
        const propriedadeId = Number(request.params.propriedadeId);
        const { justificativa } = desativarProdutoDto.parse(request.body);

        if (isNaN(movimentacaoId) || isNaN(propriedadeId)) {
            return reply.code(400).send({ error: "IDs inválidos." });
        }

        if (!request.usuarioId) {
            return reply.code(401).send({ error: "Usuário não autenticado." });
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

            //validações padrões
            if (!movimentacao) throw new Error("MOVIMENTACAO_NAO_ENCONTRADA");
            if (movimentacao.tipo !== TipoMovimentacao.ENTRADA) throw new Error("TIPO_INVALIDO");
            if (!movimentacao.estoque || !movimentacao.estoque.propriedade) throw new Error("INTEGRIDADE_DADOS");
            if (movimentacao.estoque.propriedade.id !== propriedadeId) throw new Error("PROPRIEDADE_INCORRETA");
            if (movimentacao.estoque.propriedade.usuarioId !== request.usuarioId) throw new Error("PERMISSAO_NEGADA");
            if (movimentacao.produtoStatus === "DESATIVADO") throw new Error("JA_DESATIVADO");
            if (movimentacao.estoque.quantidade === 0) throw new Error("ESTOQUE_JA_ZERADO");

            //atualiza o estoque
            const estoqueAtualizado = await tx.estoque.update({
                where: { id: movimentacao.estoque.id },
                data: { quantidade: 0 }
            });

            //atualiza o status da movimentação
            const movDesativacao = await tx.movimentacao.create({
                data: {
                    estoqueId: estoqueAtualizado.id,
                    tipo: TipoMovimentacao.DESATIVACAO,
                    quantidade: movimentacao.quantidade,
                    produtoStatus: "DESATIVADO",
                    justificativa,
                }
            });

            await tx.movimentacao.update({
                where: { id: movimentacaoId },
                data: { produtoStatus: "DESATIVADO" }
            });

            return { estoqueAtualizado, movDesativacao };
        });

        return reply.code(200).send({
            message: "Produto desativado com sucesso.",
            estoqueAtualizado: resultado.estoqueAtualizado,
            movimentacaoDesativacao: resultado.movDesativacao,
        });

    } catch (error) {
        if (error instanceof ZodError) {
            const erros = error.errors.map((err) => ({
                campo: err.path.join('.'),
                mensagem: err.message,
            }));
            return reply.code(400).send({ erros });
        }

        console.error("Erro ao desativar produto:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};

