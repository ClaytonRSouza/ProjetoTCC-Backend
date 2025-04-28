import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/database";
import admin from "../../config/firebaseAdmin";
import { propriedadeDto } from "../../dtos/cadastroPropriedadeDto";

export const cadastroPropriedade = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const dados = propriedadeDto.parse(request.body);

        const authorizationHeader = request.headers.authorization;
        if (!authorizationHeader) {
            reply.status(401).send({ error: "Token de autorização não fornecido." });
            return;
        }

        const token = authorizationHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid;

        const usuario = await prisma.usuario.findUnique({
            where: { firebaseUid: firebaseUid }
        });

        if (!usuario) {
            reply.status(404).send({ error: "Usuário não encontrado." });
            return;
        }

        const novaPropriedade = await prisma.propriedade.create({
            data: {
                nome: dados.nome,
                usuarioId: usuario.id,
            }
        });

        reply.status(201).send({ message: "Propriedade cadastrada com sucesso!", propriedade: novaPropriedade });
    } catch (error) {
        console.error("Erro ao cadastrar propriedade:", error);
        reply.status(500).send({ error: "Erro ao cadastrar propriedade" });
    }
};
