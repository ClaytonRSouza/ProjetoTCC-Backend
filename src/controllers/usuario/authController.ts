import { FastifyRequest, FastifyReply } from "fastify";
import admin from "../../config/firebaseAdmin";
import { prisma } from "../../config/database";
import { usuarioDto } from "../../dtos/usuarioDto";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

// Cadastro de usuários
export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const dados = usuarioDto.parse(request.body);

        const firebaseUser = await admin.auth().createUser({
            email: dados.email,
            password: dados.senha,
            displayName: dados.nome,
        });

        await prisma.usuario.create({
            data: {
                firebaseUid: firebaseUser.uid,
                nome: dados.nome,
                email: dados.email,
                propriedades: {
                    create: dados.propriedade,
                },
            },
        });

        reply.status(201).send({ message: "Usuário cadastrado com sucesso!", uid: firebaseUser.uid });
    } catch (error) {
        reply.status(400).send({ error: "Erro ao cadastrar usuário" });
    }
};

// Login de usuários
export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, senha } = request.body as { email: string; senha: string };

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        const token = await user.getIdToken();

        reply.send({ token });
    } catch (error) {
        reply.status(401).send({ error: "Credenciais inválidas" });
    }
};

// Alteração de senha do usuário
export const changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log("Requisição recebida para alterar senha");

        const { newPassword } = request.body as { newPassword: string };
        const authorizationHeader = request.headers.authorization;

        if (!authorizationHeader) {
            console.log("Nenhum token foi enviado");
            reply.status(401).send({ error: "Token não fornecido" });
            return;
        }

        const token = authorizationHeader.split(" ")[1];

        console.log("Token recebido:", token);

        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log("Token decodificado. UID:", decodedToken.uid);

        await admin.auth().updateUser(decodedToken.uid, { password: newPassword });

        console.log("Senha alterada com sucesso!");
        reply.send({ message: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        reply.status(500).send({ error: "Erro ao alterar senha" });
    }
};
