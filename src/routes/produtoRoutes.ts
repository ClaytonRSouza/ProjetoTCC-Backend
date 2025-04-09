import express from "express";
import { cadastrarProduto } from "../controllers/produto/cadastrarProduto";
import { listarProdutos } from "../controllers/produto/listarProduto";
import { saidaProduto } from "../controllers/produto/saidaProduto";
import { listarMovimentacao } from "../controllers/produto/listarMovimentacao";
import { editarProduto } from "../controllers/produto/editarProduto";
import { desativarProduto } from "../controllers/produto/desativarProduto";
import { relatorioVencimento } from "../controllers/produto/relatorioVencimento";
import { relatorioEstoqueGeral } from "../controllers/produto/relatorioEstoqueGeral";

const router = express.Router();

router.post("/cadastrar", cadastrarProduto);
router.get("/produtos", listarProdutos);
router.post("/saida", saidaProduto);
router.get("/movimentacao", listarMovimentacao)
router.put("/:id", editarProduto);
router.patch("/movimentacao/:id", desativarProduto);
router.get("/relatorio-vencimentos", relatorioVencimento);
router.get("/relatorio-geral", relatorioEstoqueGeral);


export default router;
