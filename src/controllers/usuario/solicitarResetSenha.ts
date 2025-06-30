import { FastifyRequest, FastifyReply } from "fastify";
import admin from "../../config/firebaseAdmin";
import { z } from "zod";

const emailSchema = z.object({
    email: z.string().email("E-mail inválido"),
});

//função está em fase de testes, devido a biblioteca do firebase
export const solicitarResetSenha = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email } = request.body as { email: string };

        if (!email) {
            return reply.status(400).send({ error: "E-mail é obrigatório." });
        }

        const link = await admin.auth().generatePasswordResetLink(email);

        return reply.send({ message: "Link enviado com sucesso!", link });
    } catch (error) {
        console.error("Erro ao gerar link de redefinição:", error);
        return reply.status(500).send({ error: "Erro ao enviar redefinição de senha" });
    }
};