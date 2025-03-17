import express, { Application } from "express";
import authRoutes from "./routes/authRoutes";

const app: Application = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
