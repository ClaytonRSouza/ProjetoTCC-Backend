import { FastifyRequest, FastifyReply } from "fastify";
import admin from "../../config/firebaseAdmin";
import { z } from "zod";

const emailSchema = z.object({
    email: z.string().email("E-mail inválido"),
});

export const solicitarResetSenha = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email } = emailSchema.parse(request.body);

        const link = await admin.auth().generatePasswordResetLink(email);

        console.log("Link gerado:", link);

        return reply.send({
            message: "E-mail enviado com sucesso.",
            link,
        });

    } catch (error: any) {
        console.error("Erro ao gerar link de redefinição:", error);

        if (error.code === 'auth/user-not-found') {
            return reply.status(404).send({ error: "Usuário não encontrado." });
        }

        return reply.status(500).send({ error: "Erro ao enviar redefinição de senha." });
    }
};
