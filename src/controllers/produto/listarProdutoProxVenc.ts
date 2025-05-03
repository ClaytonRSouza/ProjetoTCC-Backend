import { addMonths, format, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { FastifyReply } from "fastify";
import { prisma } from "../../config/database";

export const listarProdutosProxVenc = async (
    request: AuthenticatedRequest,
    reply: FastifyReply
) => {
    try {
        if (!request.usuarioId) {
            return reply.code(401).send({ error: "Usuário não autenticado." });
        }

        const hoje = new Date();
        const limite = addMonths(hoje, 6);

        const produtos = await prisma.produto.findMany({
            where: {
                validade: {
                    lte: limite, // Inclui vencidos e os que vencem até 6 meses
                },
                estoque: {
                    some: {
                        quantidade: { gt: 0 },
                        propriedade: {
                            usuarioId: request.usuarioId,
                        },
                    },
                },
            },
            include: {
                estoque: {
                    where: {
                        quantidade: { gt: 0 },
                        propriedade: {
                            usuarioId: request.usuarioId,
                        },
                    },
                    include: {
                        propriedade: true,
                    },
                },
            },
            orderBy: {
                validade: "asc", // Ordena por data de vencimento (mais antiga primeiro)
            },
        });

        return reply.code(200).send({
            produtos: produtos.map((prod) => ({
                id: prod.id,
                nome: prod.nome,
                validade: format(prod.validade!, "dd/MM/yyyy", { locale: ptBR }),
                vencido: isBefore(prod.validade!, hoje),
                propriedades: prod.estoque.map((e) => ({
                    propriedade: e.propriedade.nome,
                    quantidade: e.quantidade,
                })),
            })),
        });
    } catch (error) {
        console.error("Erro ao buscar produtos próximos ou vencidos:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
