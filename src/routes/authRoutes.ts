import { FastifyInstance } from "fastify";
import { registerUser, loginUser, changePassword } from "../controllers/usuario/authController";
import { cadastroPropriedade } from "../controllers/usuario/cadastroPropriedade";
import { verificarToken } from "../middlewares/authMiddleware";
import { listarPropriedades } from "../controllers/usuario/listarPropriedades";

export default async function authRoutes(app: FastifyInstance) {
    //público
    app.post("/register", registerUser);
    app.post("/login", loginUser);

    //privadas
    app.put("/change-password", { preHandler: [verificarToken] }, changePassword);
    app.post("/propriedade", { preHandler: [verificarToken] }, cadastroPropriedade);
    app.get("/propriedades", { preHandler: [verificarToken] }, listarPropriedades);
}
