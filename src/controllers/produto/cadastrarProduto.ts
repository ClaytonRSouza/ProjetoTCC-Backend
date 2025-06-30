import { FastifyReply } from "fastify";
import { prisma } from "../../config/database";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { produtoDto } from "../../dtos/cadastroProdutoDto";
import { parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ZodError } from "zod";

export const cadastrarProduto = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const dados = produtoDto.parse(request.body);
        const dataValidade = parse(dados.validade, "dd/MM/yyyy", new Date(), { locale: ptBR });
        if (!isValid(dataValidade)) {
            return reply.code(400).send({ error: "Data de validade incorreta" });
        }

        // Verifica se a propriedade está correta, conforme o id do usuário
        const propriedade = await prisma.propriedade.findFirst({
            where: {
                id: dados.propriedadeId,
                usuarioId: request.usuarioId
            }
        });

        if (!propriedade) {
            return reply.code(404).send({ error: "Propriedade não encontrada" });
        }

        // Verifica se o produto já existe (mesmo nome, validade e embalagem)
        const produtoExistente = await prisma.produto.findFirst({
            where: {
                nome: { equals: dados.nome, mode: "insensitive" },
                validade: dataValidade,
                embalagem: dados.embalagem
            }
        });

        let produtoId: number;
        let produto;

        if (produtoExistente) {
            produtoId = produtoExistente.id;
            produto = produtoExistente;
        } else {
            const novoProduto = await prisma.produto.create({
                data: {
                    nome: dados.nome,
                    validade: dataValidade,
                    embalagem: dados.embalagem
                }
            });
            produtoId = novoProduto.id;
            produto = novoProduto;
        }

        // Verifica se já existe estoque desse produto nessa propriedade
        const estoqueExistente = await prisma.estoque.findFirst({
            where: {
                produtoId,
                propriedadeId: dados.propriedadeId
            }
        });

        let estoque;

        if (estoqueExistente) {
            // Atualiza a quantidade no estoque existente
            estoque = await prisma.estoque.update({
                where: { id: estoqueExistente.id },
                data: {
                    quantidade: { increment: dados.quantidade }
                }
            });

            // Gera nova movimentação de entrada
            await prisma.movimentacao.create({
                data: {
                    estoqueId: estoque.id,
                    tipo: "ENTRADA",
                    quantidade: dados.quantidade,
                    produtoStatus: "ATIVO"
                }
            });
        } else {
            // Cria novo estoque
            estoque = await prisma.estoque.create({
                data: {
                    quantidade: dados.quantidade,
                    produtoId,
                    propriedadeId: dados.propriedadeId
                }
            });

            await prisma.movimentacao.create({
                data: {
                    estoqueId: estoque.id,
                    tipo: "ENTRADA",
                    quantidade: dados.quantidade,
                    produtoStatus: "ATIVO"
                }
            });
        }

        return reply.code(201).send({ produto, estoque });

    } catch (error) {
        if (error instanceof ZodError) {
            const erros = error.errors.map((err) => ({
                campo: err.path.join('.'),
                mensagem: err.message,
            }));
            return reply.code(400).send({ erros });
        }

        console.error("Erro ao cadastrar produto:", error);
        return reply.code(500).send({ error: "Erro interno do servidor" });
    }
};
