import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { prisma } from "../../config/database";
import admin from "../../config/firebaseAdmin";

interface EditarPerfilBody {
    nome?: string;
    email?: string;
}

export const editarPerfil = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        // Verifica se o usuário está autenticado 
        const { nome, email } = (request.body as EditarPerfilBody) ?? {};

        if (!request.usuarioId) {
            return reply.status(401).send({ error: "Usuário não autenticado." });
        }

        // Verifica se o usuário existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: request.usuarioId },
        });

        if (!usuario) {
            return reply.status(404).send({ error: "Usuário não encontrado." });
        }

        // Atualiza o perfil do usuário
        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                nome: nome ?? usuario.nome,
                email: email ?? usuario.email,
            },
        });

        //// Atualiza o email do usuário no Firebase
        if (email && email !== usuario.email) {
            await admin.auth().updateUser(usuario.firebaseUid, { email });
        }

        return reply.send({
            message: "Perfil atualizado com sucesso!",
            usuario: usuarioAtualizado,
        });
    } catch (error) {
        console.error("Erro ao editar perfil:", error);
        return reply.status(500).send({ error: "Erro ao editar perfil" });
    }
};
