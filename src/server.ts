import Fastify from "fastify";
import authRoutes from "./routes/authRoutes";
import produtoRoutes from "./routes/produtoRoutes";

const app = Fastify();

app.register(authRoutes, { prefix: "/auth" });
app.register(produtoRoutes, { prefix: "/produto" });

app.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Servidor rodando em ${address}`);
});
