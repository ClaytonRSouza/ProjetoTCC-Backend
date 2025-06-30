import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const listarProdutosPorPropriedade = async (
    request: AuthenticatedRequest<{ Params: { propriedadeId: string } }>,
    reply: FastifyReply
) => {
    try {
        const propriedadeId = Number(request.params.propriedadeId);

        if (isNaN(propriedadeId)) {
            return reply.code(400).send({ error: "ID da propriedade inválido." });
        }

        if (!request.usuarioId) {
            return reply.code(401).send({ error: "Usuário não autenticado corretamente." });
        }

        //consulta e verifica se a propriedade existe
        const propriedade = await prisma.propriedade.findUnique({
            where: { id: propriedadeId },
        });

        if (!propriedade || propriedade.usuarioId !== request.usuarioId) {
            return reply.code(403).send({ error: "Você não tem acesso a esta propriedade." });
        }

        //consulta os produtos da propriedade
        const estoque = await prisma.estoque.findMany({
            where: {
                propriedadeId: propriedadeId,
                quantidade: { gt: 0 },
            },
            include: {
                produto: true,
                movimentacoes: {
                    where: {
                        tipo: 'ENTRADA',
                    },
                    orderBy: {
                        data: 'desc',
                    },
                    take: 1,
                },
            },
        });

        //mapeia os dados com as informações necessárias
        const produtos = estoque.map((item) => ({
            idEstoque: item.id,
            idProduto: item.produto.id,
            nome: item.produto.nome,
            embalagem: item.produto.embalagem,
            validade: format(item.produto.validade, 'dd/MM/yyyy', { locale: ptBR }),
            quantidade: item.quantidade,
            movimentacaoId: item.movimentacoes[0]?.id ?? null, // necessário para desativação
        }));


        return reply.code(200).send({ produtos });
    } catch (error) {
        console.error("Erro ao listar produtos por propriedade:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
