import { FastifyInstance } from "fastify";
import { registerUser, loginUser, changePassword } from "../controllers/usuario/authController";
import { cadastroPropriedade } from "../controllers/usuario/cadastroPropriedade";
import { verificarToken } from "../middlewares/authMiddleware";
import { listarPropriedades } from "../controllers/usuario/listarPropriedades";
import { solicitarResetSenha } from "../controllers/usuario/solicitarResetSenha";
import { editarPerfil } from "../controllers/usuario/editarPerfil";
import { buscarPerfil } from "../controllers/usuario/buscarPerfil";

export default async function authRoutes(app: FastifyInstance) {
    //público
    app.post("/register", registerUser);
    app.post("/login", loginUser);
    app.post("/auth/solicitar-reset-senha", solicitarResetSenha);

    //privadas
    app.put("/change-password", { preHandler: [verificarToken] }, changePassword);
    app.post("/propriedade", { preHandler: [verificarToken] }, cadastroPropriedade);
    app.get("/propriedades", { preHandler: [verificarToken] }, listarPropriedades);
    app.put("/perfil", { preHandler: [verificarToken] }, editarPerfil);
    app.get("/perfil", { preHandler: [verificarToken] }, buscarPerfil)

}
