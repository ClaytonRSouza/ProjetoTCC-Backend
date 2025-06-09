import { FastifyRequest, FastifyReply } from "fastify";
import admin from "../../config/firebaseAdmin";

export const solicitarResetSenha = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email } = request.body as { email: string };

        if (!email) {
            return reply.status(400).send({ error: "E-mail é obrigatório." });
        }

        const link = await admin.auth().generatePasswordResetLink(email);
        return reply.send({ message: "Link enviado para o e-mail cadastrado.", link });
    } catch (error) {
        console.error("Erro ao gerar link de redefinição:", error);
        return reply.status(500).send({ error: "Erro ao enviar redefinição de senha" });
    }
};
