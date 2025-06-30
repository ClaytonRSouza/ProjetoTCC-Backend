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

        // Verifica se o usuário já existe
        const firebaseUser = await admin.auth().createUser({
            email: dados.email,
            password: dados.senha,
            displayName: dados.nome,
        });

        // Cria o usuário no banco de dados
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

        // busca no banco o nome do usuário pelo UID
        const usuario = await prisma.usuario.findUnique({
            where: { firebaseUid: user.uid },
            select: { nome: true }
        });

        if (!usuario) {
            return reply.status(404).send({ error: 'Usuário não encontrado no banco.' });
        }

        reply.send({ token, nome: usuario.nome });
    } catch (error) {
        reply.status(401).send({ error: 'Credenciais inválidas' });
    }
};

