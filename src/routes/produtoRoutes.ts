import express from "express";
import { cadastrarProduto } from "../controllers/produto/cadastrarProduto";
import { listarProdutos } from "../controllers/produto/listarProduto";
import { saidaProduto } from "../controllers/produto/saidaProduto";
import { listarMovimentacao } from "../controllers/produto/listarMovimentacao";

const router = express.Router();

router.post("/cadastrar", cadastrarProduto);
router.get("/produtos", listarProdutos);
router.post("/saida", saidaProduto);
router.get("/movimentacao", listarMovimentacao)


export default router;
