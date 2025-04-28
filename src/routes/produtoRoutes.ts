import { FastifyInstance } from "fastify";
import { verificarToken } from "../middlewares/authMiddleware";
import { cadastrarProduto } from "../controllers/produto/cadastrarProduto";
import { listarProdutos } from "../controllers/produto/listarProduto";
import { saidaProduto } from "../controllers/produto/saidaProduto";
import { listarMovimentacao } from "../controllers/produto/listarMovimentacao";
import { editarProduto, EditarProdutoParams, EditarProdutoBody } from "../controllers/produto/editarProduto";
import { desativarProdutoMovimentacao, DesativarProdutoMovimentacaoParams, DesativarProdutoMovimentacaoBody } from "../controllers/produto/desativarProduto";
import { relatorioVencimento } from "../controllers/produto/relatorioVencimento";
import { relatorioEstoqueGeral } from "../controllers/produto/relatorioEstoqueGeral";

export default async function produtoRoutes(app: FastifyInstance) {
    app.addHook("preHandler", verificarToken);

    app.post("/cadastrar", cadastrarProduto);
    app.get("/produtos", listarProdutos);
    app.post("/saida", saidaProduto);
    app.get("/movimentacao", listarMovimentacao);

    app.put<{
        Params: EditarProdutoParams;
        Body: EditarProdutoBody;
    }>("/:id", editarProduto);

    app.patch<{
        Params: DesativarProdutoMovimentacaoParams;
        Body: DesativarProdutoMovimentacaoBody;
    }>("/movimentacao/:id", desativarProdutoMovimentacao);

    app.get("/relatorio-vencimentos", relatorioVencimento);
    app.get("/relatorio-geral", relatorioEstoqueGeral);
}
