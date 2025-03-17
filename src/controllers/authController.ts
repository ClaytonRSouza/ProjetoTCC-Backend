import admin from "../config/firebaseAdmin";
import { prisma } from "../config/database";
import { usuarioDto } from "../dtos/usuarioDto";
import { RequestHandler } from "express";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// cadastro de usuários
export const registerUser: RequestHandler = async (req, res) => {
    try {
        // validação dos dados da requisição 
        const dados = usuarioDto.parse(req.body);

        // criação do usuário no firebase
        const firebaseUser = await admin.auth().createUser({
            email: dados.email,
            password: dados.senha,
            displayName: dados.nome,
        });

        // armazenamento do usuário no banco de dados
        const newUser = await prisma.usuario.create({
            data: {
                firebaseUid: firebaseUser.uid,
                nome: dados.nome,
                email: dados.email,
                propriedades: {
                    create: dados.propriedade,
                },
            },
        });

        res.status(201).json({ message: "Usuário cadastrado com sucesso!", uid: firebaseUser.uid });
    } catch (error) {
        res.status(400).json({ error: "Erro ao cadastrar usuário" });

    }
};


// login de usuários
export const loginUser: RequestHandler = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Autentica o usuário no Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Obtém o token ID gerado pelo Firebase Auth
        const token = await user.getIdToken();

        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: "Credenciais inválidas" });
    }
};

// alteração de senha do usuário
export const changePassword: RequestHandler = async (req, res) => {
    try {
        console.log("Requisição recebida para alterar senha");

        const { newPassword } = req.body;
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            console.log("Nenhum token foi enviado");
            res.status(401).json({ error: "Token não fornecido" });
            return;
        }

        const token = authorizationHeader.split(" ")[1];

        console.log("Token recebido:", token);

        // Verifica e decodifica o token para obter o UID
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log("Token decodificado. UID:", decodedToken.uid);

        await admin.auth().updateUser(decodedToken.uid, { password: newPassword });

        console.log("Senha alterada com sucesso!");
        res.json({ message: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({ error: "Erro ao alterar senha" });
    }
};

