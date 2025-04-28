import { FastifyReply } from "fastify";
import { prisma } from "../../config/database";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { produtoDto } from "../../dtos/cadastroProdutoDto";
import { parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export const cadastrarProduto = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const dados = produtoDto.parse(request.body);
        const dataValidade = parse(dados.validade, "dd/MM/yyyy", new Date(), { locale: ptBR });

        if (!isValid(dataValidade)) {
            return reply.code(400).send({ error: "Data de validade incorreta" });
        }

        const propriedade = await prisma.propriedade.findFirst({
            where: {
                id: dados.propriedadeId,
                usuarioId: request.usuarioId // <-- Aqui usando o usuarioId validado
            }
        });

        if (!propriedade) {
            return reply.code(404).send({ error: "Propriedade não encontrada" });
        }

        const produto = await prisma.produto.create({
            data: {
                nome: dados.nome,
                embalagem: dados.embalagem,
                validade: dataValidade
            }
        });

        const estoque = await prisma.estoque.create({
            data: {
                quantidade: dados.quantidade,
                produtoId: produto.id,
                propriedadeId: dados.propriedadeId
            }
        });

        await prisma.movimentacao.create({
            data: {
                estoqueId: estoque.id,
                tipo: "ENTRADA",
                quantidade: dados.quantidade,
                produtoStatus: "ATIVO",
            }
        });

        return reply.code(201).send({ produto, estoque });

    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
