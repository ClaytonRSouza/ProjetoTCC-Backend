import admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Carrega as variaveis de ambiente do arquivo .env
dotenv.config();

// Verifica se o arquivo de credenciais do Firebase existe
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS as string;

if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    throw new Error("Arquivo de credenciais do Firebase não encontrado!");
}


const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Inicializa o Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;
