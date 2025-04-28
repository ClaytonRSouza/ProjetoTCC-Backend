import { FastifyRequest, FastifyReply, RouteGenericInterface } from "fastify";
import admin from "../config/firebaseAdmin";
import { prisma } from "../config/database";

export interface AuthenticatedRequest<T extends RouteGenericInterface = {}> extends FastifyRequest<T> {
    uid?: string;
    usuarioId?: number;
}

export const verificarToken = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        reply.code(401).send({ error: "Token não fornecido" });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        request.uid = decodedToken.uid;

        const usuario = await prisma.usuario.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });

        if (!usuario) {
            reply.code(401).send({ error: "Usuário não encontrado no banco" });
            return;
        }

        request.usuarioId = usuario.id;
    } catch (error) {
        reply.code(401).send({ error: "Token inválido" });
    }
};
