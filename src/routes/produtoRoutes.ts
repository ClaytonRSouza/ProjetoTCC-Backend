import { FastifyInstance } from "fastify";
import { verificarToken } from "../middlewares/authMiddleware";
import { cadastrarProduto } from "../controllers/produto/cadastrarProduto";
import { listarProdutosPorPropriedade } from "../controllers/produto/listarProduto";
import { saidaProduto } from "../controllers/produto/saidaProduto";
import { listarMovimentacao } from "../controllers/produto/listarMovimentacao";
import { editarProduto, EditarProdutoParams, EditarProdutoBody } from "../controllers/produto/editarProduto";
import { desativarProdutoMovimentacao, DesativarProdutoMovimentacaoParams, DesativarProdutoMovimentacaoBody } from "../controllers/produto/desativarProduto";
import { relatorioEstoqueGeral } from "../controllers/produto/relatorioEstoqueGeral";
import { relatorioMovimentacoes } from "../controllers/produto/relatorioMovimentacoes";
import { listarProdutosProxVenc } from "../controllers/produto/listarProdutoProxVenc";

export default async function produtoRoutes(app: FastifyInstance) {
    app.addHook("preHandler", verificarToken);

    app.post("/cadastrar", cadastrarProduto);

    app.get<{
        Params: { propriedadeId: string };
    }>("/:propriedadeId", listarProdutosPorPropriedade);

    app.post("/saida", saidaProduto);

    app.get("/movimentacao", listarMovimentacao);

    app.put<{
        Params: EditarProdutoParams;
        Body: EditarProdutoBody;
    }>("/:propriedadeId/:produtoId", editarProduto);

    app.patch<{
        Params: DesativarProdutoMovimentacaoParams;
        Body: DesativarProdutoMovimentacaoBody;
    }>("/movimentacao/:movimentacaoId/:propriedadeId", desativarProdutoMovimentacao);

    app.get("/alertas-vencimento", listarProdutosProxVenc);

    app.get("/relatorio-geral", relatorioEstoqueGeral);

    app.get("/relatorio-movimentacoes", relatorioMovimentacoes);
}
