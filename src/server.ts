import Fastify from "fastify";
import authRoutes from "./routes/authRoutes";
import produtoRoutes from "./routes/produtoRoutes";

const app = Fastify();

// Registra plugins se quiser CORS, JWT, etc.
// Exemplo: await app.register(cors, { origin: '*' });

app.register(authRoutes, { prefix: "/auth" });
app.register(produtoRoutes, { prefix: "/produto" });

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Servidor rodando em ${address}`);
});
