import { RequestHandler } from "express";
import { prisma } from "../../config/database";
import { produtoDto } from "../../dtos/cadastroProdutoDto";
import { isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";


export const cadastrarProduto: RequestHandler = async (req, res) => {
    try {
        const dados = produtoDto.parse(req.body);
        const dataValidade = parse(dados.validade, "dd/MM/yyyy", new Date(), { locale: ptBR });

        if (!isValid(dataValidade)) {
            res.status(400).json({ error: "Data de validade incorreta" });
            return;
        }

        //verificando se a propriedade existe
        const propriedade = await prisma.propriedade.findUnique({
            where: { id: dados.propriedadeId }
        })

        if (!propriedade) {
            res.status(404).json({ error: "Propriedade não encontrada" });
            return;
        }



        //criando produto
        const produto = await prisma.produto.create({
            data: {
                nome: dados.nome,
                embalagem: dados.embalagem,
                validade: dataValidade
            }
        });

        //adicionando produto no estoque da propriedade
        const estoque = await prisma.estoque.create({
            data: {
                quantidade: dados.quantidade,
                produtoId: produto.id,
                propriedadeId: dados.propriedadeId
            }
        })

        //movimentacao de entrada
        await prisma.movimentacao.create({
            data: {
                estoqueId: estoque.id,
                tipo: "ENTRADA",
                quantidade: dados.quantidade,
                produtoStatus: "ATIVO",
            }

        });

        res.status(201).json({ produto, estoque });
    } catch (error) {
        console.error("Erro ao cadastrar produto: ", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}