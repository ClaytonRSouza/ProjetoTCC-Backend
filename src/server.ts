import express, { Application } from "express";
import authRoutes from "./routes/authRoutes";
import produtoRoutes from "./routes/produtoRoutes";

const app: Application = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/produto", produtoRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
